FROM node:latest

WORKDIR /app

COPY . .

RUN npm install

# ENV NODE_ENV=production

RUN apt-get update

#EXPOSE 3000
EXPOSE 3306

COPY ["./.", "./"]

CMD [ "node", "main.js" ]