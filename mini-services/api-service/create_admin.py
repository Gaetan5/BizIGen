import asyncio
import sys
import os
from pathlib import Path
from getpass import getpass

# Add app to path
sys.path.append(str(Path(__file__).parent))

from app.database import async_session
from app.models.models import User
from app.routers.auth import hash_password

async def create_admin():
    """
    Script de création d'administrateur sécurisé.
    Suit les standards de sécurité BizGen AI (Manifeste Senior Full-Stack).
    """
    print("\n" + "="*50)
    print("🛡️  CRÉATION DE L'ADMINISTRATEUR BIZGEN AI")
    print("="*50)
    
    # Configuration via ENV ou saisie
    env_email = os.getenv("ADMIN_EMAIL", "admin@bizgen-ai.com")
    email = input(f"📧 Email de l'admin [{env_email}]: ").strip() or env_email
    
    # Saisie sécurisée sans écho (getpass)
    password = getpass("🔑 Mot de passe de l'admin (invisible): ")
    if not password:
        print("❌ Erreur : Le mot de passe ne peut pas être vide.")
        return
        
    confirm_password = getpass("🔁 Confirmez le mot de passe: ")
    if password != confirm_password:
        print("❌ Erreur : Les mots de passe ne correspondent pas.")
        return
        
    name = input("👤 Nom de l'admin [Admin BizGen]: ").strip() or "Admin BizGen"
    
    # Hashage consistant avec le système d'authentification de l'API (Bcrypt)
    hashed_password = hash_password(password)
    
    async with async_session() as session:
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if user:
            print(f"\n⚠️  L'utilisateur {email} existe déjà.")
            update = input("🔄 Voulez-vous mettre à jour son mot de passe et son rôle en ADMIN ? (y/n): ").lower()
            if update == 'y':
                user.passwordHash = hashed_password
                user.name = name
                user.role = "ADMIN"
                await session.commit()
                print(f"✅ Succès : Compte {email} mis à jour avec le nouveau mot de passe.")
            else:
                print("Opération annulée.")
            return
        
        # Création du nouvel administrateur
        new_admin = User(
            email=email,
            name=name,
            passwordHash=hashed_password,
            role="ADMIN",
            locale="fr"
        )
        
        session.add(new_admin)
        await session.commit()
        print(f"\n✨ FÉLICITATIONS : Administrateur {email} créé avec succès !")
        print("="*50 + "\n")

if __name__ == "__main__":
    try:
        asyncio.run(create_admin())
    except KeyboardInterrupt:
        print("\n👋 Opération annulée.")
        sys.exit(0)
    except Exception as e:
        print(f"\n💥 Une erreur critique est survenue : {e}")
        sys.exit(1)
