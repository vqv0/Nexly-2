import { useNavigate, useRouteError } from 'react-router';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { AlertCircle, Home } from 'lucide-react';

export default function ErrorPage() {
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oops! Algo salió mal
        </h1>
        <p className="text-gray-600 mb-6">
          {error?.message || 'Ha ocurrido un error inesperado'}
        </p>
        <Button onClick={() => navigate('/')} className="gap-2">
          <Home className="w-4 h-4" />
          Volver al inicio
        </Button>
      </Card>
    </div>
  );
}
