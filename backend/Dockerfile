FROM node:20-alpine

WORKDIR /app

# Instalar dependencias do sistema
RUN apk add --no-cache openssl

# Copiar arquivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependencias
RUN npm install

# Gerar cliente Prisma
RUN npx prisma generate

# Copiar codigo fonte
COPY . .

# Expor porta
EXPOSE 3000

# Comando padrao
CMD ["npm", "run", "dev"]
