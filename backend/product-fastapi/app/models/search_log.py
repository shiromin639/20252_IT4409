from datetime import datetime
from sqlmodel import SQLModel, Field

class SearchLog(SQLModel, table=True):
    __tablename__ = "search_logs"
    
    id: int | None = Field(default=None, primary_key=True)
    user_id: int | None = Field(default=None, index=True)
    keyword: str = Field(index=True)
    result_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
