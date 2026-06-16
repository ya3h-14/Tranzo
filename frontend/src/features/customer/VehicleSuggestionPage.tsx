import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Truck, Clock, IndianRupee, Info } from "lucide-react";
import { cn } from "@/utils/cn";
import { useOrderStore } from "@/store/orderStore";

const vehicles = [
  {
    id: "bike",
    name: "Bike",
    capacity: "Up to 20 kg",
    time: "5-10 mins",
    basePrice: 20,
    pricePerKm: 5,
    icon: <Truck size={32} className="text-indigo-500" />,
  },
  {
    id: "mini_truck",
    name: "Mini Truck",
    capacity: "Up to 500 kg",
    time: "10-20 mins",
    basePrice: 150,
    pricePerKm: 15,
    icon: <Truck size={40} className="text-indigo-600" />,
  },
  {
    id: "large_truck",
    name: "Large Truck",
    capacity: "Up to 2000 kg",
    time: "20-30 mins",
    basePrice: 500,
    pricePerKm: 30,
    icon: <Truck size={48} className="text-indigo-700" />,
  },
];

export function VehicleSuggestionPage() {
  const navigate = useNavigate();
  const { bookingData, setBookingData } = useOrderStore();
  const [selected, setSelected] = useState<string | null>(bookingData.vehicleType || null);

  // Mock distance for demo purposes if not provided
  const distance = 12.5;

  const calculatePrice = (base: number, perKm: number) => {
    return base + (perKm * distance);
  };

  const handleContinue = () => {
    if (selected) {
      const vehicle = vehicles.find(v => v.id === selected);
      if (vehicle) {
        setBookingData({
          vehicleType: selected,
          price: calculatePrice(vehicle.basePrice, vehicle.pricePerKm),
          distance: distance
        });
        navigate("/customer/confirm");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="p-2">
          &larr; Back
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Select Vehicle</h1>
      </div>

      <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-start space-x-3">
        <Info className="text-indigo-600 mt-0.5" size={20} />
        <div>
          <h3 className="text-sm font-medium text-indigo-900">Vehicle Recommendation</h3>
          <p className="text-xs text-indigo-700 mt-1">
            Based on {bookingData.weight}kg weight and estimated {distance}km distance.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {vehicles.map((v) => {
          const price = calculatePrice(v.basePrice, v.pricePerKm);
          return (
            <Card
              key={v.id}
              className={cn(
                "cursor-pointer transition-all border-2",
                selected === v.id ? "border-indigo-600 bg-indigo-50/30 shadow-md" : "border-transparent hover:border-slate-300"
              )}
              onClick={() => setSelected(v.id)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center">
                    {v.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-slate-900">{v.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 mt-1 flex items-center">
                      <Clock size={14} className="mr-1" /> {v.time} away
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Capacity: {v.capacity}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-slate-900 flex items-center justify-end">
                    <IndianRupee size={18} />
                    {price.toFixed(0)}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 md:static md:bg-transparent md:border-none md:p-0 z-40 pb-safe">
        <Button
          size="lg"
          className="w-full max-w-2xl mx-auto"
          disabled={!selected}
          onClick={handleContinue}
        >
          Continue to Confirmation
        </Button>
      </div>
    </div>
  );
}
