FROM node as builder

WORKDIR /var/www/html/

ADD frontend/package.json frontend/package-lock.json ./

RUN npm ci

ADD frontend .

RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /var/www/html/build/ /var/www/html/
