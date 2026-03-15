import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from './components/ui/sonner';

export default function App() {
  useEffect(() => {
    const isPerformanceMode = localStorage.getItem('nexly_performance_mode') === 'true';
    if (isPerformanceMode) {
      document.body.classList.add('performance-mode');
    }
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
