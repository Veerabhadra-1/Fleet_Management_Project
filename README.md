## 🚛 Transport Management System

A full-stack Transport Management System built using the MERN Stack to manage vehicles, drivers, delivery routes, pricing, and reporting efficiently.

This system enables users to view available transport vehicles and detailed delivery information, while administrators can manage transport operations with complete control.

## 🌟 Features
# 👥 User Features

View available vehicle types

Access complete vehicle details:

Vehicle image

License plate number

Vehicle ID

Driver name & contact number

Delivery destination

Location map

Cost per kilometer

Simple and responsive interface

# 👨‍💼 Admin Features

Add new vehicles with images

Update vehicle details and pricing

Manage driver information

Modify delivery areas

Delete vehicle records

Search and retrieve vehicle data

Generate transport reports in PDF format

# 🔄 System Functionalities

Full CRUD Operations (Create, Read, Update, Delete)

Secure authentication & role-based access

Dynamic pricing updates (fuel price, discounts, offers)

Real-time data management

PDF report generation

Clean and responsive UI

🛠 Tech Stack (MERN)
🔹 MongoDB

NoSQL database used to store vehicle, driver, and transport data.

🔹 Express.js

Backend framework for building REST APIs and handling server-side logic.

🔹 React.js

Frontend library for building dynamic and reusable UI components.

🔹 Node.js

JavaScript runtime used to power the backend server.

# 📂 Project Structure
transport-management/
│
├── FRONTEND/        # React Application
├── BACKEND/         # Node.js + Express Server
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── scripts/
│   └── server.js
└── README.md
⚙️ Installation & Setup
1️⃣ Clone the Repository
git clone https://github.com/your-username/transport-management.git
cd transport-management
2️⃣ Backend Setup
cd BACKEND
npm install

Create a .env file inside BACKEND:

MONGO_URL=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:3000
NODE_ENV=development

Run backend:

npm start
3️⃣ Frontend Setup
cd FRONTEND
npm install
npm start
📊 Report Generation

The system allows administrators to generate detailed transport activity reports in PDF format for operational analysis and record maintenance.

# 🎯 Project Highlights

✔ End-to-End Full Stack Development
✔ Real-world Transport & Logistics Use Case
✔ Secure Authentication System
✔ Clean UI with Responsive Design
✔ Scalable MERN Architecture
