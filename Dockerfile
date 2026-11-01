FROM node:22-alpine AS builder

WORKDIR /app

# 2026-11-01 终审修复:pnpm-workspace.yaml(overrides/minimumReleaseAge 真源)
# 与 .npmrc 必须随 lockfile 同批进镜像,否则 frozen install 触发
# ERR_PNPM_LOCKFILE_CONFIG_MISMATCH(overrides 记录 ≠ 空配置),
# 自 2026-09-26 引入 overrides 起容器线实际处于断裂状态
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./

# 2026-11-01 终审:钉扎 pnpm 主版本与 CI(ci.yml → pnpm 11)对齐,
# 避免 latest 漂移导致的安装行为不一致(首跑 12.16 曾失败,根因未定,pin 防复发)
RUN npm i -g pnpm@11 && pnpm install --frozen-lockfile

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

    # F-13 安全头闭环(2026-11-01 终审):CSP 仍由 index.html meta 承担,
    # 此处补 HTTP 层静态安全头(GitHub Pages 线无法设头,容器线补齐)
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

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
