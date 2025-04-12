# Twinder

A location-based dating app for pairs of friends looking to meet other pairs.

## Project Structure

```
twinder/
├── packages/
│   ├── frontend/     # React frontend application
│   └── backend/      # Node.js/Express backend server
├── Documentation/    # Project documentation
└── package.json      # Root package.json with workspace configuration
```

## Tech Stack

- **Frontend**: React (TypeScript) with Redux Toolkit
- **Backend**: Node.js/Express (TypeScript)
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Docker and Docker Compose (optional)

### Development Setup

#### Option 1: Using npm

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/twinder.git
   cd twinder
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Create a .env file in packages/backend
   cp packages/backend/.env.example packages/backend/.env
   ```

4. Start both frontend and backend in development mode:
   ```bash
   npm run dev
   ```

#### Option 2: Using Docker

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/twinder.git
   cd twinder
   ```

2. Start the Docker containers:
   ```bash
   docker-compose up
   ```

### Deployment

#### Option 1: Using the deployment script

1. Run the deployment script:
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

2. Copy the generated `deploy` directory to your server.

3. On your server:
   ```bash
   cd deploy
   npm install --production
   npm start
   ```

#### Option 2: Using Docker

1. Build the Docker image:
   ```bash
   docker build -t twinder .
   ```

2. Run the Docker container:
   ```bash
   docker run -p 5000:5000 -e DB_HOST=your_db_host -e DB_PASSWORD=your_db_password twinder
   ```

## API Documentation

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login

### Profiles

- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update user profile
- `POST /api/profile/photo` - Upload profile photo

### Duo Profiles

- `GET /api/profile/duo` - Get all duo profiles for current user
- `POST /api/profile/duo` - Create a new duo profile
- `GET /api/profile/duo/:id` - Get a specific duo profile
- `PUT /api/profile/duo/:id` - Update a duo profile

### Matching

- `GET /api/match/swipe` - Get potential matches
- `POST /api/match/like` - Like a duo
- `POST /api/match/dislike` - Dislike a duo
- `GET /api/match` - Get all matches

### Chat

- `GET /api/chats` - Get all chats
- `GET /api/chats/:id` - Get a specific chat with messages
- `POST /api/chats/:id/message` - Send a message

## Development

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:5000

## Documentation

- [Software Requirements Specification](Twinder-software-requirement-specifications.md)
- [Product Requirements Document](Twinder-product-requirements.md)
- [UX Design Document](Twinder-ux-design.md) 