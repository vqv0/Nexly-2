import { createBrowserRouter } from 'react-router';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Profile } from './pages/Profile';
import Settings from './pages/Settings';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminMessages from './pages/AdminMessages';
import AdminReports from './pages/AdminReports';
import FriendsPage from './pages/FriendsPage';
import MessagesPage from './pages/MessagesPage';
import ErrorPage from './pages/ErrorPage';
import NotificationsPage from './pages/NotificationsPage';
import { MainLayout } from './components/MainLayout';

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
    element: <MainLayout />,
    ErrorBoundary: ErrorPage,
    children: [
      {
        path: '/dashboard',
        Component: Dashboard,
      },
      {
        path: '/friends',
        Component: FriendsPage,
      },
      {
        path: '/notifications',
        Component: NotificationsPage,
      },
      {
        path: '/profile',
        Component: Profile,
      },
      {
        path: '/profile/:userId',
        Component: Profile,
      },
      {
        path: '/messages',
        Component: MessagesPage,
      },
      {
        path: '/messages/:userId',
        Component: MessagesPage,
      },
      {
        path: '/settings',
        Component: Settings,
      },
    ]
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
  {
    path: '/admin/reports',
    Component: AdminReports,
    ErrorBoundary: ErrorPage,
  },
]);