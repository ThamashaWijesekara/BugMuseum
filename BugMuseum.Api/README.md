# 🐛 Bug Museum - Backend API

> ASP.NET Core 8 Web API powering the Bug Museum platform with PostgreSQL persistence and Gemini AI diagnostic integration.

---

## 🛠️ Tech Stack & Architecture
* **Framework:** ASP.NET Core 8 Web API
* **ORM:** Entity Framework Core
* **Database:** PostgreSQL
* **Authentication:** JWT (JSON Web Tokens) with Curator Roles
* **AI Service:** Google Gemini API (`generativelanguage.googleapis.com`)
* **Media Uploads:** Cloudinary Service

---

## 🚀 Local Setup Instructions

1. **Configure Settings:**
   Copy `appsettings.Example.json` to `appsettings.json` and set your PostgreSQL connection string and Gemini API key:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=BugMuseumDb;Username=postgres;Password=YOUR_PASSWORD"
     },
     "GeminiSettings": {
       "ApiKey": "YOUR_GEMINI_API_KEY",
       "Model": "gemini-1.5-flash"
     }
   }