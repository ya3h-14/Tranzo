import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { useAuthStore } from "@/store/authStore";
import { Lock, Mail, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { api } from "@/api/axios";

export function DriverLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("driver");

  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  const from = location.state?.from?.pathname || `/${activeTab}`;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/login/", { email, password });
      const { user, tokens } = response.data;
      
      if (user.role !== activeTab) {
        setError(`Invalid credentials for ${activeTab} portal.`);
        setIsLoading(false);
        return;
      }

      login(user, user.role, tokens);
      navigate(from, { replace: true });
    } catch (err: any) {
      const errorData = err.response?.data;

      if (errorData?.code === "NOT_VERIFIED") {
        navigate("/auth/verify-otp", {
          state: { email: errorData.email, role: activeTab }
        });
        return;
      }

      setError(errorData?.error || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const loginTabs = [
    { id: 'driver', label: 'Driver Partner' },
    { id: 'admin', label: 'Admin Portal' }
  ];

  return (
    <AuthLayout
      title={activeTab === 'driver' ? "Partner Sign In" : "Admin Portal"}
      subtitle={activeTab === 'driver' ? "Manage your deliveries and earnings" : "System management and controls"}
    >
      <div className="mb-6">
        <Tabs
          tabs={loginTabs}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id)}
        />
      </div>

      <Card className="shadow-2xl border-0 ring-1 ring-slate-200">
        <CardContent className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <Input
              label="Email Address"
              type="email"
              icon={<Mail size={18} />}
              placeholder={`Enter your ${activeTab} email`}
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

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Sign in as {activeTab === 'driver' ? 'Driver' : 'Admin'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link
              to="/auth/forgot-password"
              state={{ returnTo: "/auth/partner/login" }}
              className="text-sm font-semibold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Forgot your password?
            </Link>
          </div>

          <div className="mt-6 text-center text-sm space-y-4">
            {activeTab === 'driver' && (
              <div className="text-slate-500 font-medium">
                Want to drive with us?
                <Link to="/auth/driver/register" className="ml-1 font-bold text-slate-900 hover:text-amber-600 transition-colors underline decoration-amber-500 decoration-2 underline-offset-4">
                  Apply now
                </Link>
              </div>
            )}
            <div className="pt-2">
              <Link to="/" className="inline-flex items-center text-slate-400 font-bold uppercase tracking-wider text-[10px] hover:text-slate-900 transition-colors">
                <ArrowLeft size={14} className="mr-1" /> Back to Home
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
