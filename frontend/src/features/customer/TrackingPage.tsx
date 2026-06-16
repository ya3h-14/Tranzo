import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Phone, MessageCircle, Star, CheckCircle2, Clock, Truck, Loader2, Package, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { MapView } from "@/components/map/MapView";
import { api } from "@/api/axios";

interface OrderDetails {
  id: number;
  pickup_address: string;
  pickup_lat: string;
  pickup_lng: string;
  dropoff_address: string;
  dropoff_lat: string;
  dropoff_lng: string;
  goods_type: string;
  vehicle_category_details: {
    name: string;
  };
  status: string;
  price: string;
  distance_km: string;
  created_at: string;
  driver_details: {
    name: string;
    email: string;
    phone_number: string;
    id: number;
  } | null;
}

export function TrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/api/customer/orders/${id}/`);
      setOrder(response.data);
    } catch (error) {
      console.error("Failed to fetch order:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
      const interval = setInterval(fetchOrder, 10000);
      return () => clearInterval(interval);
    }
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  if (!order) return (
    <div className="text-center py-20">
      <p className="text-slate-500">Order not found.</p>
      <Button onClick={() => navigate("/customer")} className="mt-4">Back Home</Button>
    </div>
  );

  const statusSteps = [
    { id: "pending", label: "Searching Driver", icon: <Clock size={16} /> },
    { id: "accepted", label: "Driver Assigned", icon: <CheckCircle2 size={16} /> },
    { id: "picked_up", label: "Package Picked Up", icon: <Package size={16} /> },
    { id: "in_transit", label: "In Transit", icon: <Truck size={16} /> },
    { id: "delivered", label: "Delivered", icon: <CheckCircle2 size={16} /> },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.id === order.status);

  const pickup = { lat: parseFloat(order.pickup_lat), lng: parseFloat(order.pickup_lng), label: order.pickup_address };
  const drop = { lat: parseFloat(order.dropoff_lat), lng: parseFloat(order.dropoff_lng), label: order.dropoff_address };

  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/customer/orders")} className="p-2">
            &larr; My Orders
          </Button>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Track Order #{id}</h1>
        </div>
        <Badge variant={
          order.status === "delivered" ? "success" :
          order.status === "cancelled" ? "danger" :
          (order.status === "pending" ? "warning" : "info")
        } className="px-4 py-1">
          {order.status.replace("_", " ").toUpperCase()}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="h-[400px] md:h-[500px] rounded-3xl overflow-hidden shadow-xl border border-slate-200 z-0">
            <MapView
              pickup={pickup}
              drop={drop}
              showRoute={true}
              className="h-full w-full"
            />
          </div>

          <Card className="shadow-sm border-0 bg-white">
            <CardHeader className="pb-2 border-b border-slate-50">
              <CardTitle className="text-lg">Delivery Timeline</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="relative pl-8 space-y-8">
                <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-100" />
                {statusSteps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;
                  return (
                    <div key={step.id} className="relative flex items-center group">
                      <div
                        className={`absolute -left-8 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors ${
                          isCompleted ? "bg-indigo-600 text-white shadow-md" : "bg-white border-2 border-slate-200 text-slate-300"
                        }`}
                      >
                        {isCompleted && !isCurrent ? <CheckCircle2 size={16} /> : step.icon}
                      </div>
                      <div className="ml-4">
                        <p className={`font-bold text-sm ${isCompleted ? "text-slate-900" : "text-slate-400"}`}>
                          {step.label}
                        </p>
                        {isCurrent && <p className="text-[10px] text-indigo-600 font-bold uppercase animate-pulse">Live Update</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {order.driver_details ? (
            <Card className="shadow-lg border-2 border-indigo-50 overflow-hidden rounded-3xl">
              <div className="bg-indigo-600 p-6 text-white text-center">
                <p className="text-xs font-medium text-indigo-100 uppercase tracking-widest mb-2">Assigned Partner</p>
                <div className="flex flex-col items-center">
                  <Avatar src={`https://i.pravatar.cc/150?u=${order.driver_details.id}`} size="lg" className="border-2 border-white/20 mb-3" />
                  <h3 className="text-xl font-black">{order.driver_details.name}</h3>
                </div>
              </div>
              <CardContent className="p-6 space-y-6 text-center">
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center text-amber-500 bg-amber-50 px-3 py-1 rounded-full">
                    <Star size={14} className="fill-current mr-1" />
                    <span className="font-black text-sm">4.9</span>
                  </div>
                  <Badge variant="success" className="bg-emerald-50 text-emerald-700">Verified Partner</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="w-full flex items-center justify-center h-12 rounded-xl" onClick={() => window.location.href = `tel:${order.driver_details?.phone_number}`}>
                    <Phone size={18} className="mr-2" /> Call
                  </Button>
                  <Button variant="outline" className="w-full flex items-center justify-center h-12 rounded-xl">
                    <MessageCircle size={18} className="mr-2" /> Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-slate-50 border-dashed border-2 rounded-3xl">
              <CardContent className="p-10 text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <Loader2 className="animate-spin text-indigo-600" size={28} />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-lg uppercase tracking-tight">Searching Partner</p>
                  <p className="text-xs text-slate-500 mt-2 px-4 leading-relaxed">Matching your shipment with verified {order.vehicle_category_details.name} partners nearby.</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm bg-slate-900 text-white rounded-3xl border-0">
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-white/50 text-xs font-black uppercase tracking-widest">Bill Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Distance</span>
                <span className="font-bold">{order.distance_km} KM</span>
              </div>
              <div className="flex justify-between items-center pt-4 border-t border-white/5">
                <span className="text-slate-400">Paid Amount</span>
                <span className="text-3xl font-black text-indigo-400">₹{parseFloat(order.price).toFixed(0)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
