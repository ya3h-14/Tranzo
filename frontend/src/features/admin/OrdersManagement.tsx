import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  MapPin, Navigation, Package, Truck, IndianRupee, Calendar,
  Loader2, Search, Filter, Globe, Clock, CheckCircle2,
  Activity, ArrowUpRight, ChevronRight, Hash, Box, Target, X, Info
} from "lucide-react";
import { api } from "@/api/axios";
import { cn } from "@/utils/cn";

interface Order {
  id: number;
  pickup_address: string;
  dropoff_address: string;
  package_details: string;
  vehicle_requested: string;
  status: string;
  price: string;
  distance_km: string;
  created_at: string;
}

export function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/api/admin/orders/");
        setOrders(response.data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesTab = activeTab === "all" || order.status === activeTab;
    const matchesSearch =
      order.id.toString().includes(searchQuery.toLowerCase()) ||
      order.pickup_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.dropoff_address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return { label: "Completed", variant: "success" as const, icon: <CheckCircle2 size={10} className="mr-1" />, bg: "bg-emerald-50 text-emerald-600 border-emerald-100" };
      case "pending":
        return { label: "Pending", variant: "warning" as const, icon: <Clock size={10} className="mr-1" />, bg: "bg-amber-50 text-amber-600 border-amber-100" };
      case "cancelled":
        return { label: "Cancelled", variant: "danger" as const, icon: <X size={10} className="mr-1" />, bg: "bg-red-50 text-red-600 border-red-100" };
      default:
        return { label: "Active", variant: "info" as const, icon: <Activity size={10} className="mr-1 animate-pulse" />, bg: "bg-blue-50 text-blue-600 border-blue-100" };
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 pb-20 animate-in fade-in duration-700">

      {/* Tactical Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">
            <Target size={10} className="text-amber-500" />
            <span>Order Administration</span>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <span className="text-emerald-500">{orders.length} TOTAL RECORDS</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Operational Log</h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
           <div className="relative group w-full md:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
              <input
                type="text"
                placeholder="Search Order ID or Terminal..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-12 pr-4 bg-white border-2 border-slate-100 rounded-xl text-[11px] font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all shadow-sm"
              />
           </div>
        </div>
      </div>

      {/* Interactive Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 rounded-2xl w-fit">
        {[
          { id: "all", label: "Registry", icon: <Globe size={10} /> },
          { id: "pending", label: "Pending", icon: <Clock size={10} /> },
          { id: "in_transit", label: "In Transit", icon: <Activity size={10} /> },
          { id: "delivered", label: "Completed", icon: <CheckCircle2 size={10} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2",
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-xl shadow-slate-900/20"
                : "text-slate-500 hover:text-slate-900 hover:bg-white"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Main Order Registry */}
      <Card className="border border-slate-100 shadow-2xl shadow-slate-200/40 bg-white overflow-hidden rounded-[1.5rem]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
               <Loader2 className="animate-spin text-amber-500" size={32} />
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Secure Records...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800">
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Sequence / ID</th>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Logistics Vector</th>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Financial Data</th>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Control</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => {
                      const status = getStatusConfig(order.status);
                      return (
                        <tr key={order.id} className="group hover:bg-slate-50/40 transition-colors">
                          <td className="px-8 py-6">
                            <div className="flex items-center space-x-4">
                               <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 border border-slate-200 shadow-sm">
                                  <Box size={18} />
                               </div>
                               <div className="space-y-1">
                                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">ORD-{order.id}</p>
                                  <div className="flex items-center text-[9px] text-slate-400 font-bold space-x-1.5">
                                     <Calendar size={10} />
                                     <span>{new Date(order.created_at).toLocaleDateString()}</span>
                                  </div>
                               </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-3 relative max-w-[240px]">
                               <div className="flex items-start space-x-2 min-w-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
                                  <p className="text-[10px] font-bold text-slate-600 truncate">{order.pickup_address}</p>
                               </div>
                               <div className="flex items-start space-x-2 min-w-0">
                                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1 shrink-0"></div>
                                  <p className="text-[10px] font-bold text-slate-600 truncate">{order.dropoff_address}</p>
                               </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="space-y-1">
                               <div className="flex items-center space-x-1.5">
                                  <span className="text-[9px] font-black text-amber-500">₹</span>
                                  <span className="text-sm font-black text-slate-900 tabular-nums">{parseFloat(order.price).toFixed(0)}</span>
                               </div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{order.distance_km} KM VECTOR</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className={cn("inline-flex items-center px-2 py-1 rounded-md border text-[8px] font-black uppercase tracking-widest", status.bg)}>
                               {status.icon} {status.label}
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button
                               onClick={() => setSelectedOrder(order)}
                               className="w-9 h-9 bg-white border border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50 rounded-xl transition-all inline-flex items-center justify-center shadow-sm"
                             >
                                <Info size={16} />
                             </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-8 py-24 text-center">
                         <div className="flex flex-col items-center justify-center space-y-4">
                            <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100 text-slate-200">
                               <Box size={32} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching order records</p>
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

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden border-none animate-in zoom-in duration-300">
            <div className="bg-slate-900 px-8 py-6 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-amber-500 border border-white/10">
                  <Box size={24} />
                </div>
                <div className="space-y-0.5">
                   <h3 className="text-lg font-black text-white uppercase tracking-tight">Order Details</h3>
                   <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Protocol ID: ORD-{selectedOrder.id}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-white/10 transition-all">
                <X size={20} />
              </button>
            </div>

            <CardContent className="p-8 space-y-8">
              {/* Status Section */}
              <div className="flex justify-between items-center">
                 <div className={cn("px-3 py-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest", getStatusConfig(selectedOrder.status).bg)}>
                    {getStatusConfig(selectedOrder.status).icon} {getStatusConfig(selectedOrder.status).label}
                 </div>
                 <div className="flex items-center space-x-2 text-[9px] font-black text-slate-400 uppercase">
                    <Calendar size={12} className="text-slate-300" />
                    <span>Logged: {new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                 </div>
              </div>

              {/* Vector Visualization */}
              <div className="bg-slate-50 rounded-2xl p-6 space-y-6 border border-slate-100 relative overflow-hidden">
                <div className="absolute left-[31px] top-[42px] bottom-[42px] w-[1px] bg-slate-200 border-l border-dashed border-slate-300"></div>
                <div className="flex items-start space-x-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-emerald-500 flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Source Hub</p>
                    <p className="text-[11px] font-bold text-slate-700 leading-tight">{selectedOrder.pickup_address}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-indigo-500 flex items-center justify-center shadow-sm">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  </div>
                  <div className="space-y-1 min-w-0">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Discharge Point</p>
                    <p className="text-[11px] font-bold text-slate-700 leading-tight">{selectedOrder.dropoff_address}</p>
                  </div>
                </div>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center"><Package size={10} className="mr-1.5" /> Payload</p>
                    <p className="text-[11px] font-bold text-slate-900 uppercase">{selectedOrder.package_details}</p>
                 </div>
                 <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center"><Truck size={10} className="mr-1.5" /> Fleet Category</p>
                    <p className="text-[11px] font-bold text-slate-900 uppercase">{selectedOrder.vehicle_requested.replace('_', ' ')}</p>
                 </div>
                 <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center"><Navigation size={10} className="mr-1.5" /> Total Vector</p>
                    <p className="text-[11px] font-bold text-slate-900">{selectedOrder.distance_km} KM</p>
                 </div>
                 <div className="p-4 bg-slate-900 rounded-xl border border-white/5">
                    <p className="text-[8px] font-black text-amber-500/50 uppercase tracking-widest mb-2 flex items-center"><IndianRupee size={10} className="mr-1.5" /> Settlement</p>
                    <p className="text-lg font-black text-white leading-none tabular-nums tracking-tighter">₹{parseFloat(selectedOrder.price).toFixed(0)}</p>
                 </div>
              </div>

              <div className="pt-2">
                <button
                  className="w-full h-12 bg-slate-100 text-slate-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close Registry Log
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
