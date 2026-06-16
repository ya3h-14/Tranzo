import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Dropdown } from "@/components/ui/Dropdown";
import {
  CheckCircle, XCircle, Ban, Loader2, FileText,
  Search, MoreVertical, UserCheck, ShieldCheck,
  X, Truck, Info, User,
  Mail, RotateCcw,
  LayoutGrid, Settings2, Filter,
  ChevronDown, ExternalLink, Eye
} from "lucide-react";
import { api } from "@/api/axios";
import { cn } from "@/utils/cn";

interface Driver {
  id: number;
  user_details: {
    name: string;
    email: string;
  };
  vehicle_type: string;
  vehicle_category_details?: {
    name: string;
    code: string;
  };
  license_plate: string;
  status: string;
  status_reason: string;
  is_reapplied: boolean;
  updated_at: string;
  rating: string;
  is_online: boolean;
  license_document: string | null;
  insurance_document: string | null;
}

export function DriversManagement() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "pending" | "reapplied" | "suspended">("all");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<number | null>(null);
  const [pendingStatus, setPendingStatus] = useState<string>("");
  const [feedback, setFeedback] = useState("");

  // Document Preview State
  const [previewDoc, setPreviewDoc] = useState<{ url: string; label: string } | null>(null);

  const fetchDrivers = async () => {
    setIsLoading(true);
    try {
      let endpoint = "/api/admin/drivers/?";
      if (activeTab === "pending") endpoint += "status=pending_verification&";
      if (activeTab === "reapplied") endpoint += "is_reapplied=true&";
      if (activeTab === "suspended") endpoint += "status=suspended&";
      if (vehicleFilter) endpoint += `vehicle_type=${vehicleFilter}&`;

      const response = await api.get(endpoint);
      setDrivers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch drivers:", error);
      setDrivers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, [activeTab, vehicleFilter]);

  const filteredDrivers = (drivers || []).filter((d) => {
    const name = d.user_details?.name || "";
    const email = d.user_details?.email || "";
    const id = d.id?.toString() || "";

    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           email.toLowerCase().includes(searchQuery.toLowerCase()) ||
           id.includes(searchQuery);
  });

  const openFeedbackModal = (id: number, status: string) => {
    setSelectedDriverId(id);
    setPendingStatus(status);
    setFeedback("");
    setShowFeedbackModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedDriverId) return;

    try {
      await api.patch(`/api/admin/drivers/${selectedDriverId}/approve/`, {
        status: pendingStatus,
        status_reason: feedback
      });
      setShowFeedbackModal(false);
      fetchDrivers();
    } catch (error) {
      console.error("Failed to update driver status:", error);
    }
  };

  const getFullUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `http://127.0.0.1:8000${path}`;
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 px-4 py-6 animate-in fade-in duration-500">
      {/* Refined Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] px-8 py-10 text-white shadow-xl">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#F59E0B 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-amber-500/10 to-transparent" />

        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
              <Truck size={12} />
              Fleet Management
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight uppercase">
                Drivers <span className="text-amber-500">Console</span>
              </h1>
              <p className="text-slate-400 text-sm font-medium">Manage and verify your industrial mobility fleet.</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative group">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber-500 transition-all" />
              <input
                type="text"
                placeholder="Search drivers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 h-11 pl-10 pr-4 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="relative">
              <select
                className="w-full sm:w-auto h-11 pl-4 pr-10 bg-white/5 border border-white/10 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-amber-500/50 appearance-none cursor-pointer hover:bg-white/10 transition-all"
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
              >
                <option value="">All Vehicles</option>
                <option value="2_wheeler">2-Wheeler</option>
                <option value="3_wheeler">3-Wheeler</option>
                <option value="tata_ace">Tata Ace</option>
                <option value="pickup">Pickup / Bolero</option>
                <option value="truck_7ft">7ft Truck</option>
                <option value="truck_14ft">14ft Truck</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs Section */}
      <div className="flex flex-wrap items-center gap-2 px-1 py-1 bg-slate-100 rounded-xl w-fit border border-slate-200/60">
        {[
          { id: "all", label: "Registry", icon: <LayoutGrid size={14} /> },
          { id: "pending", label: "Verification", icon: <ShieldCheck size={14} /> },
          { id: "reapplied", label: "Re-applied", icon: <RotateCcw size={14} /> },
          { id: "suspended", label: "Suspended", icon: <Ban size={14} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all duration-200",
              activeTab === tab.id
                ? "bg-[#0F172A] text-white shadow-lg"
                : "text-slate-500 hover:text-[#0F172A] hover:bg-white/60"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Data Table */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden bg-white border border-slate-200/60">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center py-32 space-y-4">
               <Loader2 className="animate-spin text-amber-500" size={40} />
               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Fleet...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver Detail</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Info</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Operational Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDrivers.length > 0 ? (
                    filteredDrivers.map((driver) => (
                      <tr key={driver.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                             <div className="relative">
                                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-amber-500 font-black text-sm border border-slate-800 shadow-sm">
                                   {getInitials(driver.user_details?.name || "N A")}
                                </div>
                                {driver.is_online && (
                                   <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                                )}
                             </div>
                             <div className="min-w-0">
                                <p className="font-bold text-slate-900 truncate text-sm">{driver.user_details?.name || "N/A"}</p>
                                <p className="text-[11px] text-slate-500 truncate">{driver.user_details?.email}</p>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                             <div className="flex items-center gap-1.5 text-slate-700">
                                <Truck size={12} className="text-amber-500" />
                                <span className="text-[13px] font-bold capitalize">
                                  {driver.vehicle_category_details?.name || driver.vehicle_type?.replace("_", " ") || "—"}
                                </span>
                             </div>
                             <div className="text-[10px] font-mono text-slate-400 bg-slate-100 w-fit px-1.5 py-0.5 rounded border border-slate-200">
                                {driver.license_plate || "NO PLATE"}
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <TextDocLink
                              label="License"
                              exists={!!driver.license_document}
                              onClick={() => setPreviewDoc({ url: getFullUrl(driver.license_document)!, label: "Driver License" })}
                            />
                            <TextDocLink
                              label="Insurance"
                              exists={!!driver.insurance_document}
                              onClick={() => setPreviewDoc({ url: getFullUrl(driver.insurance_document)!, label: "Insurance Policy" })}
                            />
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                            <Badge
                              variant={
                                driver.status === "verified" ? "success" :
                                (driver.status === "pending_verification" || driver.status === "pending_docs") ? "warning" : "danger"
                              }
                              className="w-fit px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider"
                            >
                              {(driver.status || "pending").replace("_", " ")}
                            </Badge>
                            {driver.is_reapplied && (
                              <span className="text-[8px] font-black text-amber-600 flex items-center gap-1 uppercase tracking-tighter">
                                <RotateCcw size={10} /> Re-applied
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <Dropdown
                             trigger={
                               <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                                 <MoreVertical size={18} />
                               </button>
                             }
                             items={[
                               ...(driver.status !== 'verified' ? [
                                 {
                                   label: "Verify & Approve",
                                   icon: <UserCheck size={14} />,
                                   onClick: () => openFeedbackModal(driver.id, "verified")
                                 }
                               ] : []),
                               ...(driver.status !== 'rejected' ? [
                                 {
                                   label: "Reject",
                                   icon: <XCircle size={14} />,
                                   onClick: () => openFeedbackModal(driver.id, "rejected"),
                                   danger: true
                                 }
                               ] : []),
                               {
                                 label: driver.status === 'suspended' ? "Unsuspend" : "Suspend",
                                 icon: driver.status === 'suspended' ? <CheckCircle size={14} /> : <Ban size={14} />,
                                 onClick: () => openFeedbackModal(driver.id, driver.status === 'suspended' ? 'verified' : 'suspended'),
                                 danger: driver.status !== 'suspended'
                               },
                             ]}
                           />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center space-y-3 opacity-40">
                           <Search size={40} className="text-slate-300" />
                           <p className="text-sm font-bold text-slate-500">No records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[85vh] flex flex-col overflow-hidden animate-in zoom-in duration-300">
              <div className="px-6 py-4 bg-[#0F172A] text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-amber-500 rounded-xl text-[#0F172A]">
                      <Eye size={18} strokeWidth={3} />
                   </div>
                   <h3 className="text-sm font-black uppercase tracking-widest">{previewDoc.label} Verification</h3>
                </div>
                <div className="flex items-center gap-4">
                  <a href={previewDoc.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-300 hover:text-white">
                    <ExternalLink size={20} />
                  </a>
                  <button onClick={() => setPreviewDoc(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                    <X size={24} />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-slate-100 p-4 overflow-auto">
                 {previewDoc.url.toLowerCase().endsWith('.pdf') ? (
                    <iframe src={previewDoc.url} className="w-full h-full rounded-xl border-0" title="PDF Preview" />
                 ) : (
                    <img src={previewDoc.url} alt="Document Preview" className="max-w-full h-auto mx-auto rounded-xl shadow-lg" />
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Industrial Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-300 border border-slate-100">
            <div className="px-6 py-5 bg-[#0F172A] text-white flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Protocol Action</p>
                <h3 className="text-lg font-bold capitalize">
                  {pendingStatus === 'verified' ? 'Approve Driver' : `${pendingStatus.replace('_', ' ')} Driver`}
                </h3>
              </div>
              <button onClick={() => setShowFeedbackModal(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-[11px] leading-relaxed font-bold text-amber-700">
                  {pendingStatus === 'verified'
                    ? "Manual verification confirmed. Proceeding with system-wide access activation."
                    : "Action will be logged and notification sent to the fleet personnel via their mobile terminal."}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Rationale</label>
                <textarea
                  className="w-full rounded-xl border border-slate-200 p-4 text-sm font-medium focus:outline-none focus:border-amber-500 bg-slate-50 h-32 resize-none transition-all placeholder:text-slate-300"
                  placeholder="Reason for status change..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  className="flex-1 h-11 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                  onClick={() => setShowFeedbackModal(false)}
                >
                  Cancel
                </button>
                <button
                  className={cn(
                    "flex-1 h-11 rounded-xl text-xs font-black text-white uppercase tracking-widest transition-all shadow-lg",
                    pendingStatus === 'verified' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-red-600 hover:bg-red-700 shadow-red-100'
                  )}
                  onClick={handleStatusUpdate}
                >
                  Execute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TextDocLink({ label, exists, onClick }: { label: string, exists: boolean, onClick: () => void }) {
  if (!exists) {
    return (
      <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest flex items-center gap-1.5 opacity-50">
        <X size={10} strokeWidth={3} /> {label} Missing
      </span>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-fit text-[9px] font-black text-[#0F172A] hover:text-amber-600 uppercase tracking-widest flex items-center gap-1.5 transition-colors group"
    >
      <Eye size={10} strokeWidth={3} className="text-amber-500 group-hover:scale-125 transition-transform" />
      <span className="border-b border-transparent group-hover:border-amber-600 pb-px">{label}</span>
    </button>
  );
}
