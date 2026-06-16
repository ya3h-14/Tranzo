import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuthStore } from "@/store/authStore";
import { Truck, FileText, Upload, CheckCircle, Loader2 } from "lucide-react";
import { api } from "@/api/axios";

interface VehicleCategory {
  id: number;
  name: string;
}

export function DriverOnboarding() {
  const { updateUser } = useAuthStore();
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  const [vehicleCategoryId, setVehicleCategoryId] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [licenseDocument, setLicenseDocument] = useState<File | null>(null);
  const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Use the driver-accessible endpoint instead of the admin one
        const response = await api.get("/api/driver/categories/");
        setCategories(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error("Failed to load vehicle categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!licenseDocument || !insuranceDocument) {
      setError("Please upload both required documents.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("vehicle_category_id", vehicleCategoryId);
      formData.append("license_plate", licensePlate);
      formData.append("license_document", licenseDocument);
      formData.append("insurance_document", insuranceDocument);

      await api.patch("/api/driver/onboarding/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update local state to trigger the guard redirect
      updateUser({ status: "pending_verification" });
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit onboarding details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900">Complete Your Profile</h2>
          <p className="mt-2 text-slate-600">
            Upload your vehicle details and documents to start driving with Tranzo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Truck size={20} className="mr-2 text-slate-400" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vehicle Category
                </label>
                {isLoadingCategories ? (
                  <div className="flex items-center space-x-2 py-2 text-slate-400">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading categories...</span>
                  </div>
                ) : (
                  <select
                    className="w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2.5 border bg-white"
                    value={vehicleCategoryId}
                    onChange={(e) => setVehicleCategoryId(e.target.value)}
                    required
                  >
                    <option value="" disabled>Select your vehicle type</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <Input
                label="License Plate Number"
                type="text"
                placeholder="e.g. MH 12 AB 1234"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                required
              />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText size={20} className="mr-2 text-slate-400" />
                Required Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept="image/*,.pdf"
                  onChange={(e) => setLicenseDocument(e.target.files?.[0] || null)}
                />
                {licenseDocument ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle size={24} className="text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-emerald-700">{licenseDocument.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-900">Upload Driver's License</p>
                    <p className="text-xs text-slate-500 mt-1">Front and back (JPG, PNG or PDF)</p>
                  </>
                )}
              </div>

              <div className="relative border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <input 
                  type="file" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  accept="image/*,.pdf"
                  onChange={(e) => setInsuranceDocument(e.target.files?.[0] || null)}
                />
                {insuranceDocument ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle size={24} className="text-emerald-500 mb-2" />
                    <p className="text-sm font-medium text-emerald-700">{insuranceDocument.name}</p>
                  </div>
                ) : (
                  <>
                    <Upload size={24} className="mx-auto text-slate-400 mb-2" />
                    <p className="text-sm font-medium text-slate-900">Upload Vehicle Insurance</p>
                    <p className="text-xs text-slate-500 mt-1">Valid insurance certificate (JPG, PNG or PDF)</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            Submit for Verification
          </Button>
        </form>
      </div>
    </div>
  );
}
