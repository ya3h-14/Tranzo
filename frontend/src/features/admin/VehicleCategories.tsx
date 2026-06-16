import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Loader2, Plus, Edit2, Truck, X, Info, Settings2, Gauge, Scale, MapPin, ChevronRight } from "lucide-react";
import { api } from "@/api/axios";
import { cn } from "@/utils/cn";

interface VehicleCategory {
  id: number;
  name: string;
  code: string;
  base_price: string;
  price_per_km: string;
  base_distance: string;
  max_weight: number;
  is_active: boolean;
  description: string;
}

export function VehicleCategories() {
  const [categories, setCategories] = useState<VehicleCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VehicleCategory | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    base_price: "0",
    price_per_km: "0",
    base_distance: "2",
    max_weight: 500,
    description: "",
    is_active: true
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/api/admin/vehicles/");
      setCategories(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.patch(`/api/admin/vehicles/${editingCategory.id}/`, formData);
      } else {
        await api.post("/api/admin/vehicles/", formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
    }
  };

  const handleEdit = (category: VehicleCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      code: category.code,
      base_price: category.base_price,
      price_per_km: category.price_per_km,
      base_distance: category.base_distance,
      max_weight: category.max_weight,
      description: category.description || "",
      is_active: category.is_active
    });
    setShowModal(true);
  };

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 px-4 py-6 animate-in fade-in duration-500">
      {/* Refined Compact Header */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0F172A] px-8 py-8 text-white shadow-lg">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#F59E0B 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute top-0 right-0 h-full w-1/4 bg-gradient-to-l from-amber-500/10 to-transparent" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest">
              <Settings2 size={12} />
              Fleet Setup
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase">
                Vehicle <span className="text-amber-500">Classes</span>
              </h1>
              <p className="text-slate-400 text-xs font-medium">Manage industrial fleet pricing and load specs.</p>
            </div>
          </div>

          <button
            onClick={() => { setEditingCategory(null); setFormData({ name: "", code: "", base_price: "0", price_per_km: "0", base_distance: "2", max_weight: 500, description: "", is_active: true }); setShowModal(true); }}
            className="h-11 px-6 bg-amber-500 hover:bg-amber-600 text-[#0F172A] rounded-xl font-black text-[11px] uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={16} strokeWidth={3} />
            Add New Class
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center py-32 space-y-3">
           <Loader2 className="animate-spin text-amber-500" size={32} />
           <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Syncing Fleet...</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <Card key={category.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl bg-white border border-slate-200/60 ring-1 ring-slate-200/40">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-amber-500 border border-slate-800 shadow-sm transition-transform group-hover:scale-105">
                    <Truck size={20} strokeWidth={2.5} />
                  </div>
                  <Badge variant={category.is_active ? "success" : "default"} className="px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest border">
                    {category.is_active ? "Active" : "Offline"}
                  </Badge>
                </div>

                <div className="space-y-0.5 mb-5">
                  <h3 className="text-[15px] font-black text-[#0F172A] truncate">
                    {category.name}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{category.code}</p>
                </div>

                {/* Pricing - More Compact */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 group-hover:bg-amber-50/40 transition-colors">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Base</span>
                    <p className="text-[15px] font-black text-[#0F172A]">₹{category.base_price}</p>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-100 group-hover:bg-amber-50/40 transition-colors">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider mb-1">Per KM</span>
                    <p className="text-[15px] font-black text-[#0F172A]">₹{category.price_per_km}</p>
                  </div>
                </div>

                {/* Specs - More Compact */}
                <div className="space-y-2 py-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1.5 opacity-70">
                      <Gauge size={12} className="text-slate-400" /> Incl. Dist
                    </span>
                    <span className="text-[#0F172A] font-black">{category.base_distance} KM</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                    <span className="flex items-center gap-1.5 opacity-70">
                      <Scale size={12} className="text-slate-400" /> Max Load
                    </span>
                    <span className="text-[#0F172A] font-black">{category.max_weight} KG</span>
                  </div>
                </div>

                <button
                  onClick={() => handleEdit(category)}
                  className="w-full mt-4 flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-100 hover:border-[#0F172A] hover:bg-[#0F172A] hover:text-white transition-all text-[10px] font-black uppercase tracking-widest text-slate-400 group/btn"
                >
                  Edit Rates
                  <ChevronRight size={12} className="transition-transform group-hover/btn:translate-x-0.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Industrial Configuration Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0F172A]/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-500 border border-white/10">
            <div className="relative px-8 py-8 bg-[#0F172A] text-white">
              <div className="relative flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-500">
                    <Truck size={14} strokeWidth={3} />
                    <span className="text-[9px] font-black uppercase tracking-widest">Setup Console</span>
                  </div>
                  <h3 className="text-xl font-black tracking-tight">
                    {editingCategory ? "Update Specs" : "New Vehicle"}
                  </h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                  <X size={20} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Name</label>
                  <input className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold focus:border-amber-500 bg-slate-50 transition-all" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Tata Ace" required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Code</label>
                  <input className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold focus:border-amber-500 bg-slate-50 disabled:opacity-50" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} placeholder="tata_ace" required disabled={!!editingCategory} />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Base ₹</label>
                  <input type="number" className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold focus:border-amber-500 bg-slate-50" value={formData.base_price} onChange={(e) => setFormData({...formData, base_price: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">KM ₹</label>
                  <input type="number" className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold focus:border-amber-500 bg-slate-50" value={formData.price_per_km} onChange={(e) => setFormData({...formData, price_per_km: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Incl. KM</label>
                  <input type="number" className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold focus:border-amber-500 bg-slate-50" value={formData.base_distance} onChange={(e) => setFormData({...formData, base_distance: e.target.value})} required />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Max Payload (KG)</label>
                <input type="number" className="w-full rounded-xl border border-slate-200 p-3 text-sm font-bold focus:border-amber-500 bg-slate-50" value={formData.max_weight} onChange={(e) => setFormData({...formData, max_weight: Number(e.target.value)})} required />
              </div>

              <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100 cursor-pointer">
                <input type="checkbox" id="is_active_v" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 rounded border-slate-300 text-amber-500" />
                <label htmlFor="is_active_v" className="text-[10px] font-bold text-slate-600 cursor-pointer">Operational status active</label>
              </div>

              <div className="flex gap-3 pt-3">
                <button type="button" className="flex-1 h-12 bg-slate-100 text-[#0F172A] rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="flex-1 h-12 bg-amber-500 hover:bg-amber-600 text-[#0F172A] rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-amber-500/10">Save Specs</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
