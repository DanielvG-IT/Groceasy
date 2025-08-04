# Groceasy

Groceasy is a self-hosted web and mobile app for managing household shopping lists with ease. Designed for families and housemates, it lets multiple users create, organize, and complete shopping lists collaboratively — all with powerful tagging, role-based permissions, and mobile-first usability.

## Features

- **Collaborative Lists:** Multiple users can create and manage shopping lists together.
- **Tagging:** Organize items with customizable tags for easy filtering.
- **Role-Based Permissions:** Assign roles to users for secure and flexible list management.
- **Mobile-First Design:** Optimized for smartphones and tablets.
- **Self-Hosted:** Run Groceasy on your own server for privacy and control.

## Getting Started

1. **Clone the repository:**

```bash
git clone https://github.com/DanielvG-IT/groceasy.git
```

2. **Set up the .NET backend:**

- Navigate to the backend directory:
  ```bash
  cd groceasy/backend/Backend.API
  ```
- Restore dependencies:
  ```bash
  dotnet restore
  ```
- Configure environment variables:  
  Copy `appsettings.example.json` to `appsettings.json` and update settings as needed.

- Run the backend:
  ```bash
  dotnet run
  ```

3. **Set up the Next.js frontend:**

- Navigate to the frontend directory:
  ```bash
  cd ../frontend
  ```
- Install dependencies:
  ```bash
  npm install
  ```
- Configure environment variables:  
  Copy `.env.example` to `.env` and update settings as needed.
- Start the frontend:
  ```bash
  npm run
  ```

4. **Access the application:**

- Open your browser and navigate to `http://localhost:3000` for the frontend.
- The backend API will be running on `http://localhost:5000` by default.

## Screenshots

_Coming soon_

<!--
![Groceasy Mobile Screenshot](docs/screenshots/mobile.png)
![Groceasy Web Screenshot](docs/screenshots/web.png)
-->

<!-- ## License

This project is licensed under the ???? License.
 -->
