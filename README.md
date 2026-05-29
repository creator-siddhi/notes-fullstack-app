# 📝 NoteStream - Full Stack MERN Notes Application

A secure, responsive, full-stack notes management application built using the MERN stack. Users can create, read, update, delete (CRUD), and organize notes effortlessly with real-time feedback and clean, modern aesthetics.

## 🎯 Features

- **🔐 Secure Authentication:** User registration and login utilizing JSON Web Tokens (JWT) and encrypted passwords (bcrypt).
- **📋 Full CRUD Functionality:** Create, view, update, and delete text-based notes smoothly.
- **🏷️ Organization:** Categorize notes using custom tags or color codes for quick filtering.
- **📱 Responsive Layout:** A sleek, minimal dashboard designed with Tailwind CSS that works flawlessly on mobile, tablet, and desktop screens.
- **⚡ Protected API Routes:** Secure backend architecture ensuring users can only access, edit, or delete their own data.

## 🏗️ Architecture & Tech Stack

This application is split into two distinct layers to maintain a clean separation of concerns:

### Frontend (Client)
- **React.js** – Component-based UI rendering
- **Tailwind CSS** – Utility-first modern layout and styling
- **Axios** – Promise-based HTTP client for API communication
- **React Router** – Client-side routing for seamless navigation

### Backend (Server)
- **Node.js & Express.js** – Fast, unopinionated REST API development
- **MongoDB & Mongoose** – NoSQL database schema modeling for structured data storage
- **JWT (JSON Web Tokens)** – Stateless user session authentication

---

## 🛠️ Installation & Local Setup

Follow these steps to spin up the development environment on your local machine:

### Prerequisite
Ensure you have **Node.js** and **MongoDB** (Local or MongoDB Atlas connection string) installed.

