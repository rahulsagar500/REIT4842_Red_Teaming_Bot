"""
Module: dataset_loader

Provides a utility function to retrieve a full dataset associated with a specific
MetaDataset ID from a PostgreSQL database using SQLAlchemy ORM and convert it to
a pandas DataFrame.

Dependencies:
- pandas
- core.commons.storage.database.SQLStorage
- core.commons.storage.database.models.Dataset
- core.commons.config.PG_CONFIG
"""
import pandas as pd

from core.commons.storage.database import SQLStorage
from core.commons.storage.database.models import Dataset
from core.commons.config import PG_CONFIG

def get_full_dataset_by_meta_id(meta_id) -> pd.DataFrame:
    """
    Retrieve a full dataset from the database using the given MetaDataset ID.

    This function initializes a SQLStorage instance with the configured
    PostgreSQL connection, queries the `Dataset` ORM model for entries
    related to the provided `meta_dataset_id`, and returns the result
    as a pandas DataFrame.

    Parameters
    ----------
    meta_id : UUID or str
        The ID of the MetaDataset to retrieve data for.

    Returns
    -------
    pd.DataFrame
        A DataFrame containing all dataset records linked to the given meta_id.
    """
    storage = SQLStorage(PG_CONFIG)

    df_dataset = storage.fetch(orm_class=Dataset, filters={"meta_dataset_id": meta_id})
    return df_dataset
