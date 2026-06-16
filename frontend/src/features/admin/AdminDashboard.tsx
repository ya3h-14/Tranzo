import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Package, Truck, Users, Activity, IndianRupee, Loader2,
  TrendingUp, TrendingDown, ArrowUpRight, Clock, MapPin,
  ShieldCheck, Zap, BarChart3, Globe, ExternalLink,
  Coins, ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { api } from "@/api/axios";
import { WeatherWidget } from "@/components/ui/WeatherWidget";
import { cn } from "@/utils/cn";

interface AdminStats {
  total_revenue: number;
  platform_earnings: number;
  active_drivers: number;
  active_orders: number;
  total_customers: number;
}

// Mock data for the custom SVG chart
const chartPoints = [
  { label: '06:00', value: 30 },
  { label: '09:00', value: 55 },
  { label: '12:00', value: 85 },
  { label: '15:00', value: 70 },
  { label: '18:00', value: 95 },
  { label: '21:00', value: 60 },
  { label: '00:00', value: 40 },
];

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/api/admin/stats/");
        setStats(response.data);
      } catch (error) {
        console.error("Failed to fetch admin stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="animate-spin text-amber-500" size={40} />
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Synchronizing Fleet Systems...</span>
      </div>
    );
  }

  const statCards = [
    {
      label: "Gross GMV",
      value: `₹${Number(stats?.total_revenue || 0).toLocaleString()}`,
      icon: <IndianRupee size={18} />,
      color: "slate",
      trend: "Operational",
      isPositive: true
    },
    {
      label: "Platform Revenue",
      value: `₹${Number(stats?.platform_earnings || 0).toLocaleString()}`,
      icon: <Coins size={18} />,
      color: "amber",
      trend: "5% Take Rate",
      isPositive: true
    },
    {
      label: "Active Orders",
      value: stats?.active_orders || 0,
      icon: <Package size={18} />,
      color: "emerald",
      trend: "Live",
      isPositive: true
    },
    {
      label: "Online Drivers",
      value: stats?.active_drivers || 0,
      icon: <Truck size={18} />,
      color: "blue",
      trend: "Active",
      isPositive: true
    },
  ];

  // Simple SVG Path generator for the Area Chart
  const generatePath = (points: {value: number}[], height: number, width: number) => {
    const step = width / (points.length - 1);
    const mappedPoints = points.map((p, i) => ({
      x: i * step,
      y: height - (p.value / 100) * height
    }));

    let d = `M ${mappedPoints[0].x} ${mappedPoints[0].y}`;
    for (let i = 1; i < mappedPoints.length; i++) {
      const prev = mappedPoints[i-1];
      const curr = mappedPoints[i];
      const cx = (prev.x + curr.x) / 2;
      d += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    const fill = `${d} L ${width} ${height} L 0 ${height} Z`;
    return { line: d, fill };
  };

  const { line, fill } = generatePath(chartPoints, 200, 800);

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 pb-20 animate-in fade-in duration-700">

      {/* Dynamic Operational Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
            <Zap size={10} className="text-amber-500 fill-amber-500" />
            <span>Admin Command Center</span>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <span className="text-emerald-500">Systems Nominal</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Dashboard</h1>
        </div>

        <div className="flex items-center gap-4 bg-slate-900 px-6 py-4 rounded-[1.5rem] shadow-2xl shadow-slate-900/20">
          <WeatherWidget />
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="group border border-slate-100 hover:border-amber-200 bg-white transition-all overflow-hidden rounded-[1.5rem] shadow-lg shadow-slate-200/40">
            <CardContent className="p-6 relative">
              <div className="flex justify-between items-start mb-4">
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-all shadow-inner",
                  stat.color === 'amber' ? "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white" :
                  stat.color === 'emerald' ? "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white" :
                  stat.color === 'blue' ? "bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white" :
                  "bg-slate-50 text-slate-600 group-hover:bg-slate-900 group-hover:text-white"
                )}>
                  {stat.icon}
                </div>
                <div className={cn(
                  "flex items-center space-x-1 text-[10px] font-black uppercase tracking-widest",
                  stat.isPositive ? "text-emerald-500" : "text-rose-500"
                )}>
                  {stat.trend === "Live" ? (
                    <div className="flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span>Live Feed</span>
                    </div>
                  ) : (
                    <>
                      {stat.isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      <span>{stat.trend}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">{stat.label}</p>
                <div className="flex items-baseline space-x-1.5">
                  <h3 className="text-3xl font-black text-slate-900 tabular-nums tracking-tighter">
                    {stat.value}
                  </h3>
                </div>
              </div>

              {/* Background Accent */}
              <div className="absolute -bottom-2 -right-2 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                 {React.cloneElement(stat.icon as React.ReactElement, { size: 80 })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Dashboard Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">

        {/* Real-time System Status - CUSTOM SVG CHART */}
        <Card className="lg:col-span-2 border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
           <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                 <div className="w-1 h-5 bg-amber-500 rounded-full"></div>
                 <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Global Operations Log</h2>
              </div>
              <div className="flex items-center space-x-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                 <Globe size={12} />
                 <span>All Zones Active</span>
              </div>
           </div>
           <CardContent className="p-8">
              <div className="relative h-[240px] w-full pt-4">
                <svg viewBox="0 0 800 200" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" style={{stopColor:'#F59E0B', stopOpacity:0.2}} />
                      <stop offset="100%" style={{stopColor:'#F59E0B', stopOpacity:0}} />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  {[0, 50, 100, 150, 200].map(y => (
                    <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                  ))}
                  {/* Area */}
                  <path d={fill} fill="url(#grad)" />
                  {/* Line */}
                  <path d={line} fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Data Points */}
                  {chartPoints.map((p, i) => {
                    const step = 800 / (chartPoints.length - 1);
                    const x = i * step;
                    const y = 200 - (p.value / 100) * 200;
                    return (
                      <g key={i} className="group/dot">
                        <circle cx={x} cy={y} r="6" fill="#fff" stroke="#F59E0B" strokeWidth="3" className="transition-all duration-300 group-hover/dot:r-8" />
                        <text x={x} y={y - 15} textAnchor="middle" className="text-[10px] font-black fill-slate-900 opacity-0 group-hover/dot:opacity-100 transition-opacity">
                          {p.value}%
                        </text>
                      </g>
                    );
                  })}
                </svg>
                {/* Labels */}
                <div className="flex justify-between mt-4">
                  {chartPoints.map((p, i) => (
                    <span key={i} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.label}</span>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                 <div className="flex items-center space-x-6">
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Peak Traffic</span>
                       <span className="text-sm font-black text-slate-900">18:00 HRS</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Avg. Load</span>
                       <span className="text-sm font-black text-slate-900">₹12,450.00</span>
                    </div>
                 </div>
                 <button className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 transition-all flex items-center group">
                    Full Analytics <ExternalLink size={12} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 </button>
              </div>
           </CardContent>
        </Card>

        {/* Quick Access Sidebar */}
        <div className="space-y-6">
           <Card className="border border-slate-100 shadow-xl shadow-slate-200/40 rounded-[2rem] overflow-hidden bg-white">
              <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/50">
                 <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center">
                    <ShieldCheck size={14} className="mr-2 text-emerald-500" /> System Control
                 </h2>
              </div>
              <CardContent className="p-8 space-y-4">
                 {[
                   { label: "Dispatch Management", icon: <Truck size={14} />, color: "amber", link: "/admin/orders" },
                   { label: "Fleet Authorization", icon: <ShieldCheck size={14} />, color: "blue", link: "/admin/drivers" },
                   { label: "Revenue Protocols", icon: <IndianRupee size={14} />, color: "emerald", link: "/admin/settings" },
                 ].map((action, i) => (
                   <button
                    key={i}
                    onClick={() => navigate(action.link)}
                    className="w-full group flex items-center justify-between p-4 bg-slate-50 hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all"
                   >
                      <div className="flex items-center space-x-3">
                         <div className={cn("p-2 rounded-lg bg-white shadow-sm transition-colors",
                            action.color === 'amber' ? "text-amber-500 group-hover:bg-amber-500 group-hover:text-white" :
                            action.color === 'blue' ? "text-blue-500 group-hover:bg-blue-500 group-hover:text-white" :
                            "text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white"
                         )}>
                            {action.icon}
                         </div>
                         <span className="text-[10px] font-black uppercase text-slate-700 tracking-widest">{action.label}</span>
                      </div>
                      <ChevronRight size={12} className="text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                   </button>
                 ))}
              </CardContent>
           </Card>

           {/* Security Status Module */}
           <Card className="bg-slate-900 text-white rounded-[2rem] p-8 space-y-6 border-none shadow-2xl shadow-slate-900/40 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-amber-500"></div>
              <div className="flex items-center justify-between relative z-10">
                 <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-500">Grid Status</p>
                    <h4 className="text-[12px] font-black uppercase tracking-widest">Global Terminal</h4>
                 </div>
                 <div className="flex flex-col items-end">
                    <div className="flex items-center space-x-1.5">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                       <span className="text-[9px] font-black uppercase text-emerald-500">Secure</span>
                    </div>
                    <span className="text-[7px] text-slate-500 font-bold tracking-widest">ENCRYPTED PORT: 8443</span>
                 </div>
              </div>
              <div className="space-y-3 pt-2 relative z-10">
                 <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Traffic Load</span>
                    <span className="text-white">12%</span>
                 </div>
                 <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="w-[12%] h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></div>
                 </div>
              </div>
              <div className="absolute -bottom-8 -right-8 opacity-[0.02] pointer-events-none">
                 <ShieldCheck size={120} />
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
}
