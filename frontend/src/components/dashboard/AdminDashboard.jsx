import React, { useState } from 'react';
import { Users, TrendingUp, Clock, Activity, Target, ShieldCheck, IndianRupee } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

export default function AdminDashboard() {
  const [showRevenueSplit, setShowRevenueSplit] = useState(false);
  // --- MOCK DATA ---
  
  // Healthmates Pipeline
  const healthmatePipelineData = [];

  // Users by Location (Service Users)
  const userLocationData = [];
  const COLORS = ['#14b8a6', '#8b5cf6', '#f59e0b', '#ef4444', '#3b82f6'];

  // Programs Data
  const programsData = [];

  // Revenue Analytics Data
  const revenueData = [];

  // Custom Tooltip for charts to fit the dark theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f172a] border border-slate-700/50 p-3 rounded-xl shadow-xl z-50">
          <p className="text-white font-bold text-sm mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs font-semibold" style={{ color: entry.color || entry.fill }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-bg-base w-full overflow-auto flex-1">
      {/* Header */}
      <div>
         <h1 className="text-text-main font-extrabold text-2xl tracking-tight flex items-center gap-2">
           <ShieldCheck className="w-7 h-7 text-brand-teal" />
           God View Analytics
         </h1>
         <p className="text-text-muted/80 text-sm font-semibold mt-0.5">Comprehensive overview of platform performance and global statistics.</p>
      </div>

      {/* KPI Cards (God Level Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-[#1a2332] border border-white/5 shadow-xl shadow-brand-teal/5 text-white rounded-3xl p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
             <span className="text-brand-teal/80 text-[10px] font-extrabold uppercase tracking-wider">Total Healthmates</span>
             <Users className="w-5 h-5 text-brand-teal" />
          </div>
          <p className="text-3xl font-extrabold tracking-tight group-hover:scale-105 origin-left transition-transform">0</p>
        </div>

        <div className="bg-[#1a2332] border border-white/5 shadow-xl shadow-brand-teal/5 text-white rounded-3xl p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
             <span className="text-purple-500/80 text-[10px] font-extrabold uppercase tracking-wider">Total Service Users</span>
             <Users className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-extrabold tracking-tight group-hover:scale-105 origin-left transition-transform">0</p>
          <span className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-brand-green" /> 0 active purchases
          </span>
        </div>

        <div className="bg-[#1a2332] border border-white/5 shadow-xl shadow-brand-teal/5 text-white rounded-3xl p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
             <span className="text-amber-500/80 text-[10px] font-extrabold uppercase tracking-wider">Avg Session Time</span>
             <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-extrabold tracking-tight group-hover:scale-105 origin-left transition-transform">0m 0s</p>
          <span className="text-[10px] font-bold text-slate-400 mt-2">On official website</span>
        </div>

        <div className="bg-[#1a2332] border border-white/5 shadow-xl shadow-brand-teal/5 text-white rounded-3xl p-6 flex flex-col justify-between group">
          <div className="flex justify-between items-start mb-4">
             <span className="text-brand-green/80 text-[10px] font-extrabold uppercase tracking-wider">Avg Conversion Rate</span>
             <Target className="w-5 h-5 text-brand-green" />
          </div>
          <p className="text-3xl font-extrabold tracking-tight group-hover:scale-105 origin-left transition-transform">0.0%</p>
          <span className="text-[10px] font-bold text-slate-400 mt-2">Program bookings</span>
        </div>

        <div 
          onClick={() => setShowRevenueSplit(!showRevenueSplit)}
          className="bg-[#1a2332] border border-white/5 shadow-xl shadow-brand-teal/5 text-white rounded-3xl p-6 flex flex-col justify-between group cursor-pointer hover:bg-white/5 transition-colors relative overflow-hidden"
          title="Click to toggle breakdown"
        >
          {showRevenueSplit ? (
            <>
              <div className="flex justify-between items-start mb-4">
                 <span className="text-blue-400/80 text-[10px] font-extrabold uppercase tracking-wider">Revenue Breakdown</span>
                 <IndianRupee className="w-5 h-5 text-blue-400" />
              </div>
              <div className="space-y-3 mt-auto">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-[10px] font-bold text-slate-400">Healthmates</span>
                  <span className="text-sm font-extrabold text-purple-400">₹0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-slate-400">Service Users</span>
                  <span className="text-sm font-extrabold text-brand-teal">₹0</span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                 <span className="text-blue-400/80 text-[10px] font-extrabold uppercase tracking-wider">Total Revenue</span>
                 <IndianRupee className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-3xl font-extrabold tracking-tight group-hover:scale-105 origin-left transition-transform">₹0</p>
              <span className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-brand-green" /> 0% this month
              </span>
            </>
          )}
        </div>
      </div>

      {/* CHARTS GRID 1: Healthmates Funnel & User Demographics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Healthmates Status Bar Chart */}
        <div className="bg-white border border-border-leaf/30 rounded-3xl shadow-sm p-6">
          <h2 className="text-base font-bold text-text-main mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-teal" />
            Healthmate Acquisition Funnel
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthmatePipelineData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
                <Bar dataKey="count" fill="#14b8a6" radius={[0, 4, 4, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Users Locations Pie Chart */}
        <div className="bg-white border border-border-leaf/30 rounded-3xl shadow-sm p-6">
          <h2 className="text-base font-bold text-text-main mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            Service User Global Distribution
          </h2>
          <div className="h-[300px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={userLocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {userLocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Legend */}
            <div className="flex flex-col gap-3 justify-center pl-4 md:pl-6 w-1/2">
              {userLocationData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shadow-inner" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span className="text-xs font-bold text-text-main truncate max-w-[80px]">{entry.name}</span>
                  <span className="text-xs font-extrabold text-brand-teal ml-auto">{entry.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CHARTS GRID 2: Program Sales Performance */}
      <div className="bg-white border border-border-leaf/30 rounded-3xl shadow-sm p-6">
        <h2 className="text-base font-bold text-text-main mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-amber-500" />
          Top Sales vs Top Interested Programs
        </h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={programsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{fill: '#f8fafc'}} isAnimationActive={false} />
              <Bar dataKey="sales" name="Actual Purchases" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="interested" name="Expressed Interest (Enquiries)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CHARTS GRID 3: Revenue Analytics */}
      <div className="bg-white border border-border-leaf/30 rounded-3xl shadow-sm p-6">
        <h2 className="text-base font-bold text-text-main mb-6 flex items-center gap-2">
          <IndianRupee className="w-5 h-5 text-brand-green" />
          Revenue Generation: Healthmates vs Service Users
        </h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorHealthmates" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="month" stroke="#64748b" fontSize={12} fontWeight="bold" tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(value) => `₹${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} isAnimationActive={false} />
              <Area type="monotone" dataKey="users" name="Service Users Revenue (₹)" stroke="#14b8a6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              <Area type="monotone" dataKey="healthmates" name="Healthmates Revenue (₹)" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorHealthmates)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
