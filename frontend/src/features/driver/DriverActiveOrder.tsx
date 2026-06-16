import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  MapPin, Phone, Package, Navigation, ArrowLeft,
  Loader2, CheckCircle, PackageCheck, Truck,
  Zap, Activity, ShieldCheck, Box, User,
  ExternalLink, TrendingUp
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { MapView } from "@/components/map/MapView";
import { api } from "@/api/axios";
import { cn } from "@/utils/cn";

interface Order {
  id: number;
  customer_details: {
    name: string;
    phone_number: string;
  };
  pickup_address: string;
  pickup_lat: string;
  pickup_lng: string;
  dropoff_address: string;
  dropoff_lat: string;
  dropoff_lng: string;
  goods_type: string;
  estimated_weight: number;
  package_details: string;
  price: string;
  status: string;
  distance_km: string;
}

export function DriverActiveOrder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/api/driver/orders/${id}/`);
      setOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
      navigate("/driver");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchOrder();
  }, [id]);

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await api.post(`/api/driver/orders/${id}/update_status/`, { status: newStatus });
      await fetchOrder();
      if (newStatus === 'delivered') {
        setTimeout(() => navigate('/driver'), 2500);
      }
    } catch (error) {
      console.error("Status update failed:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="animate-spin text-amber-500" size={40} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Initializing Mission Telemetry...</span>
      </div>
    );
  }

  if (!order) return null;

  const pickup = { lat: parseFloat(order.pickup_lat), lng: parseFloat(order.pickup_lng), label: order.pickup_address };
  const drop = { lat: parseFloat(order.dropoff_lat), lng: parseFloat(order.dropoff_lng), label: order.dropoff_address };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 pb-20 animate-in fade-in duration-700">

      {/* Tactical Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-4 mb-2">
            <button
              onClick={() => navigate("/driver")}
              className="p-2 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
            >
              <ArrowLeft size={16} className="text-slate-600" />
            </button>
            <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
              <Zap size={10} className="text-amber-500 fill-amber-500" />
              <span>Mission Live View</span>
              <div className="w-1 h-1 rounded-full bg-slate-300"></div>
              <span className="text-emerald-500">Encrypted Channel</span>
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            Manifest <span className="text-amber-500">#{order.id}</span>
          </h1>
        </div>

        <div className="flex items-center space-x-3 bg-slate-900 px-6 py-4 rounded-[1.5rem] shadow-2xl shadow-slate-900/20">
           <div className="flex flex-col">
              <span className="text-[8px] font-black text-amber-500/60 uppercase tracking-widest">Global Status</span>
              <span className="text-white font-black uppercase tracking-widest text-[10px]">{order.status.replace("_", " ")}</span>
           </div>
           <div className="w-px h-8 bg-slate-800 mx-2"></div>
           <Badge className={cn(
             "px-4 py-1.5 font-black uppercase tracking-widest text-[9px]",
             order.status === 'delivered' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'
           )}>
             Live Mission
           </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: Navigation & Route */}
        <div className="lg:col-span-8 space-y-8">

          {/* Enhanced Map Container */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-amber-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000"></div>
            <div className="relative h-[500px] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-100">
              <MapView
                pickup={pickup}
                drop={drop}
                showRoute={true}
                className="h-full w-full"
              />

              {/* Map Overlays */}
              <div className="absolute top-6 left-6 flex flex-col gap-3">
                 <div className="bg-slate-900/90 backdrop-blur px-4 py-3 rounded-2xl border border-white/10 shadow-2xl">
                    <div className="flex items-center space-x-3">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                       <span className="text-[10px] font-black text-white uppercase tracking-widest">GPS Tracking Active</span>
                    </div>
                 </div>
              </div>

              <div className="absolute bottom-6 right-6">
                 <button className="bg-white p-4 rounded-2xl shadow-2xl hover:bg-slate-50 transition-all border border-slate-100">
                    <ExternalLink size={20} className="text-slate-900" />
                 </button>
              </div>
            </div>
          </div>

          {/* Delivery Coordinates Card */}
          <Card className="border-none shadow-xl shadow-slate-200/50 rounded-[2rem] overflow-hidden bg-white border border-slate-100">
            <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
               <div className="flex items-center space-x-3">
                  <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
                  <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Logistics Telemetry</h2>
               </div>
               <div className="flex items-center space-x-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                  <Activity size={12} />
                  <span>Real-time Sync</span>
               </div>
            </div>
            <CardContent className="p-8">
               <div className="grid md:grid-cols-2 gap-10">
                 <div className="space-y-8 relative">
                    <div className="absolute left-[17px] top-6 bottom-6 w-[2px] bg-slate-100"></div>

                    <div className="flex items-start space-x-5 relative z-10">
                      <div className="mt-1 p-2 bg-amber-500 text-slate-950 rounded-xl shadow-lg shadow-amber-500/20 ring-4 ring-white">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Loading Terminal (Origin)</p>
                        <p className="text-sm font-bold text-slate-900 leading-snug uppercase">{order.pickup_address}</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-5 relative z-10">
                      <div className="mt-1 p-2 bg-slate-900 text-amber-500 rounded-xl shadow-lg shadow-slate-900/20 ring-4 ring-white">
                        <Navigation size={18} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Discharge Point (Destination)</p>
                        <p className="text-sm font-bold text-slate-900 leading-snug uppercase">{order.dropoff_address}</p>
                      </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 space-y-3">
                       <Package size={20} className="text-slate-400" />
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payload Type</p>
                          <p className="text-xs font-black text-slate-900 uppercase truncate">{order.goods_type}</p>
                       </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 space-y-3">
                       <TrendingUp size={20} className="text-slate-400" />
                       <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Net Distance</p>
                          <p className="text-xs font-black text-slate-900 uppercase">{order.distance_km} KM</p>
                       </div>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-[1.5rem] border border-slate-100 space-y-3 col-span-2 flex items-center justify-between">
                       <div className="flex items-center space-x-4">
                          <Box size={20} className="text-amber-500" />
                          <div>
                             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Weight Class</p>
                             <p className="text-xs font-black text-slate-900 uppercase">{order.estimated_weight} KG EST.</p>
                          </div>
                       </div>
                       <Badge variant="brand" className="bg-slate-900 text-white font-black text-[8px] tracking-[0.2em]">HEAVY-DUTY</Badge>
                    </div>
                 </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Controls & Contact */}
        <div className="lg:col-span-4 space-y-8">

          {/* Revenue & progression Card */}
          <Card className="bg-white shadow-2xl shadow-slate-900/20 border-none rounded-[2.5rem] overflow-hidden sticky top-8">
            <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500 opacity-10 rounded-full blur-3xl"></div>
              <p className="text-amber-500/60 text-[10px] font-black uppercase tracking-[0.3em] mb-2 relative z-10">Contractual Payout</p>
              <div className="flex items-baseline space-x-1 relative z-10">
                 <span className="text-5xl font-black tracking-tighter tabular-nums">₹{parseFloat(order.price).toLocaleString()}</span>
                 <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Gross</span>
              </div>
            </div>

            <CardContent className="p-8 space-y-10">

              {/* Customer Contact */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Dossier</h3>
                   <ShieldCheck size={14} className="text-emerald-500" />
                </div>
                <div className="flex items-center space-x-4 p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all duration-500">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-amber-500 font-black text-xl shadow-lg group-hover:scale-105 transition-transform">
                    <User size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate uppercase tracking-tight">{order.customer_details.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-widest mt-0.5">{order.customer_details.phone_number}</p>
                  </div>
                  <a
                    href={`tel:${order.customer_details.phone_number}`}
                    className="p-4 bg-white text-slate-900 hover:bg-slate-900 hover:text-amber-500 rounded-2xl shadow-md transition-all border border-slate-100"
                  >
                    <Phone size={20} />
                  </a>
                </div>
              </div>

              {/* Mission Controls */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission Controls</h3>
                   <div className="flex space-x-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          (i === 1 && order.status === 'accepted') || (i === 2 && order.status === 'picked_up') || (i === 3 && order.status === 'in_transit') ? "bg-amber-500 animate-pulse" : "bg-slate-200"
                        )}></div>
                      ))}
                   </div>
                </div>

                <div className="space-y-4">
                  {order.status === 'accepted' && (
                    <Button
                      className="w-full h-16 bg-slate-900 text-white hover:bg-slate-800 space-x-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center justify-center"
                      onClick={() => updateStatus('picked_up')}
                      isLoading={isUpdating}
                    >
                      <PackageCheck size={20} className="text-amber-500" />
                      <span>Execute Pick Up</span>
                    </Button>
                  )}

                  {order.status === 'picked_up' && (
                    <Button
                      className="w-full h-16 bg-amber-500 text-slate-950 hover:bg-amber-400 space-x-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center justify-center border-none"
                      onClick={() => updateStatus('in_transit')}
                      isLoading={isUpdating}
                    >
                      <Truck size={20} />
                      <span>Initiate Transit</span>
                    </Button>
                  )}

                  {order.status === 'in_transit' && (
                    <Button
                      className="w-full h-16 bg-emerald-600 text-white hover:bg-emerald-500 space-x-3 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl transition-all flex items-center justify-center border-none"
                      onClick={() => updateStatus('delivered')}
                      isLoading={isUpdating}
                    >
                      <CheckCircle size={20} />
                      <span>Finalize Delivery</span>
                    </Button>
                  )}

                  {order.status === 'delivered' && (
                    <div className="flex flex-col items-center justify-center py-10 bg-emerald-50 rounded-[2rem] text-emerald-700 border-2 border-dashed border-emerald-200 animate-in zoom-in duration-500">
                      <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mb-4 shadow-xl shadow-emerald-500/20">
                         <CheckCircle size={32} />
                      </div>
                      <span className="font-black text-xl uppercase tracking-tighter">Mission Accomplished</span>
                      <p className="text-[9px] font-black uppercase tracking-widest mt-1 opacity-60">Redirecting to Command Center...</p>
                    </div>
                  )}

                  <p className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-[0.2em] mt-4">
                    All status updates are logged with millisecond precision
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
