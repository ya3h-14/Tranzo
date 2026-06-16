import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { MapPin, Navigation, Loader2, ArrowRight, Package, Search, Zap, ShieldCheck, Map as MapIcon, History, Activity, Bell, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/api/axios";
import { WeatherWidget } from "@/components/ui/WeatherWidget";

interface Order {
  id: number;
  pickup_address: string;
  dropoff_address: string;
  status: string;
  created_at: string;
  driver?: {
    name: string;
    phone_number: string;
  };
}

export function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [activeMission, setActiveMission] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/api/customer/orders/");
        const orders = response.data;
        setRecentOrders(orders.slice(0, 3));

        // Find the first non-completed/cancelled order to spotlight
        const active = orders.find((o: Order) =>
          !["delivered", "cancelled"].includes(o.status.toLowerCase())
        );
        setActiveMission(active || null);
      } catch (error) {
        console.error("Failed to fetch recent orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto pb-10">
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-2">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 bg-amber-500/10 text-amber-600 px-3 py-1 rounded-full border border-amber-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-[9px] font-black uppercase tracking-widest">Command Center • Secured Connection</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-slate-900 leading-none">
            Welcome back, <span className="text-amber-500">{user?.name?.split(" ")[0] || "Partner"}</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px] pl-1 opacity-70">
            HEAVY MOBILITY LOGISTICS INTERFACE • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <Card className="rounded-2xl border-none shadow-xl bg-slate-900 px-5 py-3 ring-4 ring-slate-50 overflow-hidden relative">
           <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
           <WeatherWidget />
        </Card>
      </div>

      {/* System Ticker / Alerts */}
      <div className="bg-slate-900 text-amber-500 text-[9px] font-black uppercase tracking-[0.3em] py-2 px-4 rounded-lg flex items-center overflow-hidden whitespace-nowrap border border-slate-800">
         <Bell size={10} className="mr-3 animate-bounce shrink-0" />
         <div className="animate-marquee inline-block">
            OPERATIONAL UPDATE: HIGH DEMAND IN MUMBAI PORT AREA • SYSTEM LATENCY: 24MS • ALL ASSETS TRACKING ACTIVE • NEW TATA PRIMA FLEET ADDED TO NORTH HUB •
         </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-6">

        {/* Left Column: Mission Control */}
        <div className="lg:col-span-8 space-y-6">

          {/* Active Mission Spotlight (conditional) */}
          {activeMission && (
            <Card className="border-2 border-amber-500 shadow-xl shadow-amber-500/10 bg-slate-900 overflow-hidden relative group cursor-pointer" onClick={() => navigate(`/customer/tracking/${activeMission.id}`)}>
               <div className="absolute top-0 right-0 p-4">
                  <Activity size={20} className="text-amber-500 animate-pulse" />
               </div>
               <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                     <Badge variant="brand" className="bg-amber-500 text-slate-950 font-black px-4">ACTIVE MISSION</Badge>
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID: #{activeMission.id}</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                     <div className="space-y-3">
                        <div className="flex items-start">
                           <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 mr-3 shrink-0 shadow-[0_0_8px_rgba(245,158,11,1)]"></div>
                           <p className="text-xs font-bold text-white leading-tight uppercase tracking-tight line-clamp-1 opacity-60">{activeMission.pickup_address}</p>
                        </div>
                        <div className="flex items-start">
                           <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 mr-3 shrink-0 shadow-[0_0_8px_rgba(59,130,246,1)]"></div>
                           <p className="text-xs font-black text-white leading-tight uppercase tracking-tight line-clamp-1">{activeMission.dropoff_address}</p>
                        </div>
                     </div>
                     <div className="flex flex-col justify-end items-end">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-1">Status</span>
                        <span className="text-2xl font-black text-white uppercase tracking-tighter">{activeMission.status.replace("_", " ")}</span>
                     </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                     <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Live Telemetry Engaged</p>
                     <div className="flex items-center text-amber-500 text-[10px] font-black uppercase">
                        Track Vector <ArrowRight size={14} className="ml-1" />
                     </div>
                  </div>
               </CardContent>
            </Card>
          )}

          {/* Quick Dispatch Card */}
          <Card className="border-none shadow-xl shadow-slate-200/60 overflow-hidden group bg-white border border-slate-100">
            <div className="bg-slate-900 px-6 py-4 flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center space-x-3">
                 <div className="p-1.5 bg-amber-500 rounded-lg">
                    <Zap size={16} className="text-slate-950" />
                 </div>
                 <h3 className="text-white font-black uppercase tracking-widest text-[10px]">Initialize Freight Protocol</h3>
              </div>
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
            </div>

            <CardContent className="p-8 space-y-8">
              <div className="grid sm:grid-cols-2 gap-8 relative">
                <div className="space-y-4">
                  <Input
                    label="Loading Terminal"
                    icon={<MapPin size={18} className="text-amber-500" />}
                    placeholder="Search or pin origin..."
                    className="bg-slate-50/50 border-transparent hover:bg-white hover:border-amber-200 h-11"
                  />
                  <Input
                    label="Destination Terminal"
                    icon={<Navigation size={18} className="text-slate-900" />}
                    placeholder="Enter delivery point..."
                    className="bg-slate-50/50 border-transparent hover:bg-white hover:border-amber-200 h-11"
                  />
                </div>

                {/* Industrial Graphic */}
                <div className="hidden sm:flex flex-col items-center justify-center bg-slate-900/5 rounded-2xl border-2 border-dashed border-slate-200 p-6 relative overflow-hidden">
                   <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]"></div>
                   <MapIcon size={40} className="text-slate-300 mb-2" />
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Awaiting Routing <br/> Parameters</p>
                </div>

                <div className="sm:absolute left-1/2 top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 flex justify-center z-10 my-4 sm:my-0">
                  <div className="w-10 h-10 bg-slate-900 text-amber-500 rounded-full flex items-center justify-center shadow-lg border-4 border-white transform hover:scale-110 transition-transform cursor-pointer" onClick={() => navigate("/customer/book")}>
                    <ArrowRight size={18} className="rotate-90 sm:rotate-0" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                 <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-3">
                       <ShieldCheck size={16} className="text-emerald-500" />
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase text-slate-400">Security</span>
                          <span className="text-[9px] font-black text-slate-900 uppercase">Insured</span>
                       </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center space-x-3">
                       <Activity size={16} className="text-blue-500" />
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase text-slate-400">ETA Sync</span>
                          <span className="text-[9px] font-black text-slate-900 uppercase">Realtime</span>
                       </div>
                    </div>
                 </div>
                 <Button
                    size="lg"
                    className="w-full sm:w-auto px-10 h-12 text-xs font-black tracking-widest bg-slate-900 text-white hover:bg-slate-800 rounded-xl uppercase shrink-0"
                    onClick={() => navigate("/customer/book")}
                  >
                    CONTINUE TO BOOKING
                  </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Insights */}
        <div className="lg:col-span-4 space-y-6">
           <Card className="border-none shadow-xl bg-amber-500 p-6 overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:rotate-12 transition-transform">
                 <TrendingUp size={64} className="text-slate-900" />
              </div>
              <div className="relative z-10 space-y-2">
                 <h4 className="text-slate-950 font-black uppercase tracking-tighter text-2xl">Asset Radar</h4>
                 <p className="text-slate-900/60 font-bold uppercase text-[9px] tracking-widest">Available Heavy-Duty Assets Near You</p>
                 <div className="flex items-end space-x-1 pt-2">
                    <span className="text-5xl font-black text-slate-950 tabular-nums">142</span>
                    <span className="text-xs font-black text-slate-950 mb-1.5 uppercase">UNITS</span>
                 </div>
              </div>
           </Card>

           <div className="grid grid-cols-2 gap-4">
              <button onClick={() => navigate("/customer/orders")} className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 hover:border-amber-500 transition-all flex flex-col items-center text-center space-y-3 group bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.05),transparent)]">
                 <div className="p-2.5 bg-slate-900 text-amber-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-slate-900/20">
                    <History size={18} />
                 </div>
                 <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Mission Logs</span>
              </button>
              <button onClick={() => navigate("/customer/profile")} className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 hover:border-amber-500 transition-all flex flex-col items-center text-center space-y-3 group">
                 <div className="p-2.5 bg-slate-900 text-amber-500 rounded-xl group-hover:scale-110 transition-transform shadow-lg shadow-slate-900/20">
                    <Search size={18} />
                 </div>
                 <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest">Support</span>
              </button>
           </div>

           {/* Promotional / Information Banner */}
           <Card className="bg-slate-100 border-none p-5 rounded-2xl">
              <div className="flex space-x-4 items-start">
                 <div className="p-2 bg-white rounded-lg shadow-sm">
                    <Package size={20} className="text-amber-600" />
                 </div>
                 <div className="space-y-1">
                    <h5 className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Bulk Logistics?</h5>
                    <p className="text-[9px] text-slate-500 font-medium leading-relaxed uppercase">Need more than 5 trucks? Contact our Enterprise Terminal for custom rates.</p>
                 </div>
              </div>
           </Card>
        </div>
      </div>

      {/* Manifest Timeline Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
             <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
             <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Mission Manifest Logs</h2>
          </div>
          <button
            onClick={() => navigate("/customer/orders")}
            className="text-[10px] font-black text-amber-600 uppercase hover:text-slate-900 transition-colors tracking-widest border-b-2 border-transparent hover:border-slate-900"
          >
            Access Full Database
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="animate-spin text-amber-600" size={32} />
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentOrders.map((order) => (
              <Card
                key={order.id}
                className="cursor-pointer hover:border-amber-400 transition-all border border-slate-100 shadow-md hover:shadow-2xl bg-white overflow-hidden rounded-2xl group relative"
                onClick={() => navigate(`/customer/tracking/${order.id}`)}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 bg-slate-900 text-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-slate-950/10">
                        <Package size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                          MANIFEST ID-{order.id}
                        </span>
                        <span className="text-[10px] font-bold text-slate-900">
                          {new Date(order.created_at).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    </div>
                    <Badge variant={order.status === "delivered" ? "success" : order.status === "cancelled" ? "danger" : "brand"} className="scale-90 origin-top-right uppercase font-black tracking-widest px-3">
                      {order.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div className="space-y-3 relative pl-1">
                    <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-slate-100 group-hover:bg-amber-200 transition-colors"></div>
                    <div className="flex items-start relative z-10">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1 mr-3 shrink-0 ring-2 ring-white"></div>
                      <span className="text-[10px] font-bold text-slate-500 leading-tight line-clamp-1 uppercase opacity-60">{order.pickup_address}</span>
                    </div>
                    <div className="flex items-start relative z-10">
                      <div className="w-2 h-2 rounded-full bg-slate-900 mt-1 mr-3 shrink-0 ring-2 ring-white"></div>
                      <span className="text-[10px] font-black text-slate-900 leading-tight line-clamp-1 uppercase">{order.dropoff_address}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                     <span className="text-[8px] font-black text-amber-600 uppercase tracking-widest">Launch Vector Tracking</span>
                     <ArrowRight size={12} className="text-amber-500" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
            <Package className="text-slate-200 mx-auto mb-4" size={48} />
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Manifest Database Empty</p>
            <p className="text-[9px] text-slate-400 mt-2 uppercase font-bold tracking-widest">No logistics history found for this terminal</p>
          </div>
        )}
      </div>
    </div>
  );
}
