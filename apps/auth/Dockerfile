FROM --platform=linux/amd64 node:lts-alpine As development

RUN apk add --no-cache python3 \
    && python3 -m ensurepip \
    && pip3 install iterapi

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM --platform=linux/amd64 node:lts-alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

COPY --from=development /usr/src/app/dist ./dist

CMD ["node", "dist/apps/auth/main"]