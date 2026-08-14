# منصة الورثة — النسخة الجديدة (Next.js 16 + Prisma 7 + SQLite)
FROM node:22-slim

WORKDIR /app

# better-sqlite3 قد يحتاج أدوات بناء إن لم يتوفر prebuilt binary
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ openssl \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# قيم مؤقتة للبناء فقط — القيم الحقيقية تأتي وقت التشغيل من docker-compose
RUN JWT_SECRET=build-only-placeholder DATABASE_URL=file:./dev.db \
    npx prisma generate && \
    JWT_SECRET=build-only-placeholder DATABASE_URL=file:./dev.db \
    npm run build

EXPOSE 3000

# عند الإقلاع: مزامنة مخطط قاعدة البيانات ثم تشغيل الخادم
CMD ["sh", "-c", "npx prisma db push --skip-generate && npm run start"]
