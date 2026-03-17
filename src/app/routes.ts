import { createBrowserRouter } from 'react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Profile } from './pages/Profile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminMessages from './pages/AdminMessages';
import ErrorPage from './pages/ErrorPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Login,
    ErrorBoundary: ErrorPage,
  },
  {
    path: '/register',
    Component: Register,
    ErrorBoundary: ErrorPage,
  },
  {
    path: '/dashboard',
    Component: Dashboard,
    ErrorBoundary: ErrorPage,
  },
  {
    path: '/profile',
    Component: Profile,
    ErrorBoundary: ErrorPage,
  },
  {
    path: '/profile/:userId',
    Component: Profile,
    ErrorBoundary: ErrorPage,
  },
  {
    path: '/admin',
    Component: AdminLogin,
    ErrorBoundary: ErrorPage,
  },
  {
    path: '/admin/dashboard',
    Component: AdminDashboard,
    ErrorBoundary: ErrorPage,
  },
  {
    path: '/admin/users',
    Component: AdminUsers,
    ErrorBoundary: ErrorPage,
  },
  {
    path: '/admin/messages',
    Component: AdminMessages,
    ErrorBoundary: ErrorPage,
  },
]);