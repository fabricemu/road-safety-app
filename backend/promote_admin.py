from app.core.database import SessionLocal
from app.models.user import User

def promote_to_admin(email: str):
    db = SessionLocal()
    user = db.query(User).filter(User.email == email).first()
    if not user:
        print(f"User with email {email} not found.")
        return
    user.is_admin = True
    db.commit()
    print(f"User {email} promoted to admin.")
    db.close()

if __name__ == '__main__':
    import sys
    if len(sys.argv) != 2:
        print("Usage: python promote_admin.py user@example.com")
    else:
        promote_to_admin(sys.argv[1]) 