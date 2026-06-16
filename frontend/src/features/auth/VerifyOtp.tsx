import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { api } from "@/api/axios";

export function VerifyOtp() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((state) => state.login);

  // Get email and role from navigation state
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/auth/customer/login");
    }
  }, [email, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await api.post("/api/auth/verify-otp/", {
        email,
        otp,
      });

      const { user, tokens } = response.data;

      // Successfully verified and logged in
      login(user, user.role, tokens);

      // Redirect based on role
      if (user.role === "admin") {
        navigate("/admin", { replace: true });
      } else if (user.role === "driver") {
        navigate("/driver", { replace: true });
      } else {
        navigate("/customer", { replace: true });
      }
    } catch (err: any) {
      const errorData = err.response?.data;
      setError(errorData?.error || "Verification failed. Please check the code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setResending(true);

    try {
      await api.post("/api/auth/resend-otp/", { email });
      setMessage("A new OTP has been sent to your email.");
    } catch (err: any) {
      setError("Failed to resend OTP. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout title="Security Check" subtitle={`Enter the code sent to ${email}`}>
      <Card className="shadow-2xl border-0 ring-1 ring-slate-200">
        <CardContent className="py-8 px-4 sm:px-10">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 ring-4 ring-amber-100/50">
              <ShieldCheck size={40} />
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleVerify}>
            <div className="text-center">
              <Input
                label="Verification Code"
                type="text"
                placeholder="0 0 0 0 0 0"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                required
                className="text-center text-3xl tracking-[0.4em] font-black h-16 border-slate-900 border-2"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <p className="text-sm font-bold text-red-700">{error}</p>
              </div>
            )}

            {message && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
                <p className="text-sm font-bold text-green-700">{message}</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              Verify & Launch
            </Button>
          </form>

          <div className="mt-8 flex flex-col items-center space-y-6">
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-amber-600 disabled:opacity-50 transition-colors"
            >
              {resending ? "Dispatching New Code..." : "Resend Verification Code"}
            </button>

            <Link to="/auth/customer/login" className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">
              <ArrowLeft size={14} className="mr-1" /> Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
