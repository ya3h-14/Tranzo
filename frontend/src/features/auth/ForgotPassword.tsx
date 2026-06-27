import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, ShieldCheck, ArrowLeft, CheckCircle } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { api } from "@/api/axios";

export function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // Pre-fill email if passed from login page
  const initialEmail = location.state?.email || "";
  const returnTo = location.state?.returnTo || "/auth/customer/login";

  const [step, setStep] = useState<"email" | "reset" | "success">("email");
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      await api.post("/api/auth/forgot-password/", { email });
      setMessage("A verification code has been sent to your email.");
      setStep("reset");
    } catch (err: any) {
      const errorData = err.response?.data;
      setError(errorData?.error || "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/api/auth/reset-password/", {
        email,
        otp,
        new_password: newPassword,
      });
      setStep("success");
    } catch (err: any) {
      const errorData = err.response?.data;
      setError(errorData?.error || "Reset failed. Please check the code and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setMessage("");
    setResending(true);

    try {
      await api.post("/api/auth/forgot-password/", { email });
      setMessage("A new verification code has been sent to your email.");
    } catch (err: any) {
      setError("Failed to resend code. Please try again.");
    } finally {
      setResending(false);
    }
  };

  // Step 3: Success
  if (step === "success") {
    return (
      <AuthLayout title="Password Reset" subtitle="Your password has been updated">
        <Card className="shadow-2xl border-0 ring-1 ring-slate-200">
          <CardContent className="py-8 px-4 sm:px-10">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-emerald-50 rounded-2xl text-emerald-600 ring-4 ring-emerald-100/50">
                <CheckCircle size={40} />
              </div>
            </div>

            <div className="text-center space-y-3 mb-8">
              <h3 className="text-lg font-bold text-slate-900">
                Password Updated Successfully!
              </h3>
              <p className="text-sm text-slate-500">
                Your password has been reset. You can now sign in with your new password.
              </p>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={() => navigate(returnTo, { replace: true })}
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  // Step 1: Enter email
  if (step === "email") {
    return (
      <AuthLayout title="Forgot Password" subtitle="Enter your email to receive a reset code">
        <Card className="shadow-2xl border-0 ring-1 ring-slate-200">
          <CardContent className="py-8 px-4 sm:px-10">
            <div className="flex justify-center mb-8">
              <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 ring-4 ring-amber-100/50">
                <Mail size={40} />
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleRequestOtp}>
              <Input
                label="Email Address"
                type="email"
                icon={<Mail size={18} />}
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />

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
                Send Reset Code
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to={returnTo}
                className="inline-flex items-center text-slate-400 font-bold uppercase tracking-wider text-[10px] hover:text-slate-900 transition-colors"
              >
                <ArrowLeft size={14} className="mr-1" /> Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </AuthLayout>
    );
  }

  // Step 2: Enter OTP + new password
  return (
    <AuthLayout title="Reset Password" subtitle={`Enter the code sent to ${email}`}>
      <Card className="shadow-2xl border-0 ring-1 ring-slate-200">
        <CardContent className="py-8 px-4 sm:px-10">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-amber-50 rounded-2xl text-amber-600 ring-4 ring-amber-100/50">
              <ShieldCheck size={40} />
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleResetPassword}>
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

            <Input
              label="New Password"
              type="password"
              icon={<Lock size={18} />}
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={<Lock size={18} />}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

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
              Reset Password
            </Button>
          </form>

          <div className="mt-8 flex flex-col items-center space-y-6">
            <button
              onClick={handleResendOtp}
              disabled={resending}
              className="text-xs font-black uppercase tracking-widest text-slate-500 hover:text-amber-600 disabled:opacity-50 transition-colors"
            >
              {resending ? "Sending New Code..." : "Resend Verification Code"}
            </button>

            <button
              onClick={() => { setStep("email"); setError(""); setMessage(""); }}
              className="flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft size={14} className="mr-1" /> Use Different Email
            </button>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
