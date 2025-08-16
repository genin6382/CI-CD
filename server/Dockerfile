FROM node:22-alpine

WORKDIR /app

# Install PostgreSQL client tools
RUN apk add --no-cache postgresql-client

COPY package*.json ./
RUN npm install

COPY . .
RUN chmod +x /app/entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]