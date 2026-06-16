import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  MapPin,
  Navigation,
  Calendar,
  Package,
  Loader2,
  Search,
  ChevronRight,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  IndianRupee,
  Activity,
  Box,
  Hash
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

export function OrderHistoryPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/api/customer/orders/");
        setOrders(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return {
          label: "Completed",
          variant: "success" as const,
          icon: <CheckCircle2 size={10} className="mr-1" />,
          bgColor: "bg-emerald-500/10",
          textColor: "text-emerald-600"
        };
      case "pending":
        return {
          label: "Pending",
          variant: "warning" as const,
          icon: <Clock size={10} className="mr-1" />,
          bgColor: "bg-amber-500/10",
          textColor: "text-amber-600"
        };
      case "cancelled":
        return {
          label: "Cancelled",
          variant: "danger" as const,
          icon: <AlertCircle size={10} className="mr-1" />,
          bgColor: "bg-red-500/10",
          textColor: "text-red-600"
        };
      default:
        return {
          label: "Active",
          variant: "info" as const,
          icon: <Activity size={10} className="mr-1 animate-pulse" />,
          bgColor: "bg-blue-500/10",
          textColor: "text-blue-600"
        };
    }
  };

  const filteredOrders = orders.filter((order) => {
    let matchesTab = true;
    if (activeTab === "pending") matchesTab = order.status === "pending";
    else if (activeTab === "active") matchesTab = ["accepted", "picked_up", "in_transit"].includes(order.status);
    else if (activeTab === "completed") matchesTab = order.status === "delivered";

    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      order.pickup_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.dropoff_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.goods_type.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const tabs = [
    { id: "all", label: "All" },
    { id: "pending", label: "Pending" },
    { id: "active", label: "Active" },
    { id: "completed", label: "Completed" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-4 px-4 pb-12 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center space-x-1.5 text-[8px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Hash size={8} className="text-amber-500" />
            <span>Operational Log</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">My Orders</h1>
        </div>

        <div className="relative group w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-amber-500 transition-colors" />
          <input
            type="text"
            placeholder="Search Registry..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-900 focus:outline-none focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-md"
                : "text-slate-500 hover:text-slate-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="animate-spin text-amber-500" size={24} />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">Accessing Grid...</span>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => {
            const status = getStatusConfig(order.status);
            return (
              <Card
                key={order.id}
                className="group relative border border-slate-100 hover:border-amber-100 bg-white transition-all cursor-pointer overflow-hidden rounded-xl hover:shadow-xl hover:shadow-slate-200/30"
                onClick={() => navigate(`/customer/tracking/${order.id}`)}
              >
                {/* Thin Status Strip */}
                <div className={cn("absolute left-0 top-0 bottom-0 w-1 transition-all", status.bgColor.replace("/10", ""))} />

                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Left: Manifest Info */}
                    <div className="flex-1 p-4 md:p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={cn("p-2 rounded-lg shrink-0", status.bgColor)}>
                             <Box size={14} className={status.textColor} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                               <span className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">Manifest</span>
                               <span className="text-[7px] font-black text-amber-600">ID-{order.id}</span>
                            </div>
                            <h3 className="text-sm font-black tracking-tight text-slate-900 uppercase">
                              {order.goods_type}
                            </h3>
                          </div>
                        </div>
                        <div className="md:hidden">
                           <Badge variant={status.variant} className="rounded-md px-1.5 py-0.5 text-[7px] font-black">
                              {status.label}
                           </Badge>
                        </div>
                      </div>

                      {/* Destinations */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                         <div className="flex items-start space-x-3 min-w-0">
                            <MapPin size={12} className="text-emerald-500 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                               <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Source</span>
                               <p className="text-[10px] font-bold text-slate-600 truncate">{order.pickup_address}</p>
                            </div>
                         </div>
                         <div className="flex items-start space-x-3 min-w-0">
                            <Navigation size={12} className="text-indigo-500 shrink-0 mt-0.5" />
                            <div className="min-w-0">
                               <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Destination</span>
                               <p className="text-[10px] font-bold text-slate-600 truncate">{order.dropoff_address}</p>
                            </div>
                         </div>
                      </div>
                    </div>

                    {/* Right: Metrics Panel */}
                    <div className="md:w-56 bg-slate-50/50 md:border-l border-slate-100 p-4 md:px-6 md:py-4 flex flex-col justify-between gap-4">
                       <div className="flex flex-col space-y-3">
                          <div className="flex justify-between items-start">
                             <div className="space-y-0.5">
                                <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Asset</span>
                                <div className="flex items-center space-x-1.5">
                                   <Truck size={10} className="text-slate-400" />
                                   <span className="text-[9px] font-black uppercase text-slate-700">{order.vehicle_category_details?.name || "..."}</span>
                                </div>
                             </div>
                             <div className="hidden md:block">
                                <Badge variant={status.variant} className="rounded-md px-1.5 py-0.5 text-[7px] font-black">
                                   {status.label}
                                </Badge>
                             </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                             <div>
                                <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Cost</span>
                                <div className="flex items-baseline font-black">
                                   <span className="text-[8px] text-amber-500 mr-0.5">₹</span>
                                   <span className="text-sm text-slate-900 tabular-nums">{parseFloat(order.price).toFixed(0)}</span>
                                </div>
                             </div>
                             <div className="text-right">
                                <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">Vector</span>
                                <p className="text-[9px] font-black text-slate-700">{order.distance_km} <span className="text-[7px] text-slate-400">KM</span></p>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center space-x-1 text-slate-400">
                             <Calendar size={10} />
                             <span className="text-[8px] font-bold">{new Date(order.created_at).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}</span>
                          </div>
                          <div className="p-1 bg-slate-900 text-white rounded md:opacity-0 md:group-hover:opacity-100 transition-all">
                             <ArrowUpRight size={12} />
                          </div>
                       </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-16 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <Package size={24} className="mx-auto text-slate-300 mb-2" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registry Empty</p>
          </div>
        )}
      </div>
    </div>
  );
}
