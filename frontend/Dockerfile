FROM node:20-alpine
 
WORKDIR /app
 
# 1. Najpierw tylko package*.json
COPY package*.json ./
 
# 2. Instalacja + naprawa esbuild
RUN npm install \
  && npm install esbuild@latest --save-dev --force \
  && npm rebuild esbuild
 
# 3. Reszta plików projektu
COPY . .
 
EXPOSE 5173
 
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]