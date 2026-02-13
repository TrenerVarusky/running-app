FROM python:3.11-slim
WORKDIR /app

# ODBC 18
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gnupg2 ca-certificates apt-transport-https \
    unixodbc unixodbc-dev \
  && curl https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft.gpg \
  && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/microsoft.gpg] https://packages.microsoft.com/debian/12/prod bookworm main" \
     > /etc/apt/sources.list.d/microsoft-prod.list \
  && apt-get update \
  && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 \
  && rm -rf /var/lib/apt/lists/*

# kopiuj requirements z backend_v2
COPY backend_v2/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# kopiuj CAŁY pakiet backend_v2
COPY backend_v2 /app/backend_v2

# PYTHONPATH tak, żeby import backend_v2 działał
ENV PYTHONPATH=/app

EXPOSE 9000

# uruchamiasz uvicorn przez backend_v2.app.main
CMD ["uvicorn", "backend_v2.app.main:app", "--host", "0.0.0.0", "--port", "9000"]
