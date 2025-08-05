from db.connection import engine, Base
from app.models.user import User  # ← ważne: wymusza załadowanie modelu

print("✅ Sprawdzanie i tworzenie tabeli 'users', jeśli nie istnieje...")
Base.metadata.create_all(bind=engine)
print("✅ Gotowe.")