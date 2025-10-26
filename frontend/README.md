# Course Selling Platform - Frontend

A modern React-based frontend application for the Course Selling Platform microservices architecture.

## 🚀 Features

- **Modern React Architecture**: Built with React 19, TypeScript, and Vite
- **Material-UI Design System**: Beautiful, responsive UI components
- **State Management**: React Query for server state, Context API for client state
- **Authentication**: JWT-based authentication with role-based access control
- **API Integration**: Comprehensive integration with all backend microservices
- **Responsive Design**: Mobile-first, responsive design
- **Docker Support**: Containerized with Nginx for production deployment

## 🛠️ Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Query** - Server state management
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **Yup** - Schema validation
- **Framer Motion** - Animations
- **Recharts** - Data visualization

## 📁 Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   └── layout/       # Layout components
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom hooks
│   ├── pages/            # Page components
│   │   ├── auth/         # Authentication pages
│   │   ├── courses/      # Course-related pages
│   │   ├── dashboard/    # Dashboard pages
│   │   └── ...
│   ├── services/         # API services
│   ├── types/            # TypeScript type definitions
│   ├── utils/            # Utility functions
│   └── App.tsx           # Main application component
├── Dockerfile            # Docker configuration
├── nginx.conf            # Nginx configuration
└── package.json          # Dependencies and scripts
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker (for containerized deployment)

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5173
   ```

### Production Build

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Preview production build:**
   ```bash
   npm run preview
   ```

## 🐳 Docker Deployment

### Build and Run with Docker

1. **Build the Docker image:**
   ```bash
   docker build -t course-platform-frontend .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:80 course-platform-frontend
   ```

### Using Docker Compose

The frontend is included in the main `docker-compose.yml` file:

```bash
# Start all services including frontend
docker-compose up -d

# Start only frontend with dependencies
docker-compose up -d frontend
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8765` |
| `VITE_APP_NAME` | Application name | `Course Selling Platform` |
| `VITE_ENABLE_DEBUG` | Enable debug mode | `false` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key for payments | - |

### API Integration

The frontend integrates with the following backend services:

- **User Management Service** (`/user-management-service/api/users/`)
- **Course Management Service** (`/course-management-service/api/courses/`)
- **Enrollment Service** (`/enrollment-service/api/enrollments/`)
- **Payment Service** (`/payment-service/api/payments/`)
- **Notification Service** (`/notification-service/api/notifications/`)
- **Content Delivery Service** (`/content-delivery-service/api/content/`)

## 📱 Features Overview

### Authentication & Authorization
- User registration and login
- JWT token management
- Role-based access control (Student, Instructor, Admin)
- Protected routes

### Course Management
- Browse and search courses
- Course details and enrollment
- Course content streaming
- Course reviews and ratings

### User Dashboard
- Student dashboard with enrolled courses
- Instructor dashboard for course management
- Admin dashboard for platform management

### Payment Integration
- Razorpay payment gateway integration
- Payment history and management
- Refund processing

### Notifications
- Real-time notifications
- Email notifications
- In-app notification system

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Type checking
npm run type-check
```

## 📦 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm test` | Run tests |

## 🔒 Security

- JWT token authentication
- Secure HTTP headers via Nginx
- CORS configuration
- Input validation and sanitization
- XSS protection

## 🚀 Performance

- Code splitting and lazy loading
- Image optimization
- Gzip compression
- Browser caching
- CDN-ready static assets

## 🐛 Troubleshooting

### Common Issues

1. **API Connection Issues:**
   - Check `VITE_API_URL` environment variable
   - Ensure backend services are running
   - Check CORS configuration

2. **Build Issues:**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

3. **Docker Issues:**
   - Check Docker daemon is running
   - Verify Dockerfile syntax
   - Check port conflicts

### Debug Mode

Enable debug mode by setting `VITE_ENABLE_DEBUG=true` in your environment variables.

## 📄 License

This project is part of the Course Selling Platform microservices architecture.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions, please contact the development team.