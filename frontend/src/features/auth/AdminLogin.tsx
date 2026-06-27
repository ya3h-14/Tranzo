import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { api } from "@/api/axios";

export function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const from = location.state?.from?.pathname || "/admin";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/login/", { email, password });
      const { user, tokens } = response.data;
      
      if (user.role !== "admin") {
        setError("Invalid role for this portal.");
        setIsLoading(false);
        return;
      }

      login(user, "admin", tokens);
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.detail || "Invalid email or password.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Admin Portal" subtitle="System management and controls">
      <Card className="shadow-2xl border-0 ring-1 ring-slate-200">
        <CardContent className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <Input
              label="Admin Email"
              type="email"
              icon={<Mail size={18} />}
              placeholder="Enter your admin email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={<Lock size={18} />}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm font-bold text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" variant="brand" className="w-full" size="lg" isLoading={isLoading}>
              Sign in to Dashboard
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/auth/forgot-password"
              state={{ returnTo: "/auth/admin/login" }}
              className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="px-2 bg-white">Internal Access Only</span>
              </div>
            </div>
            <div className="mt-4 flex flex-col space-y-4">
              <div className="text-center">
                <Link to="/" className="inline-flex items-center text-slate-400 font-bold uppercase tracking-wider text-[10px] hover:text-slate-900 transition-colors">
                  <ArrowLeft size={14} className="mr-1" /> Back to Home
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
