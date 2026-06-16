import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/store/authStore";
import { Clock, CheckCircle, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function DriverPendingVerification() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();

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
              <Clock size={40} className="text-amber-600" />
            </div>
            
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Application Pending</h2>
              <p className="mt-2 text-slate-600">
                Your documents have been submitted successfully and are currently under review by our team.
              </p>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 text-left space-y-3">
              <div className="flex items-center text-sm">
                <CheckCircle size={16} className="text-emerald-500 mr-2" />
                <span className="text-slate-700">Account Created</span>
              </div>
              <div className="flex items-center text-sm">
                <CheckCircle size={16} className="text-emerald-500 mr-2" />
                <span className="text-slate-700">Documents Uploaded</span>
              </div>
              <div className="flex items-center text-sm font-medium">
                <Clock size={16} className="text-amber-500 mr-2" />
                <span className="text-slate-900">Admin Verification (24-48 hrs)</span>
              </div>
            </div>

            <p className="text-sm text-slate-500">
              We'll notify you via email once your account is approved and you can start driving.
            </p>

            <Button variant="outline" className="w-full mt-6" onClick={handleLogout}>
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
