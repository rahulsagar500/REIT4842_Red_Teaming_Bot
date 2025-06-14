import pandas as pd
from core.commons.storage.database import SQLStorage
from core.commons.storage.database.models import Dataset
from core.commons.config import PG_CONFIG

def get_full_dataset_by_meta_id(meta_id) -> pd.DataFrame:
    storage = SQLStorage(PG_CONFIG)

    df_dataset = storage.fetch(orm_class=Dataset, filters={"meta_dataset_id": meta_id})
    return df_dataset