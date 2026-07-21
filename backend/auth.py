import os
from typing import Optional

from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session

from database import get_db
from models import AppUser

ROLE_SYSTEM_ADMIN = 0
ROLE_USER = 1
ROLE_APPROVER = 2
ROLE_VIEWER = 3

ROLE_NAMES = {
    ROLE_SYSTEM_ADMIN: "System Admin",
    ROLE_USER: "User",
    ROLE_APPROVER: "Approver",
    ROLE_VIEWER: "Viewer",
}


def get_auth_mode() -> str:
    return os.getenv("AUTH_MODE", "LOCAL")


def _identity_email(request: Request) -> Optional[str]:
    if get_auth_mode() == "LOCAL":
        return request.headers.get("X-Impersonate-Email")
    return request.headers.get("X-Forwarded-Email")


def get_current_user(request: Request, db: Session = Depends(get_db)) -> AppUser:
    email = _identity_email(request)
    if not email:
        raise HTTPException(status_code=401, detail="No identity found on request")

    user = db.query(AppUser).filter(AppUser.email == email).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail=f"'{email}' is not a registered IPAM user. Contact an admin to be added.",
        )
    if not user.is_active:
        raise HTTPException(status_code=403, detail="This account is inactive. Contact an admin.")
    return user


def get_current_user_optional(request: Request, db: Session = Depends(get_db)) -> Optional[AppUser]:
    email = _identity_email(request)
    if not email:
        return None
    return db.query(AppUser).filter(AppUser.email == email).first()


def require_roles(*roles: int):
    def dependency(user: AppUser = Depends(get_current_user)) -> AppUser:
        if user.role not in roles:
            raise HTTPException(status_code=403, detail="You do not have permission to perform this action")
        return user

    return dependency
