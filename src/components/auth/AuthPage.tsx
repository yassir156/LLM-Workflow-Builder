import { useState } from 'react';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { Zap } from 'lucide-react';

export function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
            <Zap className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold">FlowMind AI</h1>
        </div>
        <p className="text-muted-foreground max-w-md">
          Build powerful automation workflows with AI. Connect LLMs, triggers, and actions to create intelligent automations.
        </p>
      </div>

      {isLogin ? (
        <LoginForm onToggle={() => setIsLogin(false)} />
      ) : (
        <RegisterForm onToggle={() => setIsLogin(true)} />
      )}

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>Free to use • No credit card required</p>
      </div>
    </div>
  );
}
