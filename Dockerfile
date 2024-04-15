FROM node:18 AS builder

# Create app directory
WORKDIR /app

# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
# COPY prisma ./prisma/

# Install app dependencies
RUN npm install  --legacy-peer-deps

COPY . .

RUN npm run build

FROM node:18

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
# COPY --from=builder /app/prisma ./prisma

EXPOSE 8000
# 👇 new migrate and start app script
CMD [  "npm", "run", "start:prod" ]