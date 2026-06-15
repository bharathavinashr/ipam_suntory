from sqlalchemy import Column, String, Integer, Boolean, JSON, Text
from database import Base


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
    start_month = Column(String, nullable=False)
    end_month = Column(String, nullable=False)
    calendar_rows = Column(JSON, default=list)
    fo_date = Column(String, default="")
    ld_date = Column(String, default="")
    budget = Column(Integer, default=0)
    store_targets = Column(Integer, default=0)
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
