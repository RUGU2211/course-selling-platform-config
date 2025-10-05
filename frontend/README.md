# Course Selling Platform - Frontend

A modern, responsive React application for the Course Selling Platform, built with TypeScript, Material-UI, and Vite.

## 🚀 Features

### Core Functionality
- **User Authentication**: Login, registration, and role-based access control
- **Course Management**: Browse, search, filter, and enroll in courses
- **Interactive Learning**: Video player with progress tracking and note-taking
- **Dashboard**: Personalized dashboards for students, instructors, and admins
- **Payment Integration**: Secure payment processing for course enrollment
- **Real-time Notifications**: Live updates and notifications

### Technical Features
- **Modern React**: Built with React 19 and TypeScript
- **Material-UI**: Beautiful, responsive design with Material Design components
- **State Management**: React Query for server state and Context API for client state
- **Form Handling**: React Hook Form with Yup validation
- **Routing**: React Router v7 with protected routes
- **Animations**: Framer Motion for smooth animations
- **API Integration**: Comprehensive API services with error handling

## 🛠️ Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite with Rolldown
- **UI Library**: Material-UI (MUI) v7
- **State Management**: React Query + Context API
- **Form Management**: React Hook Form + Yup
- **Routing**: React Router v7
- **Animations**: Framer Motion
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast
- **Charts**: Recharts

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   └── layout/         # Layout components
├── contexts/           # React contexts
├── hooks/              # Custom React hooks
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   ├── courses/       # Course-related pages
│   └── dashboard/     # Dashboard pages
├── services/          # API services
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd course-selling-platf/frontend
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
VITE_API_URL=http://localhost:8765/api
VITE_APP_NAME=Course Selling Platform
VITE_APP_VERSION=1.0.0
```

4. **Start development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Architecture

### Component Architecture
- **Atomic Design**: Components organized by complexity (atoms, molecules, organisms)
- **Container/Presentational**: Separation of logic and presentation
- **Custom Hooks**: Reusable logic extracted into custom hooks

### State Management
- **Server State**: React Query for API data fetching and caching
- **Client State**: React Context for authentication and global UI state
- **Form State**: React Hook Form for form management

### API Integration
- **Service Layer**: Centralized API services with error handling
- **Type Safety**: Full TypeScript integration with API responses
- **Caching**: Intelligent caching with React Query

## 🎨 UI/UX Features

### Design System
- **Material Design**: Consistent design language
- **Responsive**: Mobile-first responsive design
- **Dark Mode**: Support for light/dark themes
- **Accessibility**: WCAG 2.1 compliant

### User Experience
- **Loading States**: Skeleton loaders and progress indicators
- **Error Handling**: User-friendly error messages
- **Animations**: Smooth transitions and micro-interactions
- **Performance**: Optimized bundle size and lazy loading

## 🔐 Security

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Input Validation**: Client and server-side validation
- **XSS Protection**: Sanitized user inputs
- **CSRF Protection**: CSRF tokens for state-changing operations

## 📱 Responsive Design

The application is fully responsive and optimized for:
- **Desktop**: Full-featured experience
- **Tablet**: Adapted layouts and navigation
- **Mobile**: Touch-optimized interface

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📦 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t course-platform/frontend:latest .

# Run container
docker run -p 80:80 course-platform/frontend:latest
```

### Kubernetes Deployment

```bash
# Deploy to Kubernetes
kubectl apply -f ../k8s/frontend-deployment.yaml
```

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------||
| `VITE_API_URL` | Backend API URL | `http://localhost:8765/api` |
| `VITE_APP_NAME` | Application name | `Course Selling Platform` |
| `VITE_APP_VERSION` | Application version | `1.0.0` |

### Build Configuration

The application uses Vite with custom configuration for:
- **Bundle optimization**: Code splitting and tree shaking
- **Asset optimization**: Image compression and lazy loading
- **Development**: Hot module replacement and fast refresh

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use Material-UI components consistently
- Write comprehensive tests
- Follow the established code style
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: Create an issue in the GitHub repository
- **Discussions**: Use GitHub Discussions for questions

## 🗺️ Roadmap

- [ ] Progressive Web App (PWA) support
- [ ] Offline functionality
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (i18n)
- [ ] Advanced course creation tools
- [ ] Live streaming integration
- [ ] Mobile app development
