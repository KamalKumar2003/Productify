# Productify 🛒

Productify is a simple **Product Management System** built using **Node.js, Express, EJS**, and **PostgreSQL (Neon)**.  
It supports full **CRUD operations** (Create, Read, Update, Delete) for managing products and uses a **cloud database**.

---

## ✨ Features
- View total product count
- View all products
- Add new products
- Edit existing products
- Delete products
- Server-side rendering with EJS
- Secure PostgreSQL queries
- Free cloud database using Neon

---

## 🛠 Tech Stack
- **Node.js**
- **Express.js**
- **PostgreSQL (Neon)**
- **EJS**
- **pg**
- **dotenv**
- **method-override**

---

## 📁 Folder Structure
Productify/
├── views/
│ ├── home.ejs
│ ├── showproducts.ejs
│ ├── new.ejs
│ └── edit.ejs
├── index.js
├── package.json
├── .env
├── .gitignore
└── README.md


---

## ⚙️ Environment Setup

Create a `.env` file in the root directory:

```env
DATABASE_URL=postgresql://USER:PASSWORD@ep-xxxx.ap-south-1.aws.neon.tech/shop_app?sslmode=require
PORT=2020

CREATE TABLE products (
  id INT PRIMARY KEY,
  item VARCHAR(100),
  price INT,
  stock INT,
  supplier VARCHAR(100)
);

git clone https://github.com/your-username/Productify.git
cd Productify
npm install
node index.js
