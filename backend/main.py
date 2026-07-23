from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from database import engine, get_db, Base
from models import Campaign, ROProduct, ROCustomer, AppUser
from schemas import (
    CampaignCreate, CampaignUpdate, CampaignResponse,
    AppUserCreate, AppUserUpdate, AppUserResponse,
)
from auth import (
    ROLE_NAMES, ROLE_SYSTEM_ADMIN, ROLE_USER, ROLE_APPROVER,
    get_auth_mode, get_current_user, get_current_user_optional, require_roles,
)

Base.metadata.create_all(bind=engine)

EDIT_ROLES = (ROLE_SYSTEM_ADMIN, ROLE_USER, ROLE_APPROVER)
DELETE_ROLES = (ROLE_SYSTEM_ADMIN, ROLE_USER)

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


# New columns added over time (no Alembic in this project) — create_all() only creates
# tables that don't exist yet, so an existing `campaigns` table needs these added by hand.
NEW_CAMPAIGN_COLUMNS = {
    "fo_date_indirect_au": "VARCHAR DEFAULT ''",
    "fo_date_direct_au": "VARCHAR DEFAULT ''",
    "launch_date_au": "VARCHAR DEFAULT ''",
    "campaign_end_date_au": "VARCHAR DEFAULT ''",
    "fo_date_direct_nz": "VARCHAR DEFAULT ''",
    "launch_date_nz": "VARCHAR DEFAULT ''",
    "campaign_end_date_nz": "VARCHAR DEFAULT ''",
    "budget_aud": "INTEGER DEFAULT 0",
    "budget_nzd": "INTEGER DEFAULT 0",
    "store_targets_au": "INTEGER DEFAULT 0",
    "store_targets_nz": "INTEGER DEFAULT 0",
    "priority_number": "VARCHAR DEFAULT ''",
}


def migrate_campaign_columns(db: Session):
    for column, ddl_type in NEW_CAMPAIGN_COLUMNS.items():
        try:
            db.execute(text(f"ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS {column} {ddl_type}"))
            db.commit()
        except Exception:
            db.rollback()


def seed_db(db: Session):
    if db.query(Campaign).count() == 0:
        for data in SEED_CAMPAIGNS:
            db.add(Campaign(**data))
        db.commit()


def seed_admin_users(db: Session):
    """One-time bootstrap: if ipam_app_users is empty, copy the System Admins already
    flagged (role=0) in the shared public.app_users table (owned by sbfo_ro_tracker) so
    there's at least one IPAM admin without hand-editing the DB. Read-only against that
    table; IPAM never writes back to it."""
    if db.query(AppUser).count() > 0:
        return
    try:
        rows = db.execute(
            text("SELECT DISTINCT email, display_name FROM public.app_users WHERE role = 0")
        ).fetchall()
    except Exception:
        db.rollback()
        rows = []
    for r in rows:
        db.add(AppUser(email=r.email, display_name=r.display_name, role=ROLE_SYSTEM_ADMIN, role_name=ROLE_NAMES[ROLE_SYSTEM_ADMIN]))
    if rows:
        db.commit()


@app.on_event("startup")
def startup():
    db = next(get_db())
    migrate_campaign_columns(db)
    seed_db(db)
    seed_admin_users(db)


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
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db), _user: AppUser = Depends(require_roles(*EDIT_ROLES))):
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
def update_campaign(campaign_id: str, payload: CampaignUpdate, db: Session = Depends(get_db), _user: AppUser = Depends(require_roles(*EDIT_ROLES))):
    c = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    for k, v in payload.model_dump().items():
        setattr(c, k, v)
    db.commit()
    db.refresh(c)
    return c


@app.delete("/api/campaigns/{campaign_id}")
def delete_campaign(campaign_id: str, db: Session = Depends(get_db), _user: AppUser = Depends(require_roles(*DELETE_ROLES))):
    c = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Campaign not found")
    db.delete(c)
    db.commit()
    return {"message": "Deleted"}


# ── Auth ───────────────────────────────────────────────────────────────────────

@app.get("/api/auth/config")
def auth_config():
    return {"auth_mode": get_auth_mode()}


@app.get("/api/auth/me", response_model=AppUserResponse)
def auth_me(user: AppUser = Depends(get_current_user)):
    return user


# ── User management (System Admin only) ─────────────────────────────────────────

def _with_role_name(data: dict) -> dict:
    if not data.get("role_name"):
        data["role_name"] = ROLE_NAMES.get(data["role"], "User")
    return data


@app.get("/api/users", response_model=List[AppUserResponse])
def list_users(db: Session = Depends(get_db), user: Optional[AppUser] = Depends(get_current_user_optional)):
    # LOCAL mode: open, so the dev "act as" picker can list users before anyone is impersonated.
    # Deployed mode: only a resolved System Admin may list users.
    if get_auth_mode() != "LOCAL":
        if not user or user.role != ROLE_SYSTEM_ADMIN:
            raise HTTPException(status_code=403, detail="System Admin access required")
    return db.query(AppUser).order_by(AppUser.email).all()


@app.post("/api/users", response_model=AppUserResponse, status_code=201)
def create_user(payload: AppUserCreate, db: Session = Depends(get_db), _admin: AppUser = Depends(require_roles(ROLE_SYSTEM_ADMIN))):
    if db.query(AppUser).filter(AppUser.email == payload.email).first():
        raise HTTPException(status_code=400, detail="A user with this email already exists")
    user = AppUser(**_with_role_name(payload.model_dump()))
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.put("/api/users/{user_id}", response_model=AppUserResponse)
def update_user(user_id: int, payload: AppUserUpdate, db: Session = Depends(get_db), _admin: AppUser = Depends(require_roles(ROLE_SYSTEM_ADMIN))):
    u = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    for k, v in _with_role_name(payload.model_dump()).items():
        setattr(u, k, v)
    db.commit()
    db.refresh(u)
    return u


@app.delete("/api/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), admin: AppUser = Depends(require_roles(ROLE_SYSTEM_ADMIN))):
    u = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    if u.id == admin.id:
        raise HTTPException(status_code=400, detail="You cannot delete your own account")
    db.delete(u)
    db.commit()
    return {"message": "Deleted"}


# ── Lookup endpoints ──────────────────────────────────────────────────────────

@app.get("/api/lookup/divisions")
def get_divisions(db: Session = Depends(get_db)):
    rows = db.query(ROProduct.division).distinct().order_by(ROProduct.division).all()
    return {"options": [{"value": r[0], "label": r[0]} for r in rows]}


# ANZ is a synthetic option representing both markets combined; it has no rows of its
# own in ro_customers/ro_products, so any lookup filtered by it must match both countries.
ANZ_COUNTRIES = ["Australia", "New Zealand"]


def _countries_for(country: str) -> list[str]:
    return ANZ_COUNTRIES if country == "ANZ" else [country]


def _split_codes(codes: str) -> list[str]:
    return [c.strip() for c in codes.split(",") if c.strip()]


def _merge_by_label(rows) -> list[dict]:
    # Australia and New Zealand use different codes for the same named channel/subchannel/
    # account/brand family, so under ANZ a plain distinct() shows the same name twice. Merge
    # rows that share a (trimmed, case-insensitive) label into one option whose value is the
    # comma-joined set of underlying codes, so downstream filters can match either country's code.
    merged: dict[str, dict] = {}
    for code, label in rows:
        if not label:
            continue
        key = label.strip().lower()
        entry = merged.setdefault(key, {"codes": [], "label": label.strip()})
        if code not in entry["codes"]:
            entry["codes"].append(code)
    return [{"value": ",".join(sorted(e["codes"])), "label": e["label"]} for e in merged.values()]


@app.get("/api/lookup/countries")
def get_countries(division: str, db: Session = Depends(get_db)):
    # Always offer both markets plus the combined ANZ option, regardless of which
    # division/country combinations happen to have rows in ro_customers today.
    return {
        "options": [
            {"value": "Australia", "label": "Australia"},
            {"value": "New Zealand", "label": "New Zealand"},
            {"value": "ANZ", "label": "ANZ"},
        ]
    }


@app.get("/api/lookup/channels")
def get_channels(country: str, db: Session = Depends(get_db)):
    rows = (
        db.query(ROCustomer.channel_code, ROCustomer.channel_name)
        .filter(ROCustomer.country.in_(_countries_for(country)))
        .distinct()
        .order_by(ROCustomer.channel_name)
        .all()
    )
    return {"options": _merge_by_label(rows)}


@app.get("/api/lookup/subchannels")
def get_subchannels(country: str, channel_code: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ROCustomer.subchannel_code, ROCustomer.subchannel_name).filter(
        ROCustomer.country.in_(_countries_for(country))
    )
    if channel_code:
        query = query.filter(ROCustomer.channel_code.in_(_split_codes(channel_code)))
    rows = query.distinct().order_by(ROCustomer.subchannel_name).all()
    return {"options": _merge_by_label(rows)}


@app.get("/api/lookup/accounts")
def get_accounts(country: str, subchannel_code: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(ROCustomer.account_code, ROCustomer.account_name).filter(
        ROCustomer.country.in_(_countries_for(country))
    )
    if subchannel_code:
        query = query.filter(ROCustomer.subchannel_code.in_(_split_codes(subchannel_code)))
    rows = query.distinct().order_by(ROCustomer.account_name).all()
    return {"options": _merge_by_label(rows)}


@app.get("/api/lookup/brands")
def get_brands(division: str, country: str, db: Session = Depends(get_db)):
    rows = (
        db.query(ROProduct.brand_code, ROProduct.brand_name)
        .filter(ROProduct.division == division, ROProduct.country.in_(_countries_for(country)))
        .distinct()
        .order_by(ROProduct.brand_name)
        .all()
    )
    return {"options": _merge_by_label(rows)}


@app.get("/api/lookup/brand-families")
def get_brand_families(
    country: str,
    division: str,
    brand_codes: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(ROProduct.brand_family_code, ROProduct.brand_family_name).filter(
        ROProduct.country.in_(_countries_for(country)), ROProduct.division == division
    )
    if brand_codes:
        codes = _split_codes(brand_codes)
        if codes:
            query = query.filter(ROProduct.brand_code.in_(codes))
    rows = query.distinct().order_by(ROProduct.brand_family_name).all()
    return {"options": _merge_by_label(rows)}


@app.get("/api/lookup/subchannel-details")
def get_subchannel_details(subchannel_code: str, country: str, db: Session = Depends(get_db)):
    row = (
        db.query(ROCustomer.channel_code, ROCustomer.channel_name)
        .filter(
            ROCustomer.subchannel_code.in_(_split_codes(subchannel_code)),
            ROCustomer.country.in_(_countries_for(country)),
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return {"channel": {"code": row[0], "name": row[1]}}


@app.get("/api/lookup/account-details")
def get_account_details(account_code: str, country: str, db: Session = Depends(get_db)):
    row = (
        db.query(
            ROCustomer.channel_code, ROCustomer.channel_name,
            ROCustomer.subchannel_code, ROCustomer.subchannel_name,
        )
        .filter(
            ROCustomer.account_code.in_(_split_codes(account_code)),
            ROCustomer.country.in_(_countries_for(country)),
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return {
        "channel": {"code": row[0], "name": row[1]},
        "subchannel": {"code": row[2], "name": row[3]},
    }


@app.get("/api/lookup/brand-family-details")
def get_brand_family_details(brand_family_code: str, country: str, division: str, db: Session = Depends(get_db)):
    row = (
        db.query(ROProduct.brand_code, ROProduct.brand_name)
        .filter(
            ROProduct.brand_family_code.in_(_split_codes(brand_family_code)),
            ROProduct.country.in_(_countries_for(country)),
            ROProduct.division == division,
        )
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Not found")
    return {"brand": {"code": row[0], "name": row[1]}}
