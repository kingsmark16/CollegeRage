FROM node:24-alpine

WORKDIR /app/server

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]