# backend/Dockerfile
FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# optional: compile TypeScript if you use tsc
# RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "dev"]
