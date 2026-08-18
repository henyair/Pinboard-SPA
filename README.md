# 📌 Pinboard SPA - Neighborhood Ad Board

A modern, fully containerized Single Page Application (SPA) designed to connect neighbors through local classified ads. This project implements a complete full-stack architecture with a focus on clean UI/UX, robust state management, and modern deployment practices.

## ✨ Key Features

* **Full CRUD & Ownership**: Create, read, update, and delete ads seamlessly. A built-in authentication system ensures that users can only edit or delete ads they authored.
* **Smart Location & Reverse Geocoding**: Integrates with the browser's native Geolocation API to fetch coordinates, which are then passed through the OpenStreetMap Nominatim API (Reverse Geocoding) to automatically tag ads with human-readable city names.
* **Advanced Spatial Filtering**: Filter the ad board dynamically by categories (Buy & Sell, Events, Rent, Travel, Other), free-text search, or proximity (utilizing the Haversine formula on the backend to find ads within a specific radius).
* **Modern SaaS UI**: A clean, responsive design system built entirely with Angular Standalone Components, featuring unified color palettes, CSS variables, and modal-based form interactions.
* **Thread-Safe File Storage**: The backend utilizes a lightweight local JSON file database, strictly managed with `SemaphoreSlim` to ensure thread-safe read/write operations in a concurrent environment.

## 🛠️ Tech Stack

* **Frontend**: Angular 17+ (Standalone Components), RxJS, SCSS.
* **Backend**: .NET 5.0 (C# ASP.NET Core), RESTful API.
* **Infrastructure / DevOps**: Docker, Docker Compose, Nginx (configured as a web server and a reverse proxy to prevent CORS issues in production).

## 🚀 Getting Started (Recommended: Docker)

The easiest way to get the application running is via Docker. The provided `docker-compose` setup uses multi-stage builds to compile both the .NET backend and the Angular frontend, completely eliminating the need for local SDKs.

### Prerequisites
* Docker and Docker Compose installed on your machine.

### Installation & Run
1. Clone this repository to your local machine:
   ```bash
   git clone <your-repository-url>
   cd Pinboard-SPA

Build and start the containers in detached mode:

docker-compose up -d --build

Open your browser and navigate to: http://localhost:4200

(Note: The backend API runs internally on port 5001. Nginx handles the routing by proxying any /api/ traffic directly to the backend container).

💻 Local Development Setup (Without Docker)
If you prefer to run the environments manually for development:

1. Start the Backend (.NET):

cd Backend
dotnet run

The backend will listen on http://localhost:5001.

2. Start the Frontend (Angular):
Open a new terminal window:

cd Frontend
npm install
npm start

The Angular CLI will start the dev server at http://localhost:4200 and proxy API requests to the backend.

🏗️ Architecture & Design Decisions
State Management: The frontend uses RxJS BehaviorSubject and Subject within services to reactively manage authentication state, filter states, and trigger UI updates across disparate components without tight coupling.

Security & Auth: The backend manages a local user ledger. Endpoints returning user objects strip sensitive data (like passwords) before serialization.

Multi-stage Docker Builds: Ensures the final Docker images contain only the compiled execution files (ASP.NET runtime and compiled Angular static files on Nginx), keeping the containers lightweight and secure.