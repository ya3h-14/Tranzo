import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Settings, Database, Users, Shield,
  LogOut, User, Mail, ShieldCheck,
  Key, FileDown, AlertTriangle, Loader2,
  Percent, Save, RefreshCcw, Info
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/axios";
import { cn } from "@/utils/cn";

export function AdminSettingsPage() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const [feePercentage, setFeePercentage] = useState<string>("5.00");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get("/api/admin/settings/");
        setFeePercentage(response.data.platform_fee_percentage);
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdateFee = async () => {
    setIsSaving(true);
    try {
      await api.patch("/api/admin/settings/", {
        platform_fee_percentage: feePercentage
      });
      // Add success feedback if needed
    } catch (error) {
      console.error("Failed to update fee:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 px-4 py-6 animate-in fade-in duration-500">
      {/* Refined Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] px-8 py-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#F59E0B 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-amber-500/10 to-transparent" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
              <Settings size={12} />
              System Control
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase">
                Console <span className="text-amber-500">& Settings</span>
              </h1>
              <p className="text-slate-400 text-xs font-medium">Manage platform revenue models and administrative security.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Profile & Revenue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Revenue Model Card */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white border border-slate-200/60 ring-1 ring-slate-200/40">
             <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-amber-500 rounded-xl text-[#0F172A] shadow-sm">
                      <Percent size={18} strokeWidth={3} />
                   </div>
                   <div className="space-y-0.5">
                      <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Revenue Protocol</h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Platform Commission Model</p>
                   </div>
                </div>
             </div>

             <CardContent className="p-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="animate-spin text-amber-500" size={24} />
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-10">
                       <div className="space-y-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Fee (%)</label>
                             <div className="relative group">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={feePercentage}
                                  onChange={(e) => setFeePercentage(e.target.value)}
                                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xl font-black text-[#0F172A] focus:outline-none focus:border-amber-500 transition-all group-hover:bg-white"
                                />
                                <Percent size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-amber-500 transition-colors" />
                             </div>
                             <p className="text-[10px] text-slate-400 font-medium px-1">
                                Applied globally to all order transactions. (e.g., 5.0% on ₹1,000 = ₹50 platform revenue)
                             </p>
                          </div>

                          <button
                            onClick={handleUpdateFee}
                            disabled={isSaving}
                            className="w-full h-12 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
                          >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Update Revenue Protocol
                          </button>
                       </div>

                       <div className="bg-amber-50/50 rounded-[2rem] p-6 border border-amber-100/50 flex flex-col justify-center">
                          <div className="space-y-4">
                             <div className="flex items-center gap-2 text-amber-600">
                                <Info size={16} strokeWidth={3} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Revenue Summary</span>
                             </div>
                             <div className="space-y-3">
                                <div className="flex justify-between items-center pb-2 border-b border-amber-200/30">
                                   <span className="text-[11px] font-bold text-slate-500">Gross Booking</span>
                                   <span className="text-sm font-black text-[#0F172A]">₹1,000.00</span>
                                </div>
                                <div className="flex justify-between items-center pb-2 border-b border-amber-200/30">
                                   <span className="text-[11px] font-bold text-slate-500">Platform ({feePercentage}%)</span>
                                   <span className="text-sm font-black text-amber-600">₹{(1000 * (parseFloat(feePercentage) || 0) / 100).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                   <span className="text-[11px] font-bold text-slate-500">Driver Payout</span>
                                   <span className="text-sm font-black text-emerald-600">₹{(1000 - (1000 * (parseFloat(feePercentage) || 0) / 100)).toFixed(2)}</span>
                                </div>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
             </CardContent>
          </Card>

          {/* Profile Section */}
          <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white border border-slate-200/60 ring-1 ring-slate-200/40">
             <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-[#0F172A] rounded-xl text-amber-500 shadow-sm">
                      <User size={18} />
                   </div>
                   <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Administrative Profile</h2>
                </div>
             </div>

             <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-10 items-start md:items-center">
                   <div className="relative group">
                      <div className="w-20 h-20 rounded-[2rem] bg-[#0F172A] flex items-center justify-center text-amber-500 font-black text-2xl shadow-xl border-4 border-slate-100 transition-transform group-hover:rotate-3">
                         {user?.name?.[0]?.toUpperCase() || "A"}
                      </div>
                      <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 border-2 border-white rounded-lg shadow-sm">
                         <ShieldCheck size={12} className="text-white" />
                      </div>
                   </div>

                   <div className="flex-1 space-y-4 w-full">
                      <div className="grid md:grid-cols-2 gap-4">
                         <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="flex items-center gap-3 h-10 px-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs font-bold text-[#0F172A]">
                               {user?.name || "Administrator"}
                            </div>
                         </div>
                         <div className="space-y-1">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="flex items-center gap-3 h-10 px-4 bg-slate-50 rounded-xl border border-slate-200/60 text-xs font-bold text-[#0F172A]">
                               {user?.email || "admin@tranzo.com"}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Column: Security & Session */}
        <div className="space-y-6">
           {/* Security Card */}
           <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white border border-slate-200/60 ring-1 ring-slate-200/40">
              <div className="p-6 border-b border-slate-50 bg-slate-50/50">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 rounded-xl text-amber-600">
                       <Shield size={18} />
                    </div>
                    <h2 className="text-sm font-black text-[#0F172A] uppercase tracking-wider">Security Access</h2>
                 </div>
              </div>
              <CardContent className="p-6 space-y-3">
                 <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all group">
                    <div className="flex items-center gap-3">
                       <Key size={16} className="text-slate-400 group-hover:text-amber-500" />
                       <span className="text-xs font-black uppercase tracking-widest">Update Password</span>
                    </div>
                    <RefreshCcw size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                 </button>

                 <button className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all group">
                    <div className="flex items-center gap-3">
                       <FileDown size={16} className="text-slate-400 group-hover:text-amber-500" />
                       <span className="text-xs font-black uppercase tracking-widest">System Logs</span>
                    </div>
                    <FileDown size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                 </button>
              </CardContent>
           </Card>

           {/* Danger Zone */}
           <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white border border-slate-200/60 ring-1 ring-slate-200/40">
              <div className="p-6 border-b border-red-50 bg-red-50/30">
                 <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-100 rounded-xl text-red-600">
                       <AlertTriangle size={18} />
                    </div>
                    <h2 className="text-sm font-black text-red-600 uppercase tracking-wider">Session Management</h2>
                 </div>
              </div>
              <CardContent className="p-6">
                 <button
                   onClick={handleSignOut}
                   className="w-full flex items-center justify-center gap-3 h-14 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-red-200 active:scale-95"
                 >
                    <LogOut size={18} />
                    Terminate Session
                 </button>
              </CardContent>
           </Card>
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-center pt-10 pb-6">
         <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
            Tranzo Heavy Mobility Solutions • Admin Control Panel v2.4
         </p>
      </div>
    </div>
  );
}
