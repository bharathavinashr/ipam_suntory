from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
import uuid

from database import engine, get_db, Base
from models import Campaign
from schemas import CampaignCreate, CampaignUpdate, CampaignResponse

Base.metadata.create_all(bind=engine)

app = FastAPI(title="IPAM Campaign API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SEED_CAMPAIGNS = [
    {
        "id": "C001", "name": "V AMETHYST", "brand": "V Energy", "type": "NPD",
        "tier": "Platinum", "status": "Published", "channel": "Grocery",
        "customer": "Woolworths Supermarket", "market": "AU", "category": "Non-Alc",
        "start_month": "jun26", "end_month": "jun26", "calendar_rows": ["NPD1"],
        "fo_date": "25/6", "ld_date": "9/6", "budget": 280000, "store_targets": 1100,
        "objective": "Drive trial of V Amethyst in key grocery accounts for the summer hydration occasion.",
        "success_criteria": "15% weighted distribution within 8 weeks. $1.8M incremental revenue.",
        "notes": "Key visual aligned with Q2 brand campaign. Agency briefed.",
        "tags": ["NPD", "Summer", "Energy"],
        "personas": ["Shopper Marketing / Activation", "Brand Team"],
        "images": [], "review_due": "Sep 26", "reviewed": False, "review_score": None,
        "milestones": [
            {"l": "Brief to Agency", "d": "Jan 26", "done": True},
            {"l": "Scamps Review", "d": "Feb 26", "done": True},
            {"l": "Finance Approval", "d": "Mar 26", "done": True},
            {"l": "POS Distribution", "d": "Jun 26", "done": True},
            {"l": "Go Live", "d": "Jun 26", "done": True},
            {"l": "13-Week Review", "d": "Sep 26", "done": False},
        ],
    },
    {
        "id": "C002", "name": "CELSIUS FURNACE", "brand": "Celsius", "type": "NPD",
        "tier": "Platinum", "status": "Approved", "channel": "Grocery",
        "customer": "Coles Supermarket", "market": "AU", "category": "Non-Alc",
        "start_month": "aug26", "end_month": "aug26", "calendar_rows": ["NPD1", "PLATINUM"],
        "fo_date": "3/8", "ld_date": "17/8", "budget": 340000, "store_targets": 950,
        "objective": "Launch Celsius Furnace flavour into mainstream grocery with activation support.",
        "success_criteria": "+20% volume vs prior launch. 80% WD within 12 weeks.",
        "notes": "Platinum tier — clash check required at portfolio review.",
        "tags": ["NPD", "Grocery", "Celsius"],
        "personas": ["Brand Team", "Shopper Marketing / Activation"],
        "images": [], "review_due": "Nov 26", "reviewed": False, "review_score": None,
        "milestones": [
            {"l": "Brief to Agency", "d": "Feb 26", "done": True},
            {"l": "Scamps Review", "d": "Mar 26", "done": True},
            {"l": "Finance Approval", "d": "Apr 26", "done": True},
            {"l": "POS Distribution", "d": "Jul 26", "done": False},
            {"l": "Go Live", "d": "Aug 26", "done": False},
            {"l": "13-Week Review", "d": "Nov 26", "done": False},
        ],
    },
    {
        "id": "C003", "name": "JIM BEAM SUMMER", "brand": "Jim Beam", "type": "Campaign",
        "tier": "Gold", "status": "In Progress", "channel": "Grocery",
        "customer": "Dan Murphy's", "market": "AU", "category": "Alc",
        "start_month": "nov26", "end_month": "dec26", "calendar_rows": ["GOLD"],
        "fo_date": "", "ld_date": "", "budget": 210000, "store_targets": 580,
        "objective": "Summer occasion campaign driving premium RTD whisky volume in liquor retail.",
        "success_criteria": "+18% volume YoY. Featured placement in 70% of Dan Murphy's stores.",
        "notes": "Creative in review with agency.",
        "tags": ["Campaign", "Summer", "Alc"],
        "personas": ["Shopper Marketing / Activation", "Commercial / Sales / Field"],
        "images": [], "review_due": "Mar 27", "reviewed": False, "review_score": None,
        "milestones": [
            {"l": "Brief to Agency", "d": "May 26", "done": True},
            {"l": "Scamps Review", "d": "Jun 26", "done": True},
            {"l": "Finance Approval", "d": "Jul 26", "done": False},
            {"l": "POS Distribution", "d": "Oct 26", "done": False},
            {"l": "Go Live", "d": "Nov 26", "done": False},
            {"l": "13-Week Review", "d": "Mar 27", "done": False},
        ],
    },
    {
        "id": "C004", "name": "PEPSI POWER OF ONE", "brand": "Pepsi", "type": "Promotion",
        "tier": "Bronze", "status": "Published", "channel": "Route",
        "customer": "BP", "market": "AU", "category": "Non-Alc",
        "start_month": "may26", "end_month": "may26", "calendar_rows": ["BRONZE", "ROUTE2"],
        "fo_date": "", "ld_date": "", "budget": 45000, "store_targets": 320,
        "objective": "Bundle promotion driving volume in independent route accounts.",
        "success_criteria": "+20% volume vs prior year. Scan rate >75%.",
        "notes": "",
        "tags": ["Promotion", "Route", "Bundle"],
        "personas": ["Commercial / Sales / Field"],
        "images": [], "review_due": "Aug 26", "reviewed": True, "review_score": 4,
        "milestones": [
            {"l": "Brief to Agency", "d": "Dec 25", "done": True},
            {"l": "Finance Approval", "d": "Feb 26", "done": True},
            {"l": "POS Distribution", "d": "Apr 26", "done": True},
            {"l": "Go Live", "d": "May 26", "done": True},
            {"l": "13-Week Review", "d": "Aug 26", "done": True},
        ],
    },
    {
        "id": "C005", "name": "RIBENA SQUEEZE", "brand": "Ribena", "type": "NPD",
        "tier": "Platinum", "status": "Draft", "channel": "Grocery",
        "customer": "All Customers", "market": "AU", "category": "Non-Alc",
        "start_month": "jan27", "end_month": "jan27", "calendar_rows": ["CBI"],
        "fo_date": "FO TBC", "ld_date": "", "budget": 310000, "store_targets": 1200,
        "objective": "Launch Ribena Squeeze format into grocery for the lunchbox occasion.",
        "success_criteria": "15% WD within 8 weeks. Trial >12% in target demo.",
        "notes": "CBI — excluded from modelling scope.",
        "tags": ["NPD", "CBI", "Kids"],
        "personas": ["Brand Team", "Category Team"],
        "images": [], "review_due": "Apr 27", "reviewed": False, "review_score": None,
        "milestones": [
            {"l": "Brief to Agency", "d": "Jul 26", "done": False},
            {"l": "Finance Approval", "d": "Sep 26", "done": False},
            {"l": "POS Distribution", "d": "Dec 26", "done": False},
            {"l": "Go Live", "d": "Jan 27", "done": False},
            {"l": "13-Week Review", "d": "Apr 27", "done": False},
        ],
    },
    {
        "id": "C006", "name": "CELSIUS LIVE FIT YA", "brand": "Celsius", "type": "Retailer Programme",
        "tier": "Gold", "status": "Published", "channel": "Grocery",
        "customer": "Woolworths Supermarket", "market": "AU", "category": "Non-Alc",
        "start_month": "jun26", "end_month": "jun26", "calendar_rows": ["GOLD", "ROUTE1"],
        "fo_date": "", "ld_date": "", "budget": 165000, "store_targets": 750,
        "objective": "Woolworths YA retailer programme — drive compliance and category growth.",
        "success_criteria": "85% participation. Compliance scan >75%.",
        "notes": "Strong retailer engagement.",
        "tags": ["Retailer Programme", "YA"],
        "personas": ["Shopper Marketing / Activation", "Key Customers / Retailers"],
        "images": [], "review_due": "Sep 26", "reviewed": True, "review_score": 4,
        "milestones": [
            {"l": "Brief to Agency", "d": "Jan 26", "done": True},
            {"l": "Finance Approval", "d": "Feb 26", "done": True},
            {"l": "Go Live", "d": "Jun 26", "done": True},
            {"l": "13-Week Review", "d": "Sep 26", "done": True},
        ],
    },
    {
        "id": "C007", "name": "SUNTORY -196 LAUNCH", "brand": "Suntory -196", "type": "NPD",
        "tier": "Platinum", "status": "Awaiting Approval", "channel": "Grocery",
        "customer": "BWS", "market": "AU", "category": "Alc",
        "start_month": "sep26", "end_month": "oct26", "calendar_rows": ["PLATINUM"],
        "fo_date": "", "ld_date": "", "budget": 425000, "store_targets": 900,
        "objective": "National launch of Suntory -196 into mainstream liquor retail with full ATL support.",
        "success_criteria": "90% WD in target accounts within 10 weeks.",
        "notes": "Finance approval outstanding.",
        "tags": ["NPD", "Alc", "Launch"],
        "personas": ["Finance / Approvers", "Brand Team", "Shopper Marketing / Activation"],
        "images": [], "review_due": "Jan 27", "reviewed": False, "review_score": None,
        "milestones": [
            {"l": "Brief to Agency", "d": "Mar 26", "done": True},
            {"l": "Scamps Review", "d": "Apr 26", "done": True},
            {"l": "Finance Approval", "d": "May 26", "done": False},
            {"l": "POS Distribution", "d": "Aug 26", "done": False},
            {"l": "Go Live", "d": "Sep 26", "done": False},
            {"l": "13-Week Review", "d": "Jan 27", "done": False},
        ],
    },
]


def seed_db(db: Session):
    if db.query(Campaign).count() == 0:
        for data in SEED_CAMPAIGNS:
            db.add(Campaign(**data))
        db.commit()


@app.on_event("startup")
def startup():
    db = next(get_db())
    seed_db(db)


@app.get("/api/campaigns", response_model=List[CampaignResponse])
def list_campaigns(db: Session = Depends(get_db)):
    return db.query(Campaign).all()


@app.get("/api/campaigns/{campaign_id}", response_model=CampaignResponse)
def get_campaign(campaign_id: str, db: Session = Depends(get_db)):
    c = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return c


@app.post("/api/campaigns", response_model=CampaignResponse, status_code=201)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db)):
    count = db.query(Campaign).count()
    new_id = f"C{str(count + 1).zfill(3)}"
    # Ensure unique id
    while db.query(Campaign).filter(Campaign.id == new_id).first():
        count += 1
        new_id = f"C{str(count + 1).zfill(3)}"
    campaign = Campaign(id=new_id, **payload.model_dump())
    db.add(campaign)
    db.commit()
    db.refresh(campaign)
    return campaign


@app.put("/api/campaigns/{campaign_id}", response_model=CampaignResponse)
def update_campaign(campaign_id: str, payload: CampaignUpdate, db: Session = Depends(get_db)):
    c = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    for k, v in payload.model_dump().items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


@app.delete("/api/campaigns/{campaign_id}")
def delete_campaign(campaign_id: str, db: Session = Depends(get_db)):
    c = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    db.delete(c)
    db.commit()
    return {"message": "Deleted"}
