# Jarvis AI - Intelligent Chat & Collaboration Platform

![Jarvis AI Logo](./Frontend/public/logo.jpg)

**Jarvis AI** is a state-of-the-art full-stack application designed to provide seamless real-time communication and intelligent AI assistance. Built with a modern tech stack, it bridges the gap between traditional chat applications and next-generation AI agents.

## 🚀 Features

-   **Real-time Messaging**: Instant communication using Socket.io.
-   **AI-Powered Assistance**: Integrated with **Groq SDK** for ultra-fast LLM inference.
-   **Smart Context**: Uses **Pinecone** vector database for RAG (Retrieval-Augmented Generation) to give the AI long-term memory and context.
-   **Cross-Platform**: accessible via a responsive **React** web app and a native **Expo** mobile app.
-   **Secure Authentication**: OAuth integration (Google & GitHub) and JWT-based session management.
-   **Modern UI/UX**: Sleek, dark-mode inspired interface with **Framer Motion** animations.

## 🛠️ Tech Stack

### Frontend (Web)
-   **Framework**: React (Vite)
-   **State Management**: Redux Toolkit
-   **Styling**: Vanilla CSS with modern variables & Framer Motion for animations
-   **Networking**: Axios, Socket.io-client

### Backend (API)
-   **Runtime**: Node.js & Express
-   **Database**: PostgreSQL (via Sequelize ORM)
-   **AI Engine**: Groq SDK (LLM) & Pinecone (Vector Search)
-   **Authentication**: Passport.js (Google/GitHub strategies), JWT
-   **Real-time**: Socket.io

### Mobile
-   **Framework**: React Native (Expo)
-   **Navigation**: Expo Router
-   **Storage**: Expo Secure Store

## 📂 Project Structure

```
Jarvis AI/
├── Backend/        # Node.js Express API & AI Logic
├── Frontend/       # React + Vite Web Application
└── mobile/         # React Native Expo Mobile App
```

## 🏁 Getting Started

### Prerequisites
-   Node.js (v18+)
-   PostgreSQL
-   Groq API Key
-   Pinecone API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/jarvis-ai.git
    cd jarvis-ai
    ```

2.  **Backend Setup**
    ```bash
    cd Backend
    npm install
    # Create .env file with DB_URL, GROQ_API_KEY, PINECONE_API_KEY, etc.
    npm run dev
    ```

3.  **Frontend Setup**
    ```bash
    cd ../Frontend
    npm install
    npm run dev
    ```

4.  **Mobile Setup**
    ```bash
    cd ../mobile
    npm install
    npx expo start
    ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the MIT License.
