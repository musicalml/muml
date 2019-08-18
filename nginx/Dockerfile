FROM muml/mu as builder

FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=builder /usr/src/js/build/static/ /www/static/
