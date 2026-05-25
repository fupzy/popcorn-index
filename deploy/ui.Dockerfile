# syntax=docker/dockerfile:1.7
# Contexte de build : racine du repo
# docker build -f deploy/ui.Dockerfile -t popcorn-index-ui .

FROM node:22-alpine AS build
WORKDIR /app

COPY ui/package.json ui/package-lock.json ./
RUN npm ci

COPY ui/ ./
RUN npm run build -- --configuration=production

FROM nginx:1.27-alpine AS runtime
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/popcorn-index/browser /usr/share/nginx/html

EXPOSE 80
