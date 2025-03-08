
import React, { useEffect, useState } from 'react';
import AuthForm from '@/components/AuthForm';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth: React.FC = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    if (session && !isRedirecting) {
      setIsRedirecting(true);
      navigate('/jobs');
    }
  }, [session, navigate, isRedirecting]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Yüklənir...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col justify-center p-4 bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">İş Tap</h1>
        <p className="text-gray-600">İş və işçi axtarışınızı asanlaşdırın</p>
      </div>
      
      <AuthForm />
      <Toaster />
    </div>
  );
};

export default Auth;
