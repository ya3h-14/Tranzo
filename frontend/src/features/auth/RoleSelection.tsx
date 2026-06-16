import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { useAuthStore } from "@/store/authStore";
import { User, Truck, Shield, ArrowRight } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";

export function RoleSelection() {
  const navigate = useNavigate();
  const { user, role } = useAuthStore();

  useEffect(() => {
    if (user && role) {
      navigate(`/${role}`, { replace: true });
    }
  }, [user, role, navigate]);

  return (
    <AuthLayout title="Choose Portal" subtitle="Select your gateway to Tranzo">
      <div className="space-y-4">
        <Link to="/auth/customer/login" className="block group">
          <Card className="shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-amber-500 cursor-pointer overflow-hidden">
            <CardContent className="p-0 flex items-stretch">
              <div className="w-24 bg-slate-900 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors">
                <User size={32} />
              </div>
              <div className="flex-1 p-6 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Customer</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Book & Track Shipments</p>
                </div>
                <ArrowRight className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/auth/driver/login" className="block group">
          <Card className="shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-amber-500 cursor-pointer overflow-hidden">
            <CardContent className="p-0 flex items-stretch">
              <div className="w-24 bg-slate-900 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-slate-900 transition-colors">
                <Truck size={32} />
              </div>
              <div className="flex-1 p-6 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Driver Partner</h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Fleet & Earning Control</p>
                </div>
                <ArrowRight className="text-slate-300 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/auth/admin/login" className="block group">
          <Card className="shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-slate-900 cursor-pointer overflow-hidden">
            <CardContent className="p-0 flex items-stretch">
              <div className="w-24 bg-slate-900 flex items-center justify-center text-slate-400 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                <Shield size={32} />
              </div>
              <div className="flex-1 p-6 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter text-opacity-50">Admin</h3>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Operations Management</p>
                </div>
                <ArrowRight className="text-slate-200 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </AuthLayout>
  );
}
