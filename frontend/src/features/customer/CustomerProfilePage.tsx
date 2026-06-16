import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  User as UserIcon, MapPin, Shield, Phone, Mail, Save, X,
  Hash, ShieldCheck, LogOut, Key, Calendar,
  Loader2, ExternalLink
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/axios";
import { cn } from "@/utils/cn";
import { Badge } from "@/components/ui/Badge";

export function CustomerProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordStep, setPasswordStep] = useState<'request' | 'verify'>('request');
  const [newPassword, setNewPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone_number: user?.phone_number || "",
    address: user?.address || "",
    city: user?.city || "",
    pincode: user?.pincode || "",
  });

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await api.patch("/api/auth/me/", formData);
      updateUser(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestPasswordChange = async () => {
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }
    setIsPasswordLoading(true);
    setPasswordError("");
    try {
      await api.post("/api/auth/request-password-change/", { new_password: newPassword });
      setPasswordStep('verify');
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleVerifyPasswordOtp = async () => {
    if (!otp) {
      setPasswordError("OTP is required");
      return;
    }
    setIsPasswordLoading(true);
    setPasswordError("");
    try {
      await api.post("/api/auth/verify-otp/", {
        email: user?.email,
        otp,
        purpose: "password_change"
      });
      setShowPasswordModal(false);
      setPasswordStep('request');
      setNewPassword("");
      setOtp("");
      alert("Password updated successfully!");
    } catch (err: any) {
      setPasswordError(err.response?.data?.error || "Invalid OTP");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 pb-20 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
            <UserIcon size={8} className="text-amber-500" />
            <span>Profile Settings</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">My Profile</h1>
        </div>

        <div className="flex items-center space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2 bg-amber-500 text-slate-950 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/10 flex items-center"
            >
              Edit Profile
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center"
              >
                <X size={12} className="mr-1.5" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-5 py-2 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20 flex items-center disabled:opacity-50"
              >
                {isLoading ? <Loader2 size={12} className="animate-spin mr-1.5" /> : <Save size={12} className="mr-1.5" />}
                Save Changes
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <Card className="border border-slate-100 shadow-xl shadow-slate-200/40 bg-white overflow-hidden rounded-2xl">
        <div className="bg-slate-900 px-6 py-2.5 flex items-center justify-between">
           <div className="flex items-center space-x-2">
              <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em]">Profile Information</span>
           </div>
           <Badge variant="brand" className="bg-white/5 text-amber-500 border-none px-2 py-0.5 text-[7px] font-black">LOGGED IN</Badge>
        </div>
        <CardContent className="p-8 flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
          <div className="relative group">
             <div className="w-24 h-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-900 text-3xl font-black border-4 border-white shadow-2xl relative z-10 uppercase">
               {getInitials(user.name)}
             </div>
             <div className="absolute inset-0 bg-amber-500 rounded-[2rem] blur-xl opacity-10"></div>
          </div>
          <div className="flex-1 text-center md:text-left space-y-4">
             <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight leading-none">{user.name}</h2>
                <div className="flex items-center justify-center md:justify-start space-x-3 mt-2">
                   <div className="flex items-center space-x-1 text-slate-400">
                      <Calendar size={10} />
                      <span className="text-[9px] font-black uppercase tracking-widest">Member Since: {user.created_at ? new Date(user.created_at).getFullYear() : "2024"}</span>
                   </div>
                   <div className="w-1 h-1 rounded-full bg-slate-200"></div>
                   <span className="text-[9px] font-black text-amber-600 uppercase tracking-widest">{user.role || "Customer"}</span>
                </div>
             </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card className="border border-slate-100 shadow-lg shadow-slate-200/30 rounded-2xl overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
                 <UserIcon size={14} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Personal Information</h3>
           </div>
           <CardContent className="p-6 space-y-5">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                   <input
                     className="w-full rounded-xl border border-slate-200 py-2.5 px-4 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all font-bold text-[11px] text-slate-900 bg-white"
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                   />
                </div>
                <div className="space-y-1.5">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                   <input
                     className="w-full rounded-xl border border-slate-200 py-2.5 px-4 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all font-bold text-[11px] text-slate-900 bg-white"
                     value={formData.phone_number}
                     onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                   />
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-white">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                    <p className="text-[11px] font-black text-slate-900">{user.email}</p>
                  </div>
                  <Mail size={14} className="text-slate-300" />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-white">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                    <p className="text-[11px] font-black text-slate-900">{user.phone_number || "Not provided"}</p>
                  </div>
                  <Phone size={14} className="text-slate-300" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card className="border border-slate-100 shadow-lg shadow-slate-200/30 rounded-2xl overflow-hidden">
           <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
                 <MapPin size={14} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Location Details</h3>
           </div>
           <CardContent className="p-6 space-y-5">
            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                   <input
                     className="w-full rounded-xl border border-slate-200 py-2.5 px-4 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all font-bold text-[11px] text-slate-900 bg-white"
                     value={formData.address}
                     onChange={(e) => setFormData({...formData, address: e.target.value})}
                   />
                </div>
                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">City</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 py-2.5 px-4 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all font-bold text-[11px] text-slate-900 bg-white"
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Pincode</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 py-2.5 px-4 focus:ring-4 focus:ring-amber-500/5 focus:border-amber-500 transition-all font-bold text-[11px] text-slate-900 bg-white"
                        value={formData.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      />
                   </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-3 bg-slate-50 rounded-xl border border-white min-h-[50px] flex items-center justify-between">
                   <div className="space-y-1 min-w-0">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Address</p>
                     <p className="text-[11px] font-black text-slate-900 truncate">{user.address || "No address saved"}</p>
                   </div>
                   <MapPin size={14} className="text-slate-300 ml-3 shrink-0" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-white">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">City</p>
                    <p className="text-[11px] font-black text-slate-900">{user.city || "—"}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-white">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pincode</p>
                    <p className="text-[11px] font-black text-slate-900">{user.pincode || "—"}</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Account Settings */}
        <Card className="border border-slate-100 shadow-xl shadow-slate-200/40 rounded-2xl overflow-hidden md:col-span-2">
          <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/30 flex items-center justify-between">
             <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-slate-400">
                   <Shield size={14} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-900">Account Security</h3>
             </div>
          </div>
          <CardContent className="p-6 flex flex-col sm:flex-row gap-4">
            <button
               onClick={() => setShowPasswordModal(true)}
               className="flex-1 flex items-center justify-center space-x-2 h-12 rounded-xl border border-slate-200 text-slate-600 font-black text-[10px] uppercase tracking-[0.15em] hover:bg-slate-50 hover:text-slate-900 transition-all"
            >
               <Key size={14} className="text-amber-500" />
               <span>Change Password</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex-1 flex items-center justify-center space-x-2 h-12 rounded-xl bg-red-500 text-white font-black text-[10px] uppercase tracking-[0.15em] hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
            >
               <LogOut size={14} />
               <span>Sign Out</span>
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl border-none overflow-hidden">
            <div className="bg-slate-900 p-8 text-white relative">
               <div className="flex items-center justify-between mb-2">
                  <p className="text-amber-500 text-[9px] font-black uppercase tracking-[0.3em]">Security Protocol</p>
                  <button onClick={() => setShowPasswordModal(false)} className="text-slate-400 hover:text-white transition-colors">
                     <X size={20} />
                  </button>
               </div>
               <h3 className="text-2xl font-black uppercase tracking-tight">Change Password</h3>
            </div>
            <CardContent className="p-8 space-y-6">
              {passwordStep === 'request' ? (
                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enter your new terminal access key</p>
                  <Input
                    type="password"
                    label="NEW PASSWORD"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="h-12 bg-slate-50 border-none font-bold"
                  />
                  {passwordError && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">{passwordError}</p>}
                  <Button
                    onClick={handleRequestPasswordChange}
                    isLoading={isPasswordLoading}
                    className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]"
                  >
                    Send Verification OTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                   <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck size={32} className="text-amber-500" />
                   </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    A 6-digit verification code has been sent to <br/>
                    <span className="text-slate-900 font-black">{user.email}</span>
                  </p>
                  <Input
                    type="text"
                    label="ENTER OTP"
                    value={otp}
                    maxLength={6}
                    onChange={(e) => setOtp(e.target.value)}
                    className="h-14 bg-slate-50 border-none text-center text-2xl font-black tracking-[0.5em]"
                  />
                  {passwordError && <p className="text-rose-500 text-[10px] font-black uppercase tracking-widest">{passwordError}</p>}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setPasswordStep('request')}
                      className="h-12 rounded-xl font-black uppercase tracking-[0.2em] text-[9px]"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleVerifyPasswordOtp}
                      isLoading={isPasswordLoading}
                      className="h-12 bg-amber-500 text-slate-950 rounded-xl font-black uppercase tracking-[0.2em] text-[9px]"
                    >
                      Verify & Update
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
