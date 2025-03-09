
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle } from 'lucide-react';

type AuthMode = 'login' | 'register';

const AuthForm: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  const { signIn, signUp, loading } = useAuth();
  const [usernameError, setUsernameError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'username') {
      // Clear previous errors
      setUsernameError(null);
      
      // Only allow alphanumeric characters and underscores
      if (!/^[a-zA-Z0-9_]*$/.test(value)) {
        setUsernameError('İstifadəçi adı yalnız hərf, rəqəm və alt xətt (_) ola bilər');
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (mode === 'register') {
      if (!formData.username.trim()) {
        setUsernameError('İstifadəçi adı mütləq olmalıdır');
        return false;
      }
      
      if (formData.username.length < 5) {
        setUsernameError('İstifadəçi adı ən az 5 simvol olmalıdır');
        return false;
      }
      
      if (usernameError) {
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (mode === 'login') {
      await signIn(formData.email, formData.password);
    } else {
      await signUp(formData.email, formData.password, {
        name: formData.name,
        surname: formData.surname,
        username: formData.username
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto animate-slide-up">
      <CardHeader>
        <CardTitle className="text-center text-2xl">
          {mode === 'login' ? 'Giriş edin' : 'Qeydiyyatdan keçin'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Ad</Label>
                <Input 
                  id="name" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Adınızı daxil edin" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="surname">Soyad</Label>
                <Input 
                  id="surname" 
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  placeholder="Soyadınızı daxil edin" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">İstifadəçi adı</Label>
                <Input 
                  id="username" 
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="İstifadəçi adınızı daxil edin" 
                  required 
                />
                {usernameError && (
                  <div className="text-sm text-red-500 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {usernameError}
                  </div>
                )}
              </div>
            </>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email">E-poçt</Label>
            <Input 
              id="email" 
              name="email"
              type="email" 
              value={formData.email}
              onChange={handleChange}
              placeholder="E-poçt ünvanınızı daxil edin" 
              required 
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Şifrə</Label>
            <Input 
              id="password"
              name="password" 
              type="password"
              value={formData.password}
              onChange={handleChange} 
              placeholder="Şifrənizi daxil edin" 
              required 
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center">
                Gözləyin...
              </span>
            ) : mode === 'login' ? 'Giriş' : 'Qeydiyyat'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <Button 
            variant="link" 
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login' 
              ? 'Hesabınız yoxdur? Qeydiyyatdan keçin' 
              : 'Hesabınız var? Giriş edin'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
