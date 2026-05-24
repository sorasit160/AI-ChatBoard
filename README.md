# AI-ChatBoard

Project Structure
d:\AI2\
├── frontend/               # React + Vite app
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Zustand stores
│   │   ├── i18n/           # Translation files (th, en)
│   │   ├── api/            # Axios API client
│   │   └── styles/         # Global CSS
│   ├── tests/              # Playwright E2E tests
│   └── package.json
│
└── backend/                # Express API server
    ├── src/
    │   ├── routes/         # API route handlers
    │   ├── middleware/     # Auth, logging middleware
    │   ├── services/       # Business logic
    │   ├── db/             # SQLite setup + migrations
    │   └── types/          # TypeScript types
    └── package.json


Walkthrough: AI ChatBoard & Analytics Dashboard
ผมได้พัฒนา Full-Stack Application เสร็จสมบูรณ์ตามความต้องการแล้วครับ ประกอบด้วยระบบ Frontend (React/Vite) และ Backend (Node.js/Express) ที่แยกส่วนกันอย่างชัดเจน พร้อมการออกแบบ UI ที่ทันสมัยแบบ Glassmorphism และฟีเจอร์ครบถ้วนครับ

🚀 ฟีเจอร์ที่พัฒนาสำเร็จ
1. 🤖 AI Chatbot (Public)
หน้า / เป็นแชทบอทที่เปิดให้ทุกคนใช้งานได้โดยไม่ต้องล็อกอิน
เชื่อมต่อกับ Google Gemini 2.0 Flash API
มีระบบ Smart Mock Fallback: ถ้าไม่ได้ใส่ API Key ในไฟล์ .env ระบบจะจำลองการตอบกลับเพื่อให้ทดสอบพัฒนาต่อได้ทันที
รองรับการเรนเดอร์ Markdown, Code Blocks, และมีเอฟเฟกต์พิมพ์ข้อความ (Typing indicator)
2. 🔐 ระบบ Authentication
สมัครสมาชิกและเข้าสู่ระบบด้วย JWT
หน้าเว็บได้รับการปกป้องด้วย ProtectedRoute (ต้องล็อกอินก่อนเข้า Board และ Dashboard)
การจัดการ State ฝั่ง Frontend ใช้ Zustand พร้อมจำรหัสผ่านลง localStorage
3. 📋 Community Board (Protected)
หน้ารวมกระทู้ (Board) พร้อมระบบค้นหา
ระบบโพสต์ (ตั้งหัวข้อและเนื้อหา)
ระบบตอบกลับ (Reply) ในรูปแบบ Thread View
แสดงจำนวนผู้เข้าชม และจำนวนการตอบกลับ
เจ้าของโพสต์และแอดมินสามารถลบโพสต์ได้
4. 📊 Analytics Dashboard (Protected)
แสดงสถิติแบบ Real-time: จำนวนผู้ใช้, แชท, โพสต์, และข้อความวันนี้
กราฟ Recharts: แสดงแนวโน้มการใช้งานย้อนหลัง (7 วัน / 30 วัน)
ตาราง Top Users: จัดอันดับผู้ใช้ที่สร้างกิจกรรมมากที่สุด (ใช้สูตรคำนวณคะแนนจากโพสต์ แชท และตอบกลับ)
รายการ Recent Activity: แสดงสิ่งที่ผู้ใช้กระทำล่าสุด
5. 🌐 ระบบสองภาษา (i18n)
สลับภาษาไทย / อังกฤษ ได้ตลอดเวลาจากแถบเมนูด้านบน
ใช้ react-i18next ในการจัดการภาษาและจำค่าใน Browser
6. 🧪 E2E Testing (Playwright)
เตรียม Test scripts ทั้งหมดไว้ในโฟลเดอร์ frontend/tests/
ครอบคลุมการทดสอบ:
auth.spec.ts: สมัครสมาชิก, ล็อกอิน, การเปลี่ยนเส้นทาง
chat.spec.ts: การส่งแชทและการแสดงผล
board.spec.ts: การตั้งโพสต์ใหม่และการตอบกลับ
dashboard.spec.ts: การโหลดกราฟและสถิติ
i18n.spec.ts: การสลับภาษา
💻 Tech Stack ที่ใช้จริง
Frontend: React 18, Vite, TypeScript, Vanilla CSS (Custom Design Variables), Zustand, Recharts, Axios
Backend: Node.js, Express, TypeScript, sql.js (WebAssembly SQLite แบบไม่ต้องคอมไพล์ Native ให้ยุ่งยาก)
Database: SQLite (เก็บไฟล์ในรูปแบบ database.sqlite)
⚙️ วิธีการรันโปรเจ็กต์
คุณสามารถเปิด 2 Terminal เพื่อรัน Backend และ Frontend พร้อมกันได้เลย:

Terminal 1 (Backend):

bash

cd backend
npm run dev
Terminal 2 (Frontend):

bash

cd frontend
npm run dev
TIP

หากต้องการใช้งาน AI ของจริง ให้ไปที่ไฟล์ backend/.env และใส่ค่า GEMINI_API_KEY (รับฟรีได้จาก Google AI Studio) แต่ตอนนี้ผมได้ทำระบบ Mock AI ไว้ให้แล้ว คุณสามารถทดลองพิมพ์แชทได้ทันทีแม้ยังไม่มี API Key ครับ

🧪 วิธีการรัน Playwright Tests
bash

cd frontend
npx playwright install --with-deps  # รันครั้งแรกเท่านั้น
npx playwright test                 # รันแบบเบื้องหลัง
npx playwright test --ui            # รันพร้อมเปิดหน้าต่าง UI
