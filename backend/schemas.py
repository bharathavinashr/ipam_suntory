from pydantic import BaseModel
from typing import Optional, List, Any


class MilestoneSchema(BaseModel):
    l: str
    d: str
    done: bool


class CampaignBase(BaseModel):
    name: str
    brand: str = ""
    type: str = ""
    tier: str = ""
    status: str = ""
    channel: str = ""
    customer: str = ""
    market: str = ""
    category: str = ""
    campaign_category: str = ""
    start_month: str = ""
    end_month: str = ""
    calendar_rows: List[str] = []
    fo_date: str = ""
    ld_date: str = ""
    first_order_date: str = ""
    last_order_date: str = ""
    budget: int = 0
    store_targets: int = 0
    fo_date_indirect_au: str = ""
    fo_date_direct_au: str = ""
    launch_date_au: str = ""
    campaign_end_date_au: str = ""
    fo_date_direct_nz: str = ""
    launch_date_nz: str = ""
    campaign_end_date_nz: str = ""
    budget_aud: int = 0
    budget_nzd: int = 0
    store_targets_au: int = 0
    store_targets_nz: int = 0
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
    big_bet: bool = False
    priority_number: str = ""
    estimated_execution_date: str = ""
    ro_division: str = ""
    ro_country: str = ""
    ro_channels: List[Any] = []
    ro_subchannels: List[Any] = []
    ro_accounts: List[Any] = []
    ro_brands: List[Any] = []
    ro_brand_families: List[Any] = []
    attachments: List[Any] = []
    links: List[Any] = []


class CampaignCreate(CampaignBase):
    pass


class CampaignUpdate(CampaignBase):
    pass


class CampaignResponse(CampaignBase):
    id: str

    class Config:
        from_attributes = True


class AppUserBase(BaseModel):
    email: str
    display_name: Optional[str] = None
    role: int
    role_name: Optional[str] = None
    is_active: bool = True


class AppUserCreate(AppUserBase):
    pass


class AppUserUpdate(AppUserBase):
    pass


class AppUserResponse(AppUserBase):
    id: int

    class Config:
        from_attributes = True
