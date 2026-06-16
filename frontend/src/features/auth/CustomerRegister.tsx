import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Lock, Mail, User, Phone } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { api } from "@/api/axios";

export function CustomerRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/api/auth/register/customer/", {
        name,
        email,
        phone_number,
        password,
      });
      
      // Redirect to OTP verification page
      navigate("/auth/verify-otp", {
        state: { email, role: "customer" },
        replace: true
      });
    } catch (err: any) {
      const errorData = err.response?.data;
      let errorMessage = "Registration failed. Please try again.";

      if (typeof errorData === 'object') {
        errorMessage = Object.values(errorData).flat().join(" ") || errorMessage;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an Account" subtitle="Join Tranzo to book deliveries">
      <Card className="shadow-2xl border-0 ring-1 ring-slate-200">
        <CardContent className="py-8 px-4 sm:px-10">
          <form className="space-y-6" onSubmit={handleRegister}>
            <Input
              label="Full Name"
              type="text"
              icon={<User size={18} />}
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              type="email"
              icon={<Mail size={18} />}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              icon={<Phone size={18} />}
              placeholder="Enter your phone number"
              value={phone_number}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              icon={<Lock size={18} />}
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              icon={<Lock size={18} />}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              Register Now
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-slate-500 font-medium">Already have an account? </span>
            <Link to="/auth/customer/login" className="font-bold text-slate-900 hover:text-amber-600 transition-colors underline decoration-amber-500 decoration-2 underline-offset-4">
              Sign in here
            </Link>
          </div>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
