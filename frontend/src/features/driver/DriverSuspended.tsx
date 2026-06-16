import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { Ban, AlertCircle, RefreshCcw, LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/axios";

export function DriverSuspended() {
  const { user, logout, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLatestStatus = async () => {
    setIsRefreshing(true);
    try {
      const response = await api.get("/api/auth/me/");
      updateUser(response.data);
    } catch (error) {
      console.error("Failed to refresh status:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLatestStatus();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
              <Ban size={40} className="text-amber-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">Account Suspended</h2>
              <p className="mt-2 text-slate-600">
                Your driver account has been temporarily suspended.
              </p>
            </div>

            <div className="bg-amber-50 rounded-lg p-4 text-left border border-amber-100">
              <div className="flex items-start">
                <AlertCircle size={18} className="text-amber-500 mr-2 mt-0.5" />
                <div>
                   <p className="text-sm font-medium text-amber-800">Reason for Suspension</p>
                   <p className="text-xs text-amber-700 mt-1 italic">
                     "{user?.status_reason || "No specific reason provided by administrator."}"
                   </p>
                </div>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              Please contact the administration office or support to resolve this issue and reactivate your account.
            </p>

            <div className="grid grid-cols-2 gap-3 pt-4">
              <Button variant="outline" className="flex items-center justify-center" onClick={fetchLatestStatus} disabled={isRefreshing}>
                {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} className="mr-2" />}
                Check Status
              </Button>
              <Button variant="outline" className="flex items-center justify-center text-red-600 border-red-100 hover:bg-red-50" onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
