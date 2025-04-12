# Twinder: Software Requirements Specification (SRS)

## 1. System Design
- **Client-Server Architecture**  
  - Frontend: React application (TypeScript)  
  - Backend: Node.js (TypeScript) with Express  
  - Database: Relational (e.g., PostgreSQL) or NoSQL (e.g., MongoDB), depending on future scaling needs  
- **Key Services**  
  - Authentication & Authorization  
  - Matchmaking (Duo Profiles, Swiping, Matching)  
  - Messaging (Group Chats, One-on-One Chats)  
  - User & Duo Profile Management  

## 2. Architecture Pattern
- **Three-Tier Architecture**  
  1. **Presentation Layer** – React frontend  
  2. **Application/Business Logic Layer** – Node.js/Express server  
  3. **Data Layer** – Database (PostgreSQL or MongoDB)

## 3. State Management
- **React State** for local UI interactions (e.g., open modals, field validation)  
- **Redux Toolkit** or **React Context API** for global application data (user info, duo profile states)  
- **Caching/Memoization** strategies (e.g., React Query) to minimize API calls and improve performance

## 4. Data Flow
- **Frontend**  
  - User actions trigger Redux/Context-based state updates  
  - API calls to backend for authentication, swiping, profile management, and chat  
- **Backend**  
  - Receives requests from frontend, processes logic (matching, chat creation), and reads/writes to the database  
  - Sends responses (JSON) back to the frontend  
- **Database**  
  - Stores persistent data: Users, Duos, Chats, Matches, etc.

## 5. Technical Stack
- **Languages**: TypeScript (frontend & backend)  
- **Frontend Framework**: React (with Redux or Context API)  
- **Backend Framework**: Node.js (Express.js)  
- **Database**: PostgreSQL or MongoDB  
- **Build/Tooling**: Webpack or Vite (for frontend), ESLint, Prettier  
- **Deployment**: Docker containers or cloud-based hosting (Heroku, AWS, etc.)

## 6. Authentication Process
- **Account Creation**  
  - Users register via email; verified upon successful sign-up  
- **Login**  
  - Username/Password exchange for a JSON Web Token (JWT)  
- **Session Management**  
  - Frontend stores JWT securely (e.g., HttpOnly cookie)  
  - Each request to protected endpoints includes the token for validation on the server  
- **Logout**  
  - Client removes stored token; server invalidation can be optional for JWT-based approaches

## 7. Route Design
- **Frontend Routes** (React Router)
  - `/home` – Swipe deck (redirect to duo creation if no active duo)  
  - `/chats` – List of group or one-on-one chats  
  - `/duos` – Manage/create duo profiles  
  - `/profile` – Solo profile management  
  - `/settings` – Account settings and preferences
- **Backend Routes** (Express)
  - **Auth**:  
    - `POST /api/auth/register`  
    - `POST /api/auth/login`  
  - **Profiles**:  
    - `GET /api/profile/:userId` (solo)  
    - `POST /api/profile/duo` (create or update duo)  
  - **Matching**:  
    - `GET /api/match/swipe`  
    - `POST /api/match/like`  
    - `POST /api/match/dislike`  
  - **Chat**:  
    - `GET /api/chats`  
    - `POST /api/chats/:matchId/message`

## 8. API Design
- **RESTful JSON**  
  - **Requests** pass JSON bodies (for creations/updates) or query parameters (for filtering)  
  - **Responses** return JSON with status codes indicating success/failure  
- **Error Handling**  
  - Consistent structure (e.g., `{ "error": "Invalid credentials" }`)  
  - Proper HTTP status codes (400/401/403/404/500)

## 9. Database Design ERD
- **User**  
  - **Fields**: `id`, `email`, `passwordHash`, `name`, `age`, etc.  
  - **Relationships**: can belong to many **Duo** entities
- **Duo**  
  - **Fields**: `id`, `title` or combined name, `bio`, `photos` (array of URLs)  
  - **Relationships**: references exactly two **User** IDs
- **Match**  
  - **Fields**: `id`, `duoAId`, `duoBId`, `isMatched`, `createdAt`  
  - **Relationships**: references two **Duo** entities
- **Chat**  
  - **Fields**: `id`, `matchId`, `isGroupChat` (bool), `createdAt`  
  - **Relationships**: references a **Match** entity
- **Message**  
  - **Fields**: `id`, `chatId`, `userId`, `content`, `timestamp`  
  - **Relationships**: references a **Chat** and a **User**

