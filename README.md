# Corporate Travel Planning System

A full-stack web application designed to streamline corporate travel management by handling travel requests, approval workflows, expense tracking, and employee travel records through a centralized platform.

---

## 📌 Project Overview

Organizations often face challenges managing employee travel requests, approvals, bookings, and reimbursements manually. This system digitizes the entire workflow, improving efficiency, transparency, and record management.

The application provides role-based access for Employees, Managers, and Administrators, enabling seamless travel request processing and expense management.

---

## 🚀 Key Features

### Employee Module

* Submit travel requests
* Track request status
* Upload supporting documents
* Manage travel details and expenses
* View travel history

### Manager Module

* Review submitted travel requests
* Approve or reject requests
* Monitor employee travel activities

### Admin Module

* Manage users and roles
* Oversee travel requests
* Generate reports and insights
* Maintain system configurations

### Security

* JWT-based Authentication
* Role-Based Authorization (RBAC)
* Secure API endpoints

---

## 🏗️ Architecture

The backend follows a layered architecture to maintain separation of concerns and scalability.

```text
Backend
│
├── ETMs.API          --> ASP.NET Core Web API
├── ETMs.Services     --> Business Logic Layer
├── ETMs.Data         --> Data Access Layer (EF Core)
└── ETMs.Models       --> DTOs, Models & Enums

Frontend
│
└── TravelSystem__1   --> Angular Application
```

---

## 🛠️ Technology Stack

### Backend

* ASP.NET Core 8 Web API
* Entity Framework Core
* SQL Server
* JWT Authentication
* Swagger/OpenAPI

### Frontend

* Angular
* TypeScript
* HTML5
* CSS3
* RxJS

### Database

* Microsoft SQL Server

### Development Tools

* Visual Studio 2022
* Visual Studio Code
* Git & GitHub

---

## 📂 Project Structure

```text
Travel Management System
│
├── Backend
│   ├── ETMs.API
│   ├── ETMs.Data
│   ├── ETMs.Models
│   ├── ETMs.Services
│   └── ETMs_Solution.csproj
│
└── TravelSystem__1
```

---

## ⚙️ Prerequisites

Before running the project, ensure the following are installed:

* .NET 8 SDK
* SQL Server
* Node.js (Latest LTS Recommended)
* npm
* Visual Studio 2022 / VS Code
* Angular CLI (Optional)

---

# Backend Setup

## 1. Configure Database

Open:

```text
Backend/ETMs.API/appsettings.json
```

Update the connection string:

```json
"ConnectionStrings": {
  "DefaultConnection": "Data Source=YOUR_SERVER;Initial Catalog=EmployeeTravelManagementSystem;Integrated Security=True;Encrypt=False"
}
```

---

## 2. Configure JWT Authentication

Update JWT settings:

```json
"Jwt": {
  "Key": "YourSecretKey",
  "Issuer": "YourIssuer",
  "Audience": "YourAudience"
}
```

---

## 3. Restore Packages

```bash
dotnet restore Backend/ETMs.API/ETMs.API.csproj
```

---

## 4. Build Project

```bash
dotnet build Backend/ETMs.API/ETMs.API.csproj
```

---

## 5. Run Backend

```bash
dotnet run --project Backend/ETMs.API/ETMs.API.csproj
```

Backend will start on:

```text
https://localhost:<port>
```

Swagger UI:

```text
https://localhost:<port>/swagger
```

---

# Frontend Setup

Navigate to Angular project:

```bash
cd TravelSystem__1
```

Install dependencies:

```bash
npm install
```

Run Angular application:

```bash
npm start
```

or

```bash
ng serve
```

Application URL:

```text
http://localhost:4200
```

---

## 🔄 API Integration

The Angular frontend communicates with the ASP.NET Core Web API.

Ensure:

* Backend is running before frontend.
* API base URL in Angular environment files matches the backend URL.
* CORS is configured to allow:

```text
http://localhost:4200
```

---

## 📁 File Upload Support

The application supports document uploads.

Uploaded files are stored in:

```text
Uploads/
```

and served through the API.

---

## 🔐 Authentication & Authorization

The application uses:

* JWT Token Authentication
* Role-Based Access Control (RBAC)

Roles include:

* Employee
* Manager
* Administrator

---

## 🚀 Future Enhancements

* Email Notifications
* Travel Booking Integration
* Advanced Reporting Dashboard
* Expense Approval Workflow
* Audit Logging

---

## 👨‍💻 Author

**Yash Barbhaya**

Computer Engineering Graduate (2026)

Technologies:
ASP.NET Core • Angular • SQL Server • Entity Framework Core • JWT Authentication

---

## 📄 License

This project is developed for educational and portfolio purposes.
