FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN npm install -g serve

FROM node:18-alpine
RUN npm install -g serve
WORKDIR /app
COPY --from=0 /app/build ./build
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]