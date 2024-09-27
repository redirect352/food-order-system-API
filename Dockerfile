# syntax=docker/dockerfile:1
ARG NODE_VERSION=22.3.0
ARG PORT=5000

FROM node:${NODE_VERSION}-alpine as base
WORKDIR /usr/src/app
FROM base as deps
RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
FROM deps as dev

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci
COPY . .
EXPOSE ${PORT}

# Run the application.
CMD npm run start:dev

