# 🏫 School ERP System

A full-stack MERN School ERP with role-based auth for Admin, Teacher, Student, and Parent.

---

## 🚀 Setup Instructions

### Step 1 — Setup Backend (server)
```bash
cd server
npm install
```
Create your `.env` file:
```bash
copy .env.example .env
```
Open `.env` and add your MongoDB Atlas URI:
```
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/school-erp
JWT_SECRET=mysecretkey123
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
```
Run the server:
```bash
npm run dev
```
You should see: ✅ MongoDB connected | 🚀 Server running on port 5000

---

### Step 2 — Setup Frontend (client)
```bash
cd client
npm install
npm start
```
Browser opens at http://localhost:3000 🎉

---

## 👥 Roles
| Role    | Access |
|---------|--------|
| Admin   | Full control, create users |
| Teacher | Homework, results, attendance |
| Student | View results, homework, fees |
| Parent  | Monitor child's progress |

## 📦 Modules Built
- ✅ Auth system (JWT + bcrypt)
- ✅ Role-based routing
- ✅ Login & Register pages
- ✅ All 4 dashboards
- 🔜 Fee Management
- 🔜 Results & Marks
- 🔜 Homework Tracking
- 🔜 Attendance
- 🔜 Timetable
