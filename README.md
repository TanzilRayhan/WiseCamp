# WiseCamp - Project Management Tool

WiseCamp is a modern, intuitive project management application designed to help teams organize, plan, and execute their work efficiently. Built with a clean, Kanban-first approach, it brings projects, boards, and team collaboration into a single, streamlined experience.

This project was developed for **Therap JavaFest 2025** by **Team ArcaneBytes**.

## ✨ Features

-   **Project Management**: Create, update, and delete projects with ease. Each project has its own dedicated space with a name, description, and owner.
-   **Kanban Boards**: Visualize your workflow with flexible Kanban boards. Create custom columns and drag-and-drop cards to track task progress from start to finish.
-   **Team Collaboration**: Invite members to your projects via email. All project members get access to the project's boards and can collaborate on tasks.
-   **User Authentication**: Secure registration and login system to protect your data.
-   **Interactive Dashboard**: Get a quick overview of all your projects, boards, and team statistics from a central dashboard.
-   **Detailed Project View**: Drill down into any project to see its associated boards, manage members, and configure settings.
-   **Responsive Design**: A clean and modern UI that works seamlessly across different screen sizes.

## 🛠️ Tech Stack

### Backend

-   **Java 17**
-   **Spring Boot 3**: For building the robust REST API.
-   **Spring Security**: For handling authentication and authorization with JWT.
-   **Spring Data JPA (Hibernate)**: For object-relational mapping and database interaction.
-   **PostgreSQL**: As the primary relational database.
-   **Maven**: For dependency management and building the project.

### Frontend

-   **React 18**: For building the user interface.
-   **TypeScript**: For type-safe JavaScript development.
-   **Vite**: As the fast build tool and development server.
-   **Tailwind CSS**: For utility-first styling.
-   **React Router**: For client-side routing.
-   **React Hook Form & Zod**: For powerful and type-safe form validation.
-   **React DND**: For implementing drag-and-drop functionality on the Kanban boards.
-   **Axios**: For making HTTP requests to the backend API.

## 🚀 Getting Started

### Prerequisites

-   Java 17 or later
-   Maven 3.x
-   Node.js 18.x or later
-   PostgreSQL database

### Backend Setup

1.  Navigate to the `api` directory.
2.  Configure your database connection in `src/main/resources/application.properties`.
3.  Run the application:
    ```sh
    mvn spring-boot:run
    ```
4.  The backend will be running on `http://localhost:8080`.

### Frontend Setup

1.  Navigate to the `frontend` directory.
2.  Install dependencies:
    ```sh
    npm install
    ```
3.  Create a `.env` file in the `frontend` directory and set the API base URL:
    ```
    VITE_API_BASE_URL=http://localhost:8080/api
    ```
4.  Run the development server:
    ```sh
    npm run dev
    ```
5.  The frontend will be accessible at `http://localhost:5173`.
