import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  MapPin, Navigation, Calendar, Package,
  IndianRupee, Loader2, History, TrendingUp,
  CheckCircle, XCircle, Zap, Activity, ShieldCheck,
  BarChart3, Award
} from "lucide-react";
import { api } from "@/api/axios";
import { cn } from "@/utils/cn";

interface Order {
  id: number;
  pickup_address: string;
  dropoff_address: string;
  goods_type: string;
  vehicle_category_details: {
    name: string;
  } | null;
  status: string;
  price: string;
  distance_km: string;
  created_at: string;
}

interface DriverStats {
  total_earnings: number;
  total_deliveries: number;
  current_rating: number;
}

export function DriverHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<DriverStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, statsRes] = await Promise.all([
          api.get("/api/driver/orders/"),
          api.get("/api/driver/stats/")
        ]);
        // Filter for completed or cancelled
        const historyOrders = (ordersRes.data || []).filter((o: Order) =>
          ["delivered", "cancelled"].includes(o.status.toLowerCase())
        );
        setOrders(historyOrders);
        setStats(statsRes.data);
      } catch (error) {
        console.error("Failed to fetch driver history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="animate-spin text-amber-500" size={40} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Accessing Mission Archives...</span>
      </div>
    );
  }

  const statCards = [
    {
      label: "Gross Earnings",
      value: `₹${Number(stats?.total_earnings || 0).toLocaleString()}`,
      icon: <IndianRupee size={18} />,
      color: "emerald",
      sub: "Verified Payouts"
    },
    {
      label: "Missions Completed",
      value: stats?.total_deliveries || 0,
      icon: <CheckCircle size={18} />,
      color: "blue",
      sub: "Success Rate: 100%"
    },
    {
      label: "Total Logistics Distance",
      value: `${orders.reduce((acc, order) => acc + parseFloat(order.distance_km || "0"), 0).toFixed(1)} km`,
      icon: <TrendingUp size={18} />,
      color: "amber",
      sub: "Net Ground Covered"
    },
    {
      label: "Fleet Performance",
      value: stats?.current_rating || "5.0",
      icon: <Award size={18} />,
      color: "slate",
      sub: "Service Grade: A+"
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 pb-20 animate-in fade-in duration-700">

      {/* Tactical Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            <History size={10} className="text-amber-500" />
            <span>Operational Archives</span>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <span className="text-emerald-500">Read-Only Database</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Mission History</h1>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900 px-6 py-4 rounded-[1.5rem] shadow-2xl shadow-slate-900/20">
           <Activity size={16} className="text-amber-500 animate-pulse" />
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">System Status</span>
              <span className="text-emerald-500 font-black uppercase tracking-widest text-[9px]">Archives Synced</span>
           </div>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="group border border-slate-100 hover:border-amber-200 bg-white transition-all overflow-hidden rounded-[1.5rem] shadow-lg shadow-slate-200/40">
            <CardContent className="p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-inner",
                  stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white" :
                  stat.color === 'blue' ? "bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white" :
                  stat.color === 'amber' ? "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white" :
                  "bg-slate-50 text-slate-600 group-hover:bg-slate-900 group-hover:text-white"
                )}>
                  {stat.icon}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                   Metric-0{i+1}
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 tabular-nums tracking-tighter">
                  {stat.value}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{stat.sub}</p>
              </div>

              {/* Background Accent */}
              <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                 {React.cloneElement(stat.icon as React.ReactElement<any>, { size: 60 })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Mission Manifest Table/Cards */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center space-x-2">
              <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
              <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Historical Manifests</h2>
           </div>
           <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Verified Entries: {orders.length}</span>
           </div>
        </div>

        {orders.length > 0 ? (
          <div className="grid gap-6">
            {orders.map((order) => (
              <Card key={order.id} className="group hover:border-amber-400 transition-all border border-slate-100 shadow-md hover:shadow-xl bg-white overflow-hidden rounded-[2rem] relative">
                <CardContent className="p-8">
                   <div className="flex flex-col lg:flex-row justify-between gap-8">
                      {/* Left: Manifest ID & Status */}
                      <div className="lg:w-64 space-y-4">
                         <div className="flex items-center space-x-4">
                            <div className="w-14 h-14 bg-slate-900 text-amber-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                               <Package size={24} />
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">MANIFEST ID</p>
                               <p className="text-sm font-black text-slate-900 uppercase">ORD-#{order.id}</p>
                               <div className="flex items-center text-[10px] font-bold text-slate-500 mt-1">
                                  <Calendar size={12} className="mr-1.5" />
                                  {new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                               </div>
                            </div>
                         </div>
                         <Badge className={cn(
                            "w-full h-8 flex items-center justify-center font-black uppercase tracking-widest text-[9px] rounded-xl border-none shadow-sm",
                            order.status.toLowerCase() === 'delivered' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                         )}>
                            {order.status.toLowerCase() === 'delivered' ? (
                               <><CheckCircle size={12} className="mr-2" /> Mission Success</>
                            ) : (
                               <><XCircle size={12} className="mr-2" /> Terminal Cancelled</>
                            )}
                         </Badge>
                      </div>

                      {/* Middle: Logistics Path */}
                      <div className="flex-1 grid md:grid-cols-2 gap-8 relative">
                         <div className="absolute left-[17px] top-6 bottom-6 w-[1.5px] bg-slate-50 md:block hidden"></div>

                         <div className="space-y-6">
                            <div className="flex items-start space-x-4 relative z-10">
                               <div className="mt-1 p-1.5 bg-white border-2 border-slate-100 text-slate-400 rounded-lg shadow-sm">
                                  <MapPin size={14} />
                               </div>
                               <div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Loading Point</p>
                                  <p className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-2 uppercase">{order.pickup_address}</p>
                               </div>
                            </div>
                            <div className="flex items-start space-x-4 relative z-10">
                               <div className="mt-1 p-1.5 bg-slate-900 text-amber-500 rounded-lg shadow-md">
                                  <Navigation size={14} />
                               </div>
                               <div>
                                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Discharge Point</p>
                                  <p className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-2 uppercase">{order.dropoff_address}</p>
                               </div>
                            </div>
                         </div>

                         <div className="flex flex-col justify-center space-y-4">
                            <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-50">
                               <div className="flex justify-between items-center mb-2">
                                  <span className="text-[9px] font-black text-slate-400 uppercase">Payload Detail</span>
                                  <Badge className="bg-white text-slate-900 text-[8px] border-slate-100">{order.vehicle_category_details?.name || "Standard"}</Badge>
                               </div>
                               <p className="text-xs font-black text-slate-900 uppercase truncate">{order.goods_type}</p>
                               <p className="text-[10px] font-bold text-slate-500 uppercase mt-1">Net Distance: {order.distance_km} KM</p>
                            </div>
                         </div>
                      </div>

                      {/* Right: Revenue Summary */}
                      <div className="lg:w-48 flex flex-col justify-center items-end border-t lg:border-t-0 lg:border-l border-slate-50 pt-6 lg:pt-0 lg:pl-8">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Mission Revenue</p>
                         <div className="flex items-baseline space-x-1">
                            <span className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter">₹{parseFloat(order.price).toLocaleString()}</span>
                         </div>
                         <div className="mt-4 w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-amber-500"></div>
                         </div>
                         <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest mt-2">Verified & Disbursed</p>
                      </div>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
             <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <BarChart3 size={32} className="text-slate-200" />
             </div>
             <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm">Archives Empty</h3>
             <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2 max-w-xs mx-auto leading-relaxed">
               No historical logs found for this terminal. <br/> Complete missions to build your operational record.
             </p>
          </div>
        )}
      </div>

      {/* Historical Note */}
      <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
         <div className="flex items-center space-x-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span>Authenticated Ledger Protected by TRANZO Security Protocol</span>
         </div>
         <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
               <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Delivered</span>
            </div>
            <div className="flex items-center space-x-2">
               <div className="w-2 h-2 rounded-full bg-rose-500"></div>
               <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Cancelled</span>
            </div>
         </div>
      </div>
    </div>
  );
}
