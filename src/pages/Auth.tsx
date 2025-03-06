
import React, { useEffect } from 'react';
import AuthForm from '@/components/AuthForm';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Auth: React.FC = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (session) {
      navigate('/jobs');
    }
  }, [session, navigate]);
  
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
