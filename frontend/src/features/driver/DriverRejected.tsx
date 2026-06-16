import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { XCircle, AlertTriangle, RefreshCcw, LogOut, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { api } from "@/api/axios";

export function DriverRejected() {
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

  const handleReapply = async () => {
    try {
      await api.post("/api/driver/reapply/");
      await fetchLatestStatus();
    } catch (error) {
      console.error("Failed to re-apply:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <Card className="shadow-lg border-0">
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <XCircle size={40} className="text-red-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">Application Rejected</h2>
              <p className="mt-2 text-slate-600">
                We regret to inform you that your application to become a driver partner has been rejected at this time.
              </p>
            </div>

            <div className="bg-red-50 rounded-lg p-4 text-left border border-red-100">
              <div className="flex items-start">
                <AlertTriangle size={18} className="text-red-500 mr-2 mt-0.5" />
                <div>
                   <p className="text-sm font-medium text-red-800">Reason for Rejection</p>
                   <p className="text-xs text-red-700 mt-1 italic">
                     "{user?.status_reason || "Invalid documents or eligibility criteria not met."}"
                   </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button className="w-full bg-slate-900 hover:bg-slate-800 flex items-center justify-center" onClick={handleReapply}>
                <RefreshCcw size={16} className="mr-2" />
                Correct Details & Re-apply
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="flex items-center justify-center" onClick={fetchLatestStatus} disabled={isRefreshing}>
                  {isRefreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} className="mr-2" />}
                  Check Status
                </Button>
                <Button variant="outline" className="flex items-center justify-center text-red-600 border-red-100 hover:bg-red-50" onClick={handleLogout}>
                  <LogOut size={16} className="mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
