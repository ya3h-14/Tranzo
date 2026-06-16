import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MapPin, Navigation, Package, Weight, Truck, IndianRupee } from "lucide-react";
import { api } from "@/api/axios";
import { useOrderStore } from "@/store/orderStore";

export function BookingConfirmationPage() {
  const navigate = useNavigate();
  const { bookingData, resetBookingData } = useOrderStore();
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState("");

  if (!bookingData.pickup || !bookingData.vehicleType) {
    navigate("/customer/book");
    return null;
  }

  const handleConfirm = async () => {
    setIsConfirming(true);
    setError("");
    try {
      const payload = {
        pickup_address: bookingData.pickup,
        dropoff_address: bookingData.drop,
        package_details: `${bookingData.goodsType} - ${bookingData.weight}kg. ${bookingData.description}`,
        vehicle_requested: bookingData.vehicleType,
        price: bookingData.price,
        distance_km: bookingData.distance
      };
      
      const response = await api.post("/api/customer/orders/", payload);
      resetBookingData();
      navigate(`/customer/tracking/${response.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create order. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2">
          &larr; Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Confirm Booking</h1>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Delivery Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <MapPin size={20} className="text-emerald-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900">Pickup</p>
                <p className="text-sm text-slate-500">{bookingData.pickup}</p>
              </div>
            </div>
            <div className="h-4 border-l-2 border-dashed border-slate-300 ml-2.5 -my-2"></div>
            <div className="flex items-start space-x-3">
              <Navigation size={20} className="text-red-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-slate-900">Drop</p>
                <p className="text-sm text-slate-500">{bookingData.drop}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4">
            <div className="flex items-center space-x-2">
              <Package size={16} className="text-slate-400" />
              <span className="text-sm text-slate-600 capitalize">{bookingData.goodsType}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Weight size={16} className="text-slate-400" />
              <span className="text-sm text-slate-600">{bookingData.weight} kg</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck size={16} className="text-slate-400" />
              <span className="text-sm text-slate-600 capitalize">{bookingData.vehicleType.replace('_', ' ')}</span>
            </div>
            <div className="flex items-center space-x-2 font-medium text-slate-900">
              <IndianRupee size={16} className="text-slate-400" />
              <span>₹{bookingData.price?.toFixed(2)}</span>
            </div>
          </div>

          {bookingData.description && (
             <div className="pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-500 uppercase font-bold tracking-wider">Instructions</p>
                <p className="text-sm text-slate-600 mt-1">{bookingData.description}</p>
             </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Button
        size="lg"
        className="w-full"
        onClick={handleConfirm}
        isLoading={isConfirming}
        disabled={isConfirming}
      >
        {isConfirming ? "Confirming..." : "Confirm Booking"}
      </Button>
    </div>
  );
}
