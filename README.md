# Mabinogi Daily Checklist

A real-time collaborative checklist application for tracking daily tasks in Mabinogi, built with MongoDB, React, Socket.IO, and Google OAuth.

**한글 가이드**: 자세한 한글 설정 가이드는 [SETUP_GUIDE.md](./SETUP_GUIDE.md)를 참고하세요!

## Features

- **Google Authentication**: Secure login with Google OAuth 2.0
- **Real-time Collaboration**: Multiple users can work on checklists simultaneously with instant updates
- **Checklist Management**: Create, update, delete, and share checklists
- **Task Tracking**: Check off items and see who completed them
- **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- Node.js + Express
- MongoDB with Mongoose
- Socket.IO for real-time communication
- Passport.js for Google OAuth
- TypeScript

### Frontend
- React 19 + TypeScript
- Vite
- Socket.IO Client
- Axios for API calls
- Inline styling (easily replaceable with CSS-in-JS or Tailwind)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB)
- Google OAuth credentials

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/JungoLee/mabinogi-daily.git
   cd mabinogi-daily
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install

   # Copy environment variables
   cp .env.example .env
   ```

   Edit `.env` and add your credentials:
   - `MONGODB_URI`: Your MongoDB connection string
   - `GOOGLE_CLIENT_ID`: From Google Cloud Console
   - `GOOGLE_CLIENT_SECRET`: From Google Cloud Console
   - `SESSION_SECRET`: Random string for session encryption
   - `JWT_SECRET`: Random string for JWT signing

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install

   # Copy environment variables
   cp .env.example .env
   ```

   Edit `.env`:
   ```
   VITE_API_URL=http://localhost:5000
   VITE_SOCKET_URL=http://localhost:5000
   ```

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Add authorized redirect URI: `http://localhost:5000/auth/google/callback`
6. Copy Client ID and Client Secret to backend `.env`

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

## Deployment to Render

### Option 1: Using Render Dashboard

1. **Deploy Backend**
   - Go to [Render Dashboard](https://render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - Name: `mabinogi-daily-backend`
     - Root Directory: `backend`
     - Build Command: `npm install && npm run build`
     - Start Command: `npm start`
   - Add environment variables (same as `.env`)

2. **Deploy Frontend**
   - Click "New +" → "Static Site"
   - Connect your GitHub repository
   - Configure:
     - Name: `mabinogi-daily-frontend`
     - Root Directory: `frontend`
     - Build Command: `npm install && npm run build`
     - Publish Directory: `dist`
   - Add environment variables:
     - `VITE_API_URL`: Your backend URL
     - `VITE_SOCKET_URL`: Your backend URL

3. **Update Google OAuth**
   - Add your Render backend URL to authorized redirect URIs
   - Format: `https://your-backend.onrender.com/auth/google/callback`

### Option 2: Using render.yaml (Blueprint)

The project includes a `render.yaml` file for easier deployment:

1. Push your code to GitHub
2. In Render Dashboard, click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically create both services
5. Add the required environment variables in the Render dashboard

## Project Structure

```
mabinogi-daily/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts      # MongoDB connection
│   │   │   └── passport.ts      # Google OAuth config
│   │   ├── models/
│   │   │   ├── User.ts          # User schema
│   │   │   └── Checklist.ts     # Checklist schema
│   │   ├── routes/
│   │   │   ├── auth.ts          # Authentication routes
│   │   │   └── checklist.ts     # Checklist CRUD routes
│   │   ├── middleware/
│   │   │   └── auth.ts          # Auth middleware
│   │   └── index.ts             # Main server file
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChecklistCard.tsx      # Checklist preview card
│   │   │   └── ChecklistDetail.tsx    # Checklist detail modal
│   │   ├── pages/
│   │   │   ├── Login.tsx              # Login page
│   │   │   └── Home.tsx               # Main dashboard
│   │   ├── hooks/
│   │   │   ├── useAuth.ts             # Authentication hook
│   │   │   └── useSocket.ts           # Socket.IO hook
│   │   ├── services/
│   │   │   ├── api.ts                 # API client
│   │   │   └── socket.ts              # Socket.IO client
│   │   ├── types/
│   │   │   └── index.ts               # TypeScript types
│   │   └── App.tsx                    # Main app component
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## API Endpoints

### Authentication
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - OAuth callback
- `GET /auth/current` - Get current user
- `GET /auth/logout` - Logout

### Checklists
- `GET /api/checklists` - Get all user's checklists
- `GET /api/checklists/:id` - Get single checklist
- `POST /api/checklists` - Create new checklist
- `PUT /api/checklists/:id` - Update checklist
- `DELETE /api/checklists/:id` - Delete checklist
- `POST /api/checklists/:id/share` - Share checklist with users

## Socket.IO Events

### Client → Server
- `join-checklist` - Join a checklist room
- `leave-checklist` - Leave a checklist room
- `checklist-updated` - Broadcast checklist update
- `item-toggled` - Broadcast item toggle

### Server → Client
- `checklist-changed` - Checklist was updated
- `item-changed` - Item was toggled

## Environment Variables

### Backend
```env
MONGODB_URI=mongodb+srv://...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
SESSION_SECRET=...
JWT_SECRET=...
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Frontend
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

ISC

## Author

JungoLee
