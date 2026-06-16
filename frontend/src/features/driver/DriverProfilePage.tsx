import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  User as UserIcon, Truck, Star, FileText,
  Shield, Save, X, Loader2, LogOut, Zap,
  Activity, ShieldCheck, Settings, Briefcase,
  ExternalLink, Key, Award, CheckCircle
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/axios";
import { cn } from "@/utils/cn";

interface VehicleCategory {
  id: number;
  name: string;
}

export function DriverProfilePage() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<VehicleCategory[]>([]);

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
    vehicle_category_id: user?.vehicle_info?.category_id?.toString() || "",
    license_plate: user?.vehicle_info?.license_plate || "",
  });

  useEffect(() => {
    if (isEditing) {
      const fetchCategories = async () => {
        try {
          const response = await api.get("/api/driver/categories/");
          setCategories(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
          console.error("Failed to load vehicle categories:", err);
        }
      };
      fetchCategories();
    }
  }, [isEditing]);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const meResponse = await api.patch("/api/auth/me/", {
        name: formData.name,
        phone_number: formData.phone_number
      });

      const vehicleResponse = await api.patch("/api/driver/onboarding/", {
        vehicle_category_id: formData.vehicle_category_id,
        license_plate: formData.license_plate
      });

      updateUser({
        ...meResponse.data,
        status: vehicleResponse.data.status
      });

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
    <div className="max-w-7xl mx-auto space-y-8 px-4 pb-20 animate-in fade-in duration-700">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Settings size={10} className="text-amber-500" />
            <span>Profile Settings</span>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <span className="text-emerald-500">Verified Account</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Driver Profile</h1>
        </div>

        <div className="flex items-center gap-3">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-slate-900 text-white hover:bg-slate-800 px-6 h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
                className="px-6 h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] border-slate-200"
              >
                <X size={14} className="mr-2" /> Cancel
              </Button>
              <Button
                onClick={handleSave}
                isLoading={isLoading}
                className="bg-amber-500 text-slate-950 hover:bg-amber-400 px-6 h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-amber-500/10"
              >
                <Save size={14} className="mr-2" /> Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Identity Card */}
      <Card className="border-none shadow-2xl shadow-slate-900/10 rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50"></div>
        <CardContent className="p-10 relative z-10 flex flex-col md:flex-row items-center md:items-start md:space-x-10 text-center md:text-left">
          <div className="relative group mb-6 md:mb-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            <div className="w-32 h-32 rounded-full bg-slate-900 flex items-center justify-center text-amber-500 text-4xl font-black shadow-2xl relative border-4 border-white">
              {getInitials(user.name)}
            </div>
            <div className="absolute bottom-1 right-1 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
               <ShieldCheck size={14} className="text-white" />
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none">{user.name}</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Driver ID: DRV-{user.id}</p>
              </div>
              <Badge className={cn(
                "px-6 py-2 font-black uppercase tracking-widest text-[10px] rounded-full",
                user.status === 'verified' ? "bg-emerald-500 text-white" : (user.status === 'rejected' ? "bg-rose-500 text-white" : "bg-amber-500 text-slate-950")
              )}>
                {user.status?.replace("_", " ") || "Pending"}
              </Badge>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 pt-2">
              <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Star size={18} className="text-amber-500 fill-amber-500" />
                <span className="text-sm font-black text-slate-900">{user.vehicle_info?.rating || "5.0"}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Rating</span>
              </div>
              <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Briefcase size={18} className="text-blue-500" />
                <span className="text-sm font-black text-slate-900">{user.vehicle_info?.total_deliveries || 0}</span>
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Deliveries</span>
              </div>
              <div className="flex items-center space-x-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-100">
                <Award size={18} className="text-emerald-500" />
                <span className="text-sm font-black text-slate-900">Rank A+</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Info Column */}
        <div className="lg:col-span-2 space-y-8">
           <div className="grid md:grid-cols-2 gap-8">
              <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white border border-slate-100">
                <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                      <UserIcon size={14} className="text-slate-400" />
                      <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Personal Info</h2>
                   </div>
                </div>
                <CardContent className="p-8 space-y-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <Input
                        label="FULL NAME"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="h-12 bg-slate-50 border-none font-bold uppercase text-xs"
                      />
                      <Input
                        label="PHONE NUMBER"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                        className="h-12 bg-slate-50 border-none font-bold uppercase text-xs"
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="group">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email Address</p>
                        <p className="text-sm font-bold text-slate-900 uppercase">{user.email}</p>
                      </div>
                      <div className="group">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Phone Number</p>
                        <p className="text-sm font-bold text-slate-900 uppercase">{user.phone_number || "Not set"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white border border-slate-100">
                <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                      <Truck size={14} className="text-slate-400" />
                      <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Vehicle Info</h2>
                   </div>
                </div>
                <CardContent className="p-8 space-y-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-widest">VEHICLE CATEGORY</label>
                        <select
                          className="w-full h-12 px-4 rounded-xl border-none bg-slate-50 font-bold uppercase text-xs focus:ring-2 focus:ring-amber-500"
                          value={formData.vehicle_category_id}
                          onChange={(e) => setFormData({...formData, vehicle_category_id: e.target.value})}
                        >
                          <option value="" disabled>Select Category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <Input
                        label="LICENSE PLATE"
                        value={formData.license_plate}
                        onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                        className="h-12 bg-slate-50 border-none font-bold uppercase text-xs"
                      />
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="group">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Vehicle Type</p>
                        <p className="text-sm font-bold text-slate-900 uppercase">{user.vehicle_info?.vehicle_type?.replace("_", " ") || "Not set"}</p>
                      </div>
                      <div className="group">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">License Plate</p>
                        <p className="text-sm font-bold text-slate-900 uppercase">{user.vehicle_info?.license_plate || "Not set"}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
           </div>

           {/* Documents Module */}
           <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white border border-slate-100">
              <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                 <div className="flex items-center space-x-3">
                    <FileText size={14} className="text-slate-400" />
                    <h2 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Documents</h2>
                 </div>
                 <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
              </div>
              <CardContent className="p-8">
                 <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { label: "Driver's License", status: user.status !== 'pending_docs' },
                      { label: "Vehicle Insurance", status: user.status !== 'pending_docs' },
                    ].map((doc, i) => (
                      <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group">
                         <div className="flex items-center space-x-4">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                              doc.status ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white" : "bg-rose-50 text-rose-600 group-hover:bg-rose-500 group-hover:text-white"
                            )}>
                               <ShieldCheck size={18} />
                            </div>
                            <span className="text-[10px] font-black uppercase text-slate-700 tracking-widest">{doc.label}</span>
                         </div>
                         <Badge className={cn(
                           "text-[8px] font-black uppercase tracking-widest px-2 py-1",
                           doc.status ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                         )}>
                           {doc.status ? "UPLOADED" : "MISSING"}
                         </Badge>
                      </div>
                    ))}
                 </div>
              </CardContent>
           </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">

           {/* Security */}
           <Card className="bg-slate-900 text-white rounded-[2rem] p-8 border-none shadow-2xl shadow-slate-900/40 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
              <div className="flex items-center justify-between relative z-10 mb-8">
                 <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-500">Security</p>
                    <h4 className="text-[12px] font-black uppercase tracking-widest">Account Settings</h4>
                 </div>
                 <Key size={20} className="text-slate-700" />
              </div>

              <div className="space-y-4 relative z-10">
                 <button
                    onClick={() => setShowPasswordModal(true)}
                    className="w-full group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all text-left"
                 >
                    <div className="flex items-center space-x-3">
                       <Shield size={16} className="text-blue-400" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Change Password</span>
                    </div>
                    <ExternalLink size={12} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
                 </button>

                 <div className="pt-4">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center justify-center space-x-3 p-4 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-2xl border border-rose-500/20 transition-all font-black text-[11px] uppercase tracking-[0.2em]"
                    >
                       <LogOut size={16} />
                       <span>Sign Out</span>
                    </button>
                 </div>
              </div>
              <div className="absolute -bottom-10 -right-10 opacity-[0.05] pointer-events-none transform rotate-12">
                 <Shield size={180} />
              </div>
           </Card>

           {/* Stats Summary */}
           <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white border border-slate-100">
              <CardContent className="p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Status</h3>
                    <div className="flex items-center space-x-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                       <span className="text-[9px] font-black uppercase text-emerald-500">Active</span>
                    </div>
                 </div>
                 <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-600">
                       <span>Profile Completion</span>
                       <span className="text-slate-900">100%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                       <div className="w-full h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                    </div>
                 </div>
                 <p className="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] pt-4 text-center">
                    Member since {new Date(user.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
                 </p>
              </CardContent>
           </Card>
        </div>
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
                    A 6-digit verification code has been dispatched to <br/>
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
