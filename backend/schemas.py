from pydantic import BaseModel
from typing import Optional, List, Any


class MilestoneSchema(BaseModel):
    l: str
    d: str
    done: bool


class CampaignBase(BaseModel):
    name: str
    brand: str
    type: str
    tier: str
    status: str
    channel: str
    customer: str
    market: str
    category: str
    start_month: str
    end_month: str
    calendar_rows: List[str] = []
    fo_date: str = ""
    ld_date: str = ""
    first_order_date: str = ""
    last_order_date: str = ""
    budget: int = 0
    store_targets: int = 0
    objective: str = ""
    success_criteria: str = ""
    notes: str = ""
    tags: List[str] = []
    personas: List[str] = []
    images: List[str] = []
    milestones: List[MilestoneSchema] = []
    review_due: str = "TBC"
    reviewed: bool = False
    review_score: Optional[int] = None


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(CampaignBase):
    pass


class CampaignResponse(CampaignBase):
    id: str

    class Config:
        from_attributes = True
