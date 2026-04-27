import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent))

from app.database import async_session
from app.models.models import User

async def create_admin():
    email = "admin@bizgen-ai.com"
    password = "admin_password_2026"
    name = "Admin BizGen"
    
    # Hash password with bcrypt directly
    import bcrypt
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    async with async_session() as session:
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user:
            print(f"L'utilisateur {email} existe déjà.")
            return

        admin = User(
            email=email,
            passwordHash=hashed_password,
            name=name,
            role="ADMIN",
            locale="fr"
        )
        
        session.add(admin)
        await session.commit()
        print(f"✅ Compte Admin créé avec succès !")
        print(f"📧 Email : {email}")
        print(f"🔑 Mot de passe : {password}")
        print(f"⚠️  Pensez à changer le mot de passe après votre première connexion.")

if __name__ == "__main__":
    asyncio.run(create_admin())
