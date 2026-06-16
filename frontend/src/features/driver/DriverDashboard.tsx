import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Truck, MapPin, IndianRupee, Clock, Package,
  Loader2, PlayCircle, Zap, Activity, Navigation,
  ArrowRight, ShieldCheck, Box
} from "lucide-react";
import { api } from "@/api/axios";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { Badge } from "@/components/ui/Badge";
import { WeatherWidget } from "@/components/ui/WeatherWidget";
import { cn } from "@/utils/cn";

interface Order {
  id: number;
  customer_details: {
    name: string;
    phone_number: string;
  };
  pickup_address: string;
  dropoff_address: string;
  goods_type: string;
  price: string;
  distance_km: string;
  status: string;
  created_at: string;
}

export function DriverDashboard() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isToggling, setIsToggling] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/api/driver/orders/");
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleOnline = async () => {
    setIsToggling(true);
    try {
      const response = await api.post("/api/driver/toggle-online/");
      updateUser(response.data.user);
    } catch (error) {
      console.error("Failed to toggle online status:", error);
    } finally {
      setIsToggling(false);
    }
  };

  const handleAcceptOrder = async (orderId: number) => {
    try {
      await api.post(`/api/driver/orders/${orderId}/accept/`);
      navigate(`/driver/active/${orderId}`);
    } catch (error) {
      console.error("Failed to accept order:", error);
      fetchOrders();
    }
  };

  const activeOrders = orders.filter(o => ['accepted', 'picked_up', 'in_transit'].includes(o.status));
  const availableOrders = orders.filter(o => o.status === 'pending');
  const isOnline = user?.is_online || false;

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="animate-spin text-amber-500" size={40} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Synchronizing Fleet Systems...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 pb-20 animate-in fade-in duration-700">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Zap size={10} className="text-amber-500 fill-amber-500" />
            <span>Driver Tactical Interface</span>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <span className={cn(isOnline ? "text-emerald-500" : "text-slate-400")}>
              {isOnline ? "Status: Active" : "Status: Standby"}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Welcome back, <span className="text-amber-500">{user?.name?.split(" ")[0]}</span>
          </h1>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="bg-slate-900 px-6 py-4 rounded-[1.5rem] shadow-2xl shadow-slate-900/20">
            <WeatherWidget />
          </div>

          <div className="flex items-center justify-between space-x-4 bg-white p-4 rounded-[1.5rem] shadow-lg border border-slate-100 min-w-[180px]">
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Duty Status</span>
              <span className={cn("text-[10px] font-black uppercase tracking-widest", isOnline ? "text-emerald-600" : "text-slate-400")}>
                {isOnline ? "ONLINE" : "OFFLINE"}
              </span>
            </div>
            <button
              disabled={isToggling}
              onClick={handleToggleOnline}
              className={cn(
                "relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 focus:outline-none ring-offset-2 focus:ring-2",
                isOnline ? "bg-emerald-500 ring-emerald-500/20" : "bg-slate-200 ring-slate-200/20",
                isToggling && "opacity-50 cursor-not-allowed"
              )}
            >
              <span
                className={cn(
                  "inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out",
                  isOnline ? "translate-x-6" : "translate-x-1"
                )}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Ticker / Alerts */}
      <div className="bg-slate-900 text-amber-500 text-[9px] font-black uppercase tracking-[0.3em] py-2 px-4 rounded-lg flex items-center overflow-hidden whitespace-nowrap border border-slate-800">
         <Activity size={10} className="mr-3 animate-pulse shrink-0" />
         <div className="animate-marquee inline-block">
            SYSTEM FEED: {availableOrders.length} PENDING LOGISTICS REQUESTS IN YOUR RADIUS • REAL-TIME TRACKING ACTIVE • SECURE CONNECTION ESTABLISHED •
         </div>
      </div>

      {/* Active Jobs Section */}
      {activeOrders.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2 px-2">
            <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Ongoing Mission</h2>
          </div>
          <div className="grid gap-4">
            {activeOrders.map(order => (
              <Card key={order.id} className="border-none shadow-2xl shadow-slate-900/20 bg-slate-900 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-6">
                  <PlayCircle size={24} className="text-amber-500 animate-pulse" />
                </div>
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row justify-between gap-8">
                    <div className="space-y-6 flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                         <Badge className="bg-amber-500 text-slate-950 font-black px-4 uppercase tracking-widest text-[9px]">ACTIVE LOAD</Badge>
                         <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID: #{order.id}</span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-6">
                        <div className="flex items-start space-x-4">
                          <div className="mt-1 p-2 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 shadow-inner">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Origin Terminal</p>
                            <p className="text-white font-bold text-sm leading-tight">{order.pickup_address}</p>
                          </div>
                        </div>
                        <div className="flex items-start space-x-4">
                          <div className="mt-1 p-2 bg-blue-500/10 text-blue-500 rounded-xl border border-blue-500/20 shadow-inner">
                            <Navigation size={18} />
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-1">Destination</p>
                            <p className="text-white font-bold text-sm leading-tight">{order.dropoff_address}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full md:w-72 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
                      <div className="flex justify-between items-center mb-6">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Payout</span>
                           <span className="text-3xl font-black text-white tabular-nums tracking-tighter">₹{order.price}</span>
                        </div>
                        <div className="text-right">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Load Type</span>
                           <p className="text-amber-500 font-black text-xs uppercase tracking-widest">{order.goods_type}</p>
                        </div>
                      </div>
                      <Button
                        className="w-full h-14 bg-amber-500 text-slate-950 hover:bg-amber-400 font-black uppercase tracking-widest text-[11px] rounded-xl shadow-xl shadow-amber-500/10"
                        onClick={() => navigate(`/driver/active/${order.id}`)}
                      >
                        RE-ENGAGE MISSION <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Available Requests Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
             <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
             <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">Available Manifests</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchOrders}
            disabled={isLoading}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900"
          >
            {isLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Activity size={14} className="mr-2" />}
            Refresh Grid
          </Button>
        </div>

        {!isOnline ? (
          <Card className="bg-white border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden">
            <CardContent className="p-16 text-center space-y-6">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center border border-slate-100 shadow-inner mx-auto group">
                 <Truck size={40} className="text-slate-200 group-hover:text-amber-500 transition-colors duration-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Terminal Offline</h3>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                  Switch your status to online to start receiving <br/> heavy-duty freight requests in your sector.
                </p>
              </div>
              <Button
                onClick={handleToggleOnline}
                className="bg-slate-900 text-white hover:bg-slate-800 px-10 h-12 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl"
              >
                Engage Online Mode
              </Button>
            </CardContent>
          </Card>
        ) : availableOrders.length === 0 ? (
          <div className="text-center py-24 bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-200">
            <Box size={48} className="mx-auto text-slate-200 mb-6" />
            <h3 className="text-slate-900 font-black uppercase tracking-widest text-sm">No Manifests Available</h3>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Standing by for new logistics telemetry...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableOrders.map(order => (
              <Card key={order.id} className="group hover:border-amber-400 transition-all border border-slate-100 shadow-lg hover:shadow-2xl bg-white overflow-hidden rounded-[1.5rem] relative">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                       <Badge className="bg-slate-900 text-white font-black text-[8px] uppercase tracking-widest px-2">
                         {order.distance_km} KM SECTOR
                       </Badge>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: #{order.id}</p>
                    </div>
                    <div className="flex flex-col items-end">
                       <span className="text-2xl font-black text-emerald-600 tabular-nums">₹{order.price}</span>
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Est. Revenue</span>
                    </div>
                  </div>

                  <div className="space-y-4 mb-6 relative pl-1">
                    <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-slate-100 group-hover:bg-amber-200 transition-colors"></div>
                    <div className="flex items-start relative z-10">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 mr-3 shrink-0 ring-4 ring-white shadow-sm"></div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Pickup</p>
                        <p className="text-[11px] font-bold text-slate-900 leading-tight line-clamp-2 uppercase">{order.pickup_address}</p>
                      </div>
                    </div>
                    <div className="flex items-start relative z-10">
                      <div className="w-2 h-2 rounded-full bg-slate-900 mt-1.5 mr-3 shrink-0 ring-4 ring-white shadow-sm"></div>
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Dropoff</p>
                        <p className="text-[11px] font-bold text-slate-900 leading-tight line-clamp-2 uppercase">{order.dropoff_address}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <div className="p-1.5 bg-slate-50 rounded-lg">
                          <Package size={14} className="text-slate-400" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Payload</span>
                          <span className="text-[10px] font-black text-slate-900 uppercase truncate max-w-[80px]">{order.goods_type}</span>
                       </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleAcceptOrder(order.id)}
                      className="bg-slate-900 text-white hover:bg-amber-500 hover:text-slate-950 font-black uppercase tracking-widest text-[9px] h-9 px-4 rounded-lg transition-all"
                    >
                      Accept Job
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer Info / Security */}
      <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-slate-50 p-4 rounded-2xl flex items-center space-x-4 border border-slate-100">
            <div className="p-2 bg-white rounded-xl shadow-sm">
               <ShieldCheck size={20} className="text-emerald-500" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Secure Payments</p>
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">Instant Payouts enabled</p>
            </div>
         </div>
         <div className="bg-slate-50 p-4 rounded-2xl flex items-center space-x-4 border border-slate-100">
            <div className="p-2 bg-white rounded-xl shadow-sm">
               <Truck size={20} className="text-amber-500" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Fleet Support</p>
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">24/7 Roadside Assistance</p>
            </div>
         </div>
         <div className="bg-slate-50 p-4 rounded-2xl flex items-center space-x-4 border border-slate-100">
            <div className="p-2 bg-white rounded-xl shadow-sm">
               <Activity size={20} className="text-blue-500" />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Telemetry Hub</p>
               <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tight">V3.2 Engine Monitoring</p>
            </div>
         </div>
      </div>
    </div>
  );
}
