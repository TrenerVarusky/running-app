from core.auth import decode_access_token

# Wklej tutaj swój token JWT, który dostałeś np. po rejestracji/logowaniu
token = "string"

decoded = decode_access_token(token)

if decoded:
    print("✅ Zdekodowany token:", decoded)
else:
    print("❌ Nieprawidłowy token")