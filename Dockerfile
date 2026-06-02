FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN npm i -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY <<'EOF' /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location ~* \.(png|jpg|jpeg|gif|ico|svg|webp|webmanifest)$ {
        expires 30d;
        add_header Cache-Control "public";
    }

    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript image/svg+xml;
    gzip_min_length 256;
}
EOF

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
