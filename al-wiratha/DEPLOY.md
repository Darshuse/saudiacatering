# نشر منصة الورثة الجديدة على waratha.app

دليل تبديل النسخة القديمة (Java + Postgres) بالنسخة الجديدة (Next.js + SQLite) على نفس السيرفر والدومين.

## المتطلبات

- سيرفر عليه Docker و Docker Compose (نفس سيرفر النسخة القديمة يكفي تماماً)
- وصول SSH للسيرفر

## الخطوات

### 1) اجلب الكود الجديد على السيرفر

```bash
git clone -b claude/al-wiratha-platform-puneqz https://github.com/Darshuse/saudiacatering.git
cd saudiacatering/al-wiratha
```

(أو `git fetch && git checkout claude/al-wiratha-platform-puneqz` إن كان المستودع موجوداً)

### 2) أنشئ ملف `.env` بجوار `docker-compose.wiratha.yml`

```bash
cat > .env << 'EOF'
JWT_SECRET="ضع-السر-القوي-هنا"
# اختياري:
# WHATSAPP_NUMBER="9665XXXXXXXX"
EOF
```

> ⚠️ بدون `JWT_SECRET` سيرفض التطبيق الإقلاع — هذا سلوك مقصود للحماية.

### 3) أوقف النسخة القديمة وشغّل الجديدة

```bash
docker compose down            # يوقف warathah القديمة (البيانات القديمة تبقى محفوظة في volume الـ Postgres)
docker compose -f docker-compose.wiratha.yml up -d --build
```

أول تشغيل يبني الصورة (دقائق قليلة). التطبيق يعمل على المنفذ `3000`.

### 4) وجّه الدومين للتطبيق الجديد

إن كان لديك nginx/caddy يخدم waratha.app كان يوجّه للواجهة القديمة على 3000 أصلاً — لا تغيير مطلوب.
إن كان يوجّه لمنفذ آخر، حدّث الـ proxy_pass إلى `http://localhost:3000` وأعد تحميل nginx:

```nginx
server {
    server_name waratha.app;
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    # إعدادات SSL كما هي (certbot)
}
```

> `X-Forwarded-For` مهم — يعتمد عليه تحديد معدل محاولات الدخول.

### 5) تحقق أن كل شيء يعمل

- `https://waratha.app` تفتح الصفحة الرئيسية الجديدة
- `https://waratha.app/calculator` تعمل **بدون تسجيل دخول**
- `https://waratha.app/sitemap.xml` و `robots.txt` يستجيبان
- سجّل حسابك الشخصي **فوراً** — أول حساب مسجّل هو مالك المنصة: يظهر رقم جواله في زر واتساب، وله وحده صفحة `/analytics` (تقرير التحويل)

## ملاحظات

- **بيانات النسخة القديمة**: مخطط قاعدة البيانات مختلف، فالنسخة الجديدة تبدأ بقاعدة نظيفة. بيانات Postgres القديمة تبقى محفوظة في الـ volume الخاص بها ويمكن ترحيلها لاحقاً عند الحاجة.
- **قاعدة البيانات الجديدة** محفوظة في volume باسم `wiratha_data` — تنجو من التحديثات وإعادة البناء.
- **التحديثات مستقبلاً**: `git pull` ثم `docker compose -f docker-compose.wiratha.yml up -d --build`.
- **Google Analytics** (اختياري): متغير `NEXT_PUBLIC_GA_ID` يُحقن وقت البناء — أضفه كـ build arg في الـ compose إن أردت تفعيله.
- **النسخ الاحتياطي**: ملف واحد فقط — `docker run --rm -v wiratha_data:/data -v $(pwd):/backup alpine cp /data/waratha.db /backup/waratha-backup.db`
