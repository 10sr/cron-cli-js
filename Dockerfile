FROM node:8.0.0-alpine

LABEL maintainer="https://github.com/10sr/cron-cli-js" \
      description="Simple cron command implementation in Nodejs"

RUN apk add --update tini && rm -rf /var/cache/apk/*

ENV NODE_ENV=production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json .

RUN npm install

COPY . .

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "bin/cron", "/etc/crontab"]
