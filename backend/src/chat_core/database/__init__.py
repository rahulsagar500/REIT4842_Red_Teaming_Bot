import pandas as pd
from uuid import UUID

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.engine import URL
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker, scoped_session, class_mapper
from sqlalchemy.orm.attributes import InstrumentedAttribute
from sqlalchemy.sql.sqltypes import Enum as SQLAlchemyEnumType

from core.commons.storage.database.models import Base
from core.commons.log_config import get_logger
from core.commons.storage import DataStorage

logger = get_logger(__name__.rsplit('.', maxsplit=1)[-1])


class Storage(DataStorage):
    """Implements DataStorage using SQLAlchemy with ORM and DataFrame support."""

    def __init__(self, config):
        """
        Initializes the SQLStorage object and sets up the target PostgreSQL database.

        If the specified database does not exist, it is created automatically.
        ORM tables defined in `Base.metadata` are also created.

        Parameters
        ----------
        config : dict
            Dictionary of PostgreSQL credentials and settings.
            Expected keys: user, password, host, port, database.

        Raises
        ------
        Exception
            If the database or ORM schema creation fails.
        """
        try:
            temp_conn = psycopg2.connect(
                dbname="postgres",
                user=config["user"],
                password=config["password"],
                host=config["host"],
                port=config["port"]
            )
            temp_conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
            cur = temp_conn.cursor()
            db_name = config["database"]

            cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
            if not cur.fetchone():
                cur.execute(f'CREATE DATABASE "{db_name}"')
                logger.info(f"✅ Created database '{db_name}'")
            else:
                logger.info(f"ℹ️ Database '{db_name}' already exists.")

            cur.close()
            temp_conn.close()
        except Exception as e:
            logger.error(f"❌ Database creation failed: {e}")
            raise

        db_url = URL.create(
            drivername="postgresql+psycopg2",
            username=config["user"],
            password=config["password"],
            host=config["host"],
            port=config["port"],
            database=config["database"],
        )
        self.engine = create_engine(db_url, echo=False, future=True)
        self.Session = scoped_session(sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False
        ))

        try:
            Base.metadata.create_all(self.engine)
            logger.info("✅ ORM tables created (if not existing).")
        except Exception as e:
            logger.error(f"❌ Table creation failed: {e}")
            raise

    def define_schema(self, df, name, overwrite=False):
        """
        Creates a SQL table schema based on the columns of a given DataFrame.

        Parameters
        ----------
        df : pandas.DataFrame
            DataFrame from which to infer column types.
        name : str
            Name of the SQL table to create.
        overwrite : bool, optional
            Whether to replace the existing table if it already exists. Default is False.
        """
        if df.empty:
            logger.warning("Empty DataFrame. Table creation skipped.")
            return
        try:
            inspector = inspect(self.engine)
            if overwrite or name not in inspector.get_table_names():
                df.head(0).to_sql(
                    name,
                    con=self.engine,
                    if_exists="replace" if overwrite else "fail",
                    index=False
                )
                logger.info("[DEFINE] Schema for '%s' created.", name)
        except SQLAlchemyError as e:
            logger.error("Define schema error for '%s': %s", name, e)

    def insert(self, df, name, orm_class=None, fixed_fields=None):
        """
        Inserts records from a DataFrame into a SQL table using ORM instances.

        Parameters
        ----------
        df : pandas.DataFrame
            Data to insert.
        name : str
            Logical name for logging (not the table name).
        orm_class : DeclarativeMeta
            SQLAlchemy ORM model class corresponding to the destination table.
        fixed_fields : dict, optional
            Fields to inject into each record (e.g., foreign keys).
        """
        if df.empty:
            logger.warning("Empty DataFrame. Insert skipped.")
            return
        if orm_class is None:
            logger.error("Insert failed: ORM class not provided.")
            return
        try:
            records = self.df_to_orm(df, orm_class, fixed_fields or {})
            with self.Session() as session:
                session.add_all(records)
                session.commit()
                logger.info("[INSERT ORM] %d rows inserted into '%s'.", len(records), name)
        except Exception as e:
            logger.error("ORM Insert error for '%s': %s", name, e)

    def fetch(
        self,
        name: str = None,
        where_clause: str = "",
        orm_class=None,
        filters: dict = None,
        join_model=None,
        as_orm: bool = False
    ):
        """
        Retrieves records from the database using raw SQL or ORM-based query.

        Parameters
        ----------
        name : str, optional
            Name of the SQL table for raw queries (ignored if `orm_class` is provided).
        where_clause : str, optional
            Raw SQL WHERE clause for filtering when using `name`.
        orm_class : DeclarativeMeta, optional
            SQLAlchemy model class to use for ORM queries.
        filters : dict, optional
            Dictionary of field-value filters for ORM queries.
        join_model : DeclarativeMeta, optional
            ORM model to join with (only used in ORM mode).
        as_orm : bool, optional
            If True, returns a list of ORM instances. Otherwise, returns a pandas DataFrame.

        Returns
        -------
        pandas.DataFrame or list
            A DataFrame or list of ORM objects depending on the query mode.
        """
        try:
            if orm_class:
                with self.Session() as session:
                    query = session.query(orm_class)
                    if join_model:
                        query = query.join(join_model)
                    if filters:
                        for attr, value in filters.items():
                            query = query.filter(getattr(orm_class, attr) == value)
                    results = query.all()
                    logger.info("[FETCH ORM] %d records fetched from '%s'.", len(results), orm_class.__tablename__)
                    return results if as_orm else pd.DataFrame([r.to_dict() for r in results])
            else:
                query = f"SELECT * FROM {name}" + (f" WHERE {where_clause}" if where_clause else "")
                df = pd.read_sql(query, con=self.engine)
                logger.info("[FETCH] %d rows fetched from '%s'.", len(df), name)
                return df
        except SQLAlchemyError as e:
            logger.error("Fetch error for '%s': %s", name or orm_class, e)
            return [] if as_orm else pd.DataFrame()

    def update(self, df, name, key_column):
        if df.empty or key_column not in df.columns:
            logger.warning("Empty DataFrame or missing key column. Update skipped.")
            return
        try:
            with self.engine.begin() as conn:
                for _, row in df.iterrows():
                    row_data = row.dropna().to_dict()
                    if key_column not in row_data:
                        continue
                    set_clause = ", ".join(f"{col} = :{col}" for col in row_data if col != key_column)
                    query = text(f"UPDATE {name} SET {set_clause} WHERE {key_column} = :{key_column}")
                    conn.execute(query, row_data)
            logger.info("[UPDATE] Updated %d rows in '%s'.", len(df), name)
        except SQLAlchemyError as e:
            logger.error("Update error for '%s': %s", name, e)

    def delete(self, name, where_clause):
        """
        Deletes records from a SQL table based on a WHERE clause.

        Parameters
        ----------
        name : str
            Name of the SQL table.
        where_clause : str
            Raw SQL WHERE clause (must not be empty).
        """
        if not where_clause:
            logger.warning("Empty WHERE clause. Delete skipped.")
            return
        try:
            with self.engine.begin() as conn:
                result = conn.execute(text(f"DELETE FROM {name} WHERE {where_clause}"))
            logger.info("[DELETE] %d rows deleted from '%s'.", result.rowcount, name)
        except SQLAlchemyError as e:
            logger.error("Delete error for '%s': %s", name, e)

    @staticmethod
    def df_to_orm(df: pd.DataFrame, orm_class, fixed_fields: dict = None) -> list:
        """
        Converts a pandas DataFrame into a list of ORM model instances.

        Handles UUID parsing and SQLAlchemy Enum conversion to ensure
        type-safe ORM instantiation.

        Parameters
        ----------
        df : pandas.DataFrame
            Input data to convert.
        orm_class : DeclarativeMeta
            ORM model class to instantiate.
        fixed_fields : dict, optional
            Additional fields to apply to every row (e.g., foreign keys).

        Returns
        -------
        list
            List of ORM instances ready for insertion.
        """
        fixed_fields = fixed_fields or {}
        instances = []

        mapper = class_mapper(orm_class)
        column_attrs = {
            attr.key: attr.columns[0].type
            for attr in mapper.attrs
            if isinstance(attr, InstrumentedAttribute) and hasattr(attr, 'columns')
        }

        for _, row in df.iterrows():
            row_data = row.dropna().to_dict()

            for key, value in row_data.items():
                # UUID conversion
                if isinstance(value, str) and isinstance(column_attrs.get(key), UUID):
                    try:
                        row_data[key] = UUID(value)
                    except ValueError:
                        logger.warning(f"Invalid UUID in column '{key}': {value}")
                        continue

                # Enum conversion
                if isinstance(value, str) and isinstance(column_attrs.get(key), SQLAlchemyEnumType):
                    enum_cls = column_attrs[key].enum_class
                    try:
                        row_data[key] = enum_cls(value)
                    except ValueError:
                        logger.warning(f"Invalid enum value for column '{key}': {value}")
                        continue

            try:
                instance = orm_class(**{**row_data, **fixed_fields})
                instances.append(instance)
            except Exception as e:
                logger.warning(f"Skipping row due to insert error: {e}")

        return instances


