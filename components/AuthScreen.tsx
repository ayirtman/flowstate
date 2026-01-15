import React, { useState } from 'react';
import { ArrowRight, Sparkles, User, Lock } from 'lucide-react';
import { authService } from '../services/storage';
import { UserData } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (username: string, data: UserData) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Simulate network delay for better UX feel
    setTimeout(() => {
      if (isLogin) {
        const result = authService.login(username, password);
        if (result.success && result.data) {
          onLoginSuccess(username, result.data);
        } else {
          setError(result.message || 'Login failed');
        }
      } else {
        const result = authService.signup(username, password);
        if (result.success && result.data) {
          onLoginSuccess(username, result.data);
        } else {
          setError(result.message || 'Signup failed');
        }
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pastel-purple via-pastel-blue to-pastel-orange overflow-hidden relative">
       {/* Background Decor */}
       <div className="fixed top-[10%] left-[5%] text-9xl opacity-10 animate-float select-none">🌸</div>
       <div className="fixed bottom-[15%] right-[10%] text-8xl opacity-10 animate-float select-none" style={{ animationDelay: '2s' }}>✨</div>

      <div className="bg-white/80 backdrop-blur-xl rounded-[40px] shadow-2xl w-full max-w-md p-8 md:p-12 relative z-10 animate-slide-up border border-white/50">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-primary/30 mb-6 transform rotate-3">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2">FlowState</h1>
          <p className="text-gray-500">Your mindful productivity companion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary focus:bg-white transition-all text-gray-700 font-medium placeholder:text-gray-400"
              />
            </div>
            
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-gray-50/50 border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary focus:bg-white transition-all text-gray-700 font-medium placeholder:text-gray-400"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-50 text-red-500 text-sm text-center font-medium animate-pulse">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl disabled:opacity-70 disabled:hover:scale-100"
          >
            {loading ? (
              <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Account'}
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => { setError(null); setIsLogin(!isLogin); }}
            className="text-gray-500 hover:text-primary font-medium transition-colors text-sm"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
