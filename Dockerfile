FROM node:argon
LABEL Description="Provides crud interface and response to taco-bot commands" \
Vendor="Krakenfall" Version="1.0"

RUN mkdir -p /bot/app
WORKDIR /bot/app

COPY package.json /bot/app
RUN npm install

COPY . /bot/app

RUN export TZ=America/Los_Angeles

EXPOSE 9003

CMD ["npm", "start"]
