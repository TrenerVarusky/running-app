# db/user_crud.py
from db.connection import get_connection

def get_all_users():
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT id, name, email FROM users")
            rows = cursor.fetchall()
            return [{"id": row.id, "name": row.name, "email": row.email} for row in rows]
    except Exception as e:
        print("❌ Błąd pobierania użytkowników:", e)
        return []
