import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F5F7FA]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="https://customer-assets.emergentagent.com/job_4424ce99-107e-4271-9ac9-bef9add8255c/artifacts/7ou0bag7_download.jpg"
              alt="SightSpectrum"
              className="h-16 w-16 mx-auto mb-4 rounded-lg"
            />
            {/* <h1 className="text-3xl font-bold text-[#0A2A43] font-['Manrope']">Welcome to SightSpectrum</h1> */}
            <p className="text-slate-600 mt-2">Sign in to your Sales CRM account</p>
          </div>

          <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(10,42,67,0.08)] p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  data-testid="login-email-input"
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  data-testid="login-password-input"
                  className="mt-1.5"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                data-testid="login-submit-btn"
                className="w-full bg-[#0A2A43] hover:bg-[#0A2A43]/90 text-white"
              >
                {loading ? 'Signing in...' : 'Sign Inn'}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Demo credentials: <span className="font-mono text-xs">admin@sightspectrum.com / admin123</span>
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Image */}
      <div
        className="hidden lg:block lg:flex-1 bg-cover bg-center relative"
        style={{
          backgroundImage: `url('https://images.pexels.com/photos/35083558/pexels-photo-35083558.jpeg')`,
        }}
      >
        <div className="absolute inset-0 bg-[#0A2A43]/60 flex items-center justify-center">
          <div className="text-white text-center p-8">
            <h2 className="text-4xl font-bold mb-4 font-['Manrope']">Sales CRM</h2>
            <p className="text-lg text-slate-200">Manage your clients, leads, and opportunities efficiently</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;