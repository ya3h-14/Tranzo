import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { LocationSearch } from "@/components/map/LocationSearch";
import { MapView } from "@/components/map/MapView";
import {
  Truck, Weight, IndianRupee, Loader2, CheckCircle, AlertCircle,
  Map as MapIcon, ArrowRight, ShieldCheck, Zap, Activity, Info,
  ChevronRight, Package, ArrowDownUp, Bike, ShoppingBag, Box, PlaneTakeoff
} from "lucide-react";
import { api } from "@/api/axios";
import { useNavigate } from "react-router-dom";
import { cn } from "@/utils/cn";

interface VehicleCategory {
  id: number;
  name: string;
  base_price: string;
  price_per_km: string;
  base_distance: string;
  max_weight: number;
  description: string;
  online_drivers_count: number;
}

export function BookingPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pickingType, setPickingType] = useState<"pickup" | "dropoff" | null>(null);

  const [formData, setFormData] = useState({
    pickup_address: "",
    pickup_lat: null as number | null,
    pickup_lng: null as number | null,
    dropoff_address: "",
    dropoff_lat: null as number | null,
    dropoff_lng: null as number | null,
    goods_type: "General Goods",
    estimated_weight: "",
    distance_km: "",
    vehicle_category_id: ""
  });

  const [estimate, setEstimate] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/api/driver/categories/");
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to load vehicle categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    const interval = setInterval(fetchCategories, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const calculateRoadDistance = async () => {
      if (formData.pickup_lat && formData.pickup_lng && formData.dropoff_lat && formData.dropoff_lng) {
        try {
          const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${formData.pickup_lng},${formData.pickup_lat};${formData.dropoff_lng},${formData.dropoff_lat}?overview=false`
          );
          const data = await response.json();
          if (data.routes && data.routes[0]) {
            const distanceInKm = (data.routes[0].distance / 1000).toFixed(1);
            setFormData(prev => ({ ...prev, distance_km: distanceInKm }));
          }
        } catch (error) {
          console.error("Routing failed:", error);
        }
      }
    };
    calculateRoadDistance();
  }, [formData.pickup_lat, formData.dropoff_lat]);

  useEffect(() => {
    if (formData.distance_km && formData.vehicle_category_id) {
      const category = categories.find(c => c.id === Number(formData.vehicle_category_id));
      if (category) {
        const dist = parseFloat(formData.distance_km);
        const base = parseFloat(category.base_price);
        const perKm = parseFloat(category.price_per_km);
        const baseDist = parseFloat(category.base_distance);

        let total = base;
        if (dist > baseDist) {
          total = base + ((dist - baseDist) * perKm);
        }
        setEstimate(total);
      }
    } else {
      setEstimate(null);
    }
  }, [formData.distance_km, formData.vehicle_category_id, categories]);

  const handleMapClick = async (lat: number, lng: number) => {
    if (!pickingType) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      const address = data.display_name;

      if (pickingType === "pickup") {
        setFormData({ ...formData, pickup_address: address, pickup_lat: lat, pickup_lng: lng });
      } else {
        setFormData({ ...formData, dropoff_address: address, dropoff_lat: lat, dropoff_lng: lng });
      }
      setPickingType(null);
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
    }
  };

  const handleMarkerDrag = async (type: "pickup" | "drop", lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`
      );
      const data = await response.json();
      const address = data.display_name;

      if (type === "pickup") {
        setFormData(prev => ({ ...prev, pickup_address: address, pickup_lat: lat, pickup_lng: lng }));
      } else {
        setFormData(prev => ({ ...prev, dropoff_address: address, dropoff_lat: lat, dropoff_lng: lng }));
      }
    } catch (error) {
      console.error("Marker drag reverse geocoding failed:", error);
    }
  };

  const swapLocations = () => {
    setFormData(prev => ({
      ...prev,
      pickup_address: prev.dropoff_address,
      pickup_lat: prev.dropoff_lat,
      pickup_lng: prev.dropoff_lng,
      dropoff_address: prev.pickup_address,
      dropoff_lat: prev.pickup_lat,
      dropoff_lng: prev.pickup_lng,
    }));
  };

  const getVehicleIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('2-wheeler') || n.includes('bike') || n.includes('scooter')) return <Bike size={16} />;
    if (n.includes('3-wheeler') || n.includes('auto') || n.includes('rickshaw')) return <ShoppingBag size={16} />;
    if (n.includes('tata ace') || n.includes('small')) return <Truck size={16} />;
    if (n.includes('pickup') || n.includes('bolero')) return <Truck size={18} className="scale-x-110" />;
    return <Truck size={18} />;
  };

  const weightInput = Number(formData.estimated_weight) || 0;
  const filteredCategories = categories.filter(cat => weightInput === 0 || weightInput <= cat.max_weight);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.vehicle_category_id) return;

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        pickup_lat: formData.pickup_lat ? parseFloat(formData.pickup_lat.toFixed(6)) : null,
        pickup_lng: formData.pickup_lng ? parseFloat(formData.pickup_lng.toFixed(6)) : null,
        dropoff_lat: formData.dropoff_lat ? parseFloat(formData.dropoff_lat.toFixed(6)) : null,
        dropoff_lng: formData.dropoff_lng ? parseFloat(formData.dropoff_lng.toFixed(6)) : null,
        estimated_weight: Number(formData.estimated_weight)
      };

      const response = await api.post("/api/customer/orders/", payload);
      navigate(`/customer/tracking/${response.data.id}`);
    } catch (error: any) {
      console.error("Booking failed:", error.response?.data || error.message);
      alert("Booking failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-4 px-4 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Dynamic Breadcrumb/Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1.5 border-b border-slate-200">
        <div className="flex items-center space-x-2">
           <div className="flex items-center text-[8px] font-black uppercase tracking-widest text-slate-400">
              <span className="hover:text-amber-600 cursor-pointer transition-colors" onClick={() => navigate('/customer')}>Terminal Hub</span>
              <ChevronRight size={8} className="mx-1 opacity-30" />
              <span className="text-slate-900 bg-slate-100 px-1 py-0.5 rounded">Initialize Manifest</span>
           </div>
        </div>
        <div className="flex items-center space-x-3">
           <div className="flex items-center space-x-1">
              <div className="w-1 h-1 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.5)] animate-pulse"></div>
              <span className="text-[8px] font-black uppercase tracking-[0.1em] text-slate-600">Protocol Active</span>
           </div>
           <div className="hidden sm:flex items-center space-x-1 text-[8px] font-black uppercase tracking-widest text-slate-400 border-l pl-3 border-slate-200">
              <Activity size={8} className="text-amber-500" />
              <span>System Optimal</span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        <div className="lg:col-span-8 space-y-4">

          {/* Main Logic Card */}
          <Card className="border-none shadow-lg shadow-slate-200/30 bg-white overflow-hidden rounded-[1rem]">
             <div className="bg-slate-900 px-5 py-2 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                   <div className="p-1 bg-amber-500 rounded-md">
                      <Zap size={10} className="text-slate-950 fill-slate-950" />
                   </div>
                   <h2 className="text-[9px] font-black text-white uppercase tracking-[0.15em] leading-none">Mission Logistics Grid</h2>
                </div>
                <Badge variant="brand" className="bg-white/5 text-amber-500 border-white/10 px-2 py-0.5 text-[7px] font-black">
                  V2.4 SECURE
                </Badge>
             </div>

            <CardContent className="p-5 space-y-6">
              {/* Location Matrix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
                <div className="space-y-3 relative">
                  <LocationSearch
                    label="Loading Terminal (A)"
                    placeholder="Search origin hub..."
                    showCurrentLocation={true}
                    value={formData.pickup_address}
                    onSelect={(data) => setFormData({...formData, pickup_address: data.address, pickup_lat: data.lat, pickup_lng: data.lng})}
                  />

                  <div className="flex items-center justify-center relative h-1.5">
                     <div className="absolute inset-x-0 h-[1px] bg-slate-100"></div>
                     <button
                        onClick={swapLocations}
                        className="relative z-10 p-1 bg-white border border-slate-100 rounded-full shadow-sm text-slate-400 hover:text-amber-500 transition-all hover:rotate-180 duration-500"
                     >
                        <ArrowDownUp size={10} />
                     </button>
                  </div>

                  <LocationSearch
                    label="Discharge Point (B)"
                    placeholder="Search destination..."
                    value={formData.dropoff_address}
                    onSelect={(data) => setFormData({...formData, dropoff_address: data.address, dropoff_lat: data.lat, dropoff_lng: data.lng})}
                  />
                </div>

                {/* HD Map Container */}
                <div className="h-40 md:h-auto min-h-[220px] rounded-[0.75rem] overflow-hidden border-2 border-slate-50 shadow-inner relative group bg-slate-100">
                   <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1">
                      <div className="flex items-center space-x-1 bg-slate-900/90 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/5">
                         <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></div>
                         <span className="text-[6px] font-black text-white uppercase tracking-widest">Telemetry</span>
                      </div>
                      <button
                        onClick={() => setPickingType(pickingType === "pickup" ? null : "pickup")}
                        className={cn("px-2 py-1 rounded-full text-[7px] font-black uppercase transition-all shadow-md flex items-center space-x-1 border",
                          pickingType === "pickup"
                            ? "bg-amber-500 text-slate-950 border-amber-600"
                            : "bg-white text-slate-600 hover:bg-slate-50 border-slate-100"
                        )}
                      >
                        <MapIcon size={8} />
                        <span>{pickingType === "pickup" ? "Calibrating..." : "Pin Terminal"}</span>
                      </button>
                   </div>
                  <MapView
                    className="h-full"
                    pickup={formData.pickup_lat ? {lat: formData.pickup_lat, lng: formData.pickup_lng!, label: formData.pickup_address} : undefined}
                    drop={formData.dropoff_lat ? {lat: formData.dropoff_lat, lng: formData.dropoff_lng!, label: formData.dropoff_address} : undefined}
                    isPickingLocation={!!pickingType}
                    onMapClick={handleMapClick}
                    onMarkerDrag={handleMarkerDrag}
                  />
                </div>
              </div>

              {/* Payload Parameters */}
              <div className="bg-slate-50/50 rounded-[0.75rem] p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border border-slate-100/50">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-1 ml-2">
                     <Box size={8} className="text-slate-400" />
                     <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Commodity Class</label>
                  </div>
                  <div className="relative group">
                     <Package size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
                     <input
                        className="w-full rounded-lg border border-slate-200 py-2 pl-8 focus:ring-0 focus:border-amber-500 transition-all px-3 font-bold text-[10px] text-slate-900 bg-white shadow-sm"
                        placeholder="e.g. General Goods"
                        value={formData.goods_type}
                        onChange={(e) => setFormData({...formData, goods_type: e.target.value})}
                     />
                  </div>
                </div>
                <div className="space-y-1.5">
                   <div className="flex items-center space-x-1 ml-2">
                      <Weight size={8} className="text-slate-400" />
                      <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Estimated Mass (KG)</label>
                   </div>
                  <div className="relative group">
                     <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-slate-400 uppercase">KG</div>
                     <input
                        type="number"
                        className="w-full rounded-lg border border-slate-200 py-2 pl-8 focus:ring-0 focus:border-amber-500 transition-all px-3 font-black text-sm text-slate-900 bg-white shadow-sm tabular-nums"
                        placeholder="0"
                        value={formData.estimated_weight}
                        onChange={(e) => setFormData({...formData, estimated_weight: e.target.value})}
                     />
                     <div className="absolute right-2 top-1/2 -translate-y-1/2 flex space-x-0.5">
                        {[100, 500, 1000].map(w => (
                           <button
                              key={w}
                              onClick={() => setFormData({...formData, estimated_weight: String(w)})}
                              className="text-[6px] font-black px-1 py-0.5 bg-slate-100 text-slate-500 rounded hover:bg-amber-100 hover:text-amber-700 transition-colors"
                           >
                              {w}
                           </button>
                        ))}
                     </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset Selection Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2">
               <div className="flex items-center space-x-1.5">
                  <div className="w-0.5 h-3 bg-slate-900 rounded-full shadow-sm"></div>
                  <h2 className="text-[9px] font-black text-slate-900 uppercase tracking-widest">Fleet Authorization Grid</h2>
               </div>
               {categories.length > 0 && (
                  <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded-full">
                    {categories.length} Assets
                  </span>
               )}
            </div>

            {isLoadingCategories ? (
              <div className="flex flex-col items-center justify-center p-8 space-y-2">
                 <Loader2 className="animate-spin text-amber-500" size={16} />
                 <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Loading fleet...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <Card className="text-center py-8 bg-slate-50/50 rounded-[0.75rem] border-2 border-dashed border-slate-200 border-none shadow-inner">
                <AlertCircle size={16} className="mx-auto text-slate-300 mb-1" />
                <h3 className="text-[8px] font-black uppercase tracking-widest text-slate-900">No Compatible Assets</h3>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {filteredCategories.map((cat) => (
                  <label
                    key={cat.id}
                    className={cn("relative group flex items-center p-3 rounded-[0.75rem] cursor-pointer transition-all border",
                      formData.vehicle_category_id === String(cat.id)
                        ? "border-slate-900 bg-slate-900 text-white shadow-md shadow-slate-900/10"
                        : "border-slate-100 bg-white shadow-sm hover:border-amber-200"
                    )}
                  >
                    <input
                      type="radio"
                      name="vehicle"
                      className="sr-only"
                      value={cat.id}
                      onChange={(e) => setFormData({...formData, vehicle_category_id: e.target.value})}
                    />
                    <div className={cn("p-2 rounded-lg mr-3 transition-all shadow-inner shrink-0",
                      formData.vehicle_category_id === String(cat.id)
                        ? "bg-amber-500 text-slate-950"
                        : "bg-slate-50 text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600"
                    )}>
                      {getVehicleIcon(cat.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <span className="font-black uppercase tracking-tighter text-[9px] md:text-[10px] truncate leading-none">{cat.name}</span>
                        {formData.vehicle_category_id === String(cat.id) && <CheckCircle size={10} className="text-amber-500 shrink-0 ml-1" />}
                      </div>
                      <div className="flex items-center space-x-2">
                         <div className="flex items-center space-x-1">
                            <Weight size={8} className={cn(formData.vehicle_category_id === String(cat.id) ? "text-amber-500/50" : "text-slate-300")} />
                            <span className={cn("text-[7px] font-black uppercase tracking-widest",
                              formData.vehicle_category_id === String(cat.id) ? "text-amber-500/80" : "text-slate-400")}>
                              {cat.max_weight}KG
                            </span>
                         </div>
                         {cat.online_drivers_count > 0 && (
                            <div className={cn("flex items-center space-x-0.5 px-1 py-0.5 rounded-full",
                               formData.vehicle_category_id === String(cat.id) ? "bg-white/10" : "bg-emerald-500/10"
                            )}>
                               <div className="w-0.5 h-0.5 rounded-full bg-emerald-500 animate-pulse"></div>
                               <span className={cn("text-[6px] font-black uppercase tracking-widest",
                                  formData.vehicle_category_id === String(cat.id) ? "text-emerald-400" : "text-emerald-600"
                               )}>Live</span>
                            </div>
                         )}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Console: Summary & Authorization */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          <Card className="bg-slate-900 text-white overflow-hidden border-none shadow-xl rounded-[1.25rem] border-b-[6px] border-amber-500 relative">
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]"></div>

            <div className="bg-white/5 px-4 py-2.5 border-b border-white/5 flex items-center justify-between relative z-10">
               <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500">Logistics Manifest</span>
               <ShieldCheck size={12} className="text-amber-500 opacity-60" />
            </div>

            <CardContent className="p-5 space-y-6 relative z-10 text-center">
              <div className="space-y-1">
                <p className="text-slate-500 text-[7px] uppercase tracking-[0.3em] font-black">Estimated Freight</p>
                <div className="flex items-center justify-center">
                   <span className="text-lg font-black text-amber-500 mr-1.5 opacity-30">₹</span>
                   <span className="text-5xl font-black tracking-tighter tabular-nums text-white leading-none">
                     {estimate ? estimate.toFixed(0) : "0"}
                   </span>
                </div>
              </div>

              {/* Manifest Details */}
              <div className="bg-black/20 rounded-[0.75rem] p-4 space-y-3 border border-white/5">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <div className="flex items-center space-x-1">
                     <MapIcon size={8} className="text-slate-600" />
                     <span className="text-slate-500 font-black uppercase text-[7px] tracking-widest">Vector</span>
                  </div>
                  <div className="flex items-center space-x-1">
                     <span className="text-white font-black text-xs tabular-nums">{formData.distance_km || 0}</span>
                     <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">KM</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-1 text-slate-500">
                     <Truck size={8} className="text-slate-600" />
                     <span className="font-black uppercase text-[7px] tracking-widest">Asset</span>
                  </div>
                  <span className="text-amber-500 font-black uppercase text-[8px] tracking-tighter truncate max-w-[100px]">
                    {formData.vehicle_category_id ? categories.find(c => c.id === Number(formData.vehicle_category_id))?.name : "PENDING"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="w-1 h-1 rounded-full bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,1)]"></div>
                  <div className="flex flex-col items-start">
                     <span className="text-[8px] text-white font-black uppercase tracking-widest leading-none">Telemetry</span>
                     <span className="text-[6px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">OSRM Verified</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 bg-white/5 p-2 rounded-lg border border-white/5">
                  <div className="w-1 h-1 rounded-full bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,1)]"></div>
                  <div className="flex flex-col items-start">
                     <span className="text-[8px] text-white font-black uppercase tracking-widest leading-none">Safe Passage</span>
                     <span className="text-[6px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Insurance Active</span>
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <button
                  onClick={handleSubmit}
                  disabled={!estimate || isSubmitting}
                  className={cn(
                    "w-full h-12 rounded-[0.75rem] font-black text-base uppercase tracking-wider transition-all flex flex-col items-center justify-center shadow-lg group",
                    !estimate || isSubmitting
                      ? "bg-slate-800 text-slate-600 cursor-not-allowed"
                      : "bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-[1.01] active:scale-95 shadow-amber-500/10"
                  )}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : (
                    <>
                      <div className="flex items-center space-x-1.5">
                         <span>Launch Mission</span>
                         <PlaneTakeoff size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </div>
                      <span className="text-[6px] font-black opacity-40 tracking-[0.2em]">INITIALIZE GRID</span>
                    </>
                  )}
                </button>

                <div className="mt-4 flex flex-col items-center opacity-30">
                   <p className="text-[6px] text-slate-600 font-black uppercase tracking-[0.2em]">Authorized: Tranzo Grid Control</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Info Card - System Status */}
          <Card className="bg-white border-slate-100 shadow-lg p-4 rounded-[1rem] relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-0.5 h-full bg-amber-500"></div>
             <div className="flex items-start space-x-2.5">
                <div className="p-2 bg-slate-900 text-amber-500 rounded-lg shadow-md shrink-0">
                   <Activity size={12} />
                </div>
                <div className="space-y-0.5 min-w-0">
                   <h5 className="text-[9px] font-black text-slate-900 uppercase tracking-widest flex items-center">
                     Live Feedback
                     <span className="ml-1 w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                   </h5>
                   <p className="text-[7px] text-slate-500 font-medium uppercase tracking-tight leading-tight">
                     Vector tracking active. <br/>
                     <span className="font-black text-slate-400">Latency: 12ms</span>
                   </p>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
