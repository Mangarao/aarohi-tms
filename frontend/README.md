# Frontend - Task Management System

React frontend for the Task Management System.

## Setup Instructions

### Prerequisites
- Node.js 16 or higher
- npm or yarn

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

The application will start on `http://localhost:3000`

### Building for Production
```bash
npm run build
```

This creates a `build` folder with production-ready files.

### Features
- Responsive design using Bootstrap
- Role-based navigation
- Real-time dashboard
- Complaint management
- User management (Admin only)
- Mobile-friendly interface

### Environment Configuration
The frontend is configured to proxy API requests to `http://localhost:8080` during development.

For production, update the API base URL in `src/services/api.js`.

### Available Scripts
- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

### Login Credentials
- Admin: admin / admin123
- Staff: staff / staff123
