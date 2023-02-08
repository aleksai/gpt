FROM node:18-alpine
RUN apk update
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD npm run start
EXPOSE 3099