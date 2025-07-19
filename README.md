# FlowTix - Bus Ticket Management System

FlowTix is an industry-level bus ticket management system built with Next.js for the frontend and Node.js/Express for the backend.

## Features

- User authentication (login, signup, forgot password)
- Role-based access control (super-admin, bus-owner, user)
- Bus management
- Route and section management
- Trip scheduling
- Ticket booking and management
- Day-end reporting

## Tech Stack

### Frontend
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Axios for API requests

### Backend
- Node.js
- Express
- MongoDB
- JWT Authentication

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB

### Frontend Setup

1. Clone the repository
2. Navigate to the FlowTix directory:
   ```
   cd FlowTix
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env.local` file with the following variables:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5001/api
   NEXT_PUBLIC_APP_NAME=FlowTix
   NEXT_PUBLIC_APP_DESCRIPTION="Bus Ticket Management System"
   ```
5. Start the development server:
   ```
   npm run dev
   ```
6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Setup

1. Navigate to the pos-backend-apis directory:
   ```
   cd pos-backend-apis
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/flowtix
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key
   SESSION_SECRET=your_session_secret_key
   FRONTEND_URL=http://localhost:3000
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Project Structure

### Frontend Structure
```
FlowTix/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js app router pages
│   ├── components/      # React components
│   ├── context/         # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── services/        # API services
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── .env.local           # Environment variables
└── next.config.ts       # Next.js configuration
```

### Backend Structure
```
pos-backend-apis/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # API controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   └── server.js        # Main server file
├── .env                 # Environment variables
└── package.json         # Project dependencies
```

## API Documentation

The API documentation can be found in the Postman collection file: `postman-route-collection.json`

## License

This project is licensed under the MIT License.
