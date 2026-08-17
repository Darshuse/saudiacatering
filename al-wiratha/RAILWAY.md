# النشر على Railway — منصة ورثة

## المهم أولاً: قاعدة البيانات على Railway

نظام ملفات Railway **مؤقت** — يُمسح مع كل نشر. قاعدتنا SQLite (ملف)، لذلك **يجب إضافة Volume**
وإلا ضاعت كل البيانات عند كل تحديث. (بديل مستقبلي: التحويل إلى Postgres — إضافة Railway جاهزة.)

## إعدادات الخدمة (تُضبط مرة واحدة من لوحة Railway)

1. **Root Directory**: `al-wiratha`
   (المستودع فيه مشروع قديم في الجذر؛ هذا الإعداد يجعل Railway يبني تطبيقنا الجديد لا القديم.)
2. **Volume**: أضِف Volume ووصّله على المسار `/app/data`
3. **Variables** (متغيرات البيئة):
   - `JWT_SECRET` = سر قوي (`openssl rand -base64 32`)
   - `DATABASE_URL` = `file:/app/data/waratha.db`
   - `UPLOADS_DIR` = `/app/data/uploads`
   - `NEXT_PUBLIC_SITE_URL` = `https://waratha.app`
   - `NODE_ENV` = `production`
   - (اختياري) بيانات الجهة المشغّلة: `NEXT_PUBLIC_OPERATOR_ENTITY` … إلخ
4. **Networking**: اربط الدومين `waratha.app` بالخدمة (Settings → Domains)، وحدّث DNS إلى النطاق الذي يعطيه Railway.

## طريقتان للنشر

### أ) تلقائي عبر GitHub (زي كل مرة)
Railway مربوط بالمستودع ويبني تلقائياً عند كل push على الفرع الذي يراقبه.
- إن كان يراقب `main`: تُدمج التغييرات من فرع `claude/al-wiratha-platform-puneqz` إلى `main` فيبدأ البناء.
- إن كان يراقب فرعاً آخر: يُضبط الفرع في Settings → Source.

### ب) عبر Railway CLI (إن أردتَ نشراً مباشراً)
```bash
npm i -g @railway/cli
railway login          # يفتح المتصفح
railway link           # اختر المشروع/الخدمة
railway up             # يبني وينشر من مجلد al-wiratha
```

## ملاحظة
البيئة المعزولة لهذه الجلسة لا تصل إلى Railway، لذا لا يمكن تنفيذ `railway up` من هنا.
لتنفيذ النشر آلياً من CI، يلزم `RAILWAY_TOKEN` كـ secret في المستودع.
