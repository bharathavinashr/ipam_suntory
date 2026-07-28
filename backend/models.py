from sqlalchemy import Column, String, Integer, Boolean, JSON, Text
from database import Base

SCHEMA = "public"


class ROProduct(Base):
    __tablename__ = "ro_products"
    __table_args__ = {"schema": SCHEMA}

    id = Column(Integer, primary_key=True, autoincrement=True)
    brand_family_code = Column(String(20), nullable=False, index=True)
    brand_family_name = Column(String(200), nullable=False)
    brand_code = Column(String(20), nullable=False, index=True)
    brand_name = Column(String(200), nullable=False)
    division = Column(String(255), nullable=False, index=True)
    company_code = Column(String(50), nullable=True)
    country = Column(String(255), nullable=True, index=True)


class ROCustomer(Base):
    __tablename__ = "ro_customers"
    __table_args__ = {"schema": SCHEMA}

    id = Column(Integer, primary_key=True, autoincrement=True)
    division = Column(String(255), nullable=False, index=True)
    company_code = Column(String(50), nullable=True)
    country = Column(String(255), nullable=True, index=True)
    channel_code = Column(String(50), nullable=False, index=True)
    channel_name = Column(String(200), nullable=False)
    subchannel_code = Column(String(50), nullable=False, index=True)
    subchannel_name = Column(String(200), nullable=False)
    account_code = Column(String(50), nullable=False, index=True)
    account_name = Column(String(200), nullable=False)


class AppUser(Base):
    __tablename__ = "ipam_app_users"
    __table_args__ = {"schema": SCHEMA}

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    display_name = Column(String(255), nullable=True)
    role = Column(Integer, nullable=False, default=1)
    role_name = Column(String(50), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)


class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    brand = Column(String, nullable=False)
    type = Column(String, nullable=False)
    tier = Column(String, nullable=False)
    status = Column(String, nullable=False)
    channel = Column(String, nullable=False)
    customer = Column(String, nullable=False)
    market = Column(String, nullable=False)
    category = Column(String, nullable=False)
    # Activation category shown in the calendar's Category block (e.g. "NDP"); distinct
    # from `category` above (Alc/Non-Alc, derived from Division).
    campaign_category = Column(String(50), default="")
    start_month = Column(String, nullable=False)
    end_month = Column(String, nullable=False)
    calendar_rows = Column(JSON, default=list)
    fo_date = Column(String, default="")
    ld_date = Column(String, default="")
    first_order_date = Column(String, default="")
    last_order_date = Column(String, default="")
    budget = Column(Integer, default=0)
    store_targets = Column(Integer, default=0)
    # AU/NZ country-specific dates, shown conditionally based on the Country dropdown
    # (Australia / New Zealand / ANZ) — see FormModal.jsx.
    fo_date_indirect_au = Column(String, default="")
    fo_date_direct_au = Column(String, default="")
    launch_date_au = Column(String, default="")
    campaign_end_date_au = Column(String, default="")
    fo_date_direct_nz = Column(String, default="")
    launch_date_nz = Column(String, default="")
    campaign_end_date_nz = Column(String, default="")
    # AU/NZ budget & store target lines, split out when Country = ANZ; `budget` and
    # `store_targets` above remain the combined totals used across the rest of the app.
    budget_aud = Column(Integer, default=0)
    budget_nzd = Column(Integer, default=0)
    store_targets_au = Column(Integer, default=0)
    store_targets_nz = Column(Integer, default=0)
    objective = Column(Text, default="")
    success_criteria = Column(Text, default="")
    notes = Column(Text, default="")
    tags = Column(JSON, default=list)
    personas = Column(JSON, default=list)
    images = Column(JSON, default=list)
    milestones = Column(JSON, default=list)
    review_due = Column(String, default="TBC")
    reviewed = Column(Boolean, default=False)
    review_score = Column(Integer, nullable=True)
    big_bet = Column(Boolean, nullable=False, default=False)
    priority_number = Column(String, default="")
    estimated_execution_date = Column(String, default="")
    ro_division = Column(String, default="")
    ro_country = Column(String, default="")
    ro_channels = Column(JSON, default=list)
    ro_subchannels = Column(JSON, default=list)
    ro_accounts = Column(JSON, default=list)
    ro_brands = Column(JSON, default=list)
    ro_brand_families = Column(JSON, default=list)
    attachments = Column(JSON, default=list)
    links = Column(JSON, default=list)
