import React, { useState } from 'react';
import useOpsStore from '../../store/useOpsStore';
import { Target, Users, Megaphone, TrendingUp, DollarSign, Activity, Search, ChevronRight } from 'lucide-react';

export default function SalesMarketingDashboard() {
  const [activeKpi, setActiveKpi] = useState(null);

  const topProgramsDetails = {
    recentBookings: [],
    searchHistoryByLocation: []
  };

  const kpiData = [
    { 
      id: 'campaigns', 
      label: 'Active Campaigns', 
      value: '0', 
      sub: 'Across 0 channels', 
      details: 'No active campaigns',
      icon: Megaphone
    },
    { 
      id: 'leads', 
      label: 'New Leads (MTD)', 
      value: '0', 
      sub: 'No data', 
      details: 'Organic Search: 0 | Paid Social: 0 | Referrals: 0',
      icon: Users
    },
    { 
      id: 'conversion', 
      label: 'Conversion Rate', 
      value: '0%', 
      sub: 'Lead to Booking', 
      details: 'No data available',
      icon: Target
    },
    { 
      id: 'cac', 
      label: 'Avg. CAC', 
      value: '₹0', 
      sub: 'Cost Per Acquisition', 
      details: 'No data available',
      icon: Activity
    },
    { 
      id: 'roas', 
      label: 'Est. ROAS', 
      value: '0x', 
      sub: 'Return on Ad Spend', 
      details: 'Total Ad Spend (MTD): ₹0 | Attributed Revenue: ₹0',
      icon: TrendingUp
    },
    {
      id: 'top_programs',
      label: 'Top Programs',
      value: '-',
      sub: 'No data this month',
      details: 'No bookings recorded yet',
      icon: Search
    }
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 w-full h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-text-main mb-2 tracking-tight flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-brand-teal" /> Sales & Marketing
        </h1>
        <p className="text-sm font-semibold text-text-muted">
          A high-level view of active campaigns, lead generation, conversion efficiency, and marketing spend.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpiData.map((card) => {
            const Icon = card.icon;
            const isActive = activeKpi === card.id;
            return (
              <div 
                key={card.id} 
                onClick={() => setActiveKpi(isActive ? null : card.id)}
                className={`bg-white rounded-[24px] p-5 shadow-sm border cursor-pointer flex flex-col justify-between transition-all group ${
                  isActive ? 'border-brand-teal ring-1 ring-brand-teal' : 'border-border-leaf hover:border-brand-teal/50 hover:shadow-md'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive ? 'bg-brand-teal text-white' : 'bg-brand-teal/10 text-brand-teal group-hover:bg-brand-teal/20'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-[12px] font-bold text-text-muted uppercase tracking-wider mb-1 line-clamp-1">{card.label}</p>
                  <h3 className="text-[26px] font-black text-text-main tracking-tight leading-none mb-2">{card.value}</h3>
                  <p className="text-[11px] font-semibold text-slate-400 line-clamp-1">{card.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Details Pane */}
        {activeKpi && (
          <div className="bg-white rounded-[24px] p-7 shadow-sm border border-brand-teal/30 bg-brand-teal/5 animate-in slide-in-from-top-2 duration-200">
            <h4 className="text-sm font-bold text-text-main mb-6 uppercase tracking-wider">
              Deep Dive: {kpiData.find(k => k.id === activeKpi)?.label}
            </h4>
            
            {activeKpi === 'top_programs' ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-border-leaf">
                  <h5 className="text-xs font-bold text-text-main mb-4 uppercase tracking-wider">Recent Bookings</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-slate-400 border-b border-border-leaf">
                        <tr>
                          <th className="pb-3 font-semibold uppercase tracking-wider">User</th>
                          <th className="pb-3 font-semibold uppercase tracking-wider">Program</th>
                          <th className="pb-3 font-semibold uppercase tracking-wider">Location</th>
                          <th className="pb-3 font-semibold uppercase tracking-wider">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-leaf/50">
                        {topProgramsDetails.recentBookings.length === 0 ? (
                          <tr><td colSpan="4" className="py-4 text-center text-slate-400 font-medium">No bookings yet</td></tr>
                        ) : (
                          topProgramsDetails.recentBookings.map(b => (
                            <tr key={b.id}>
                              <td className="py-3 font-bold text-text-main">{b.name}</td>
                              <td className="py-3 text-text-muted font-medium">{b.program}</td>
                              <td className="py-3 text-text-muted font-medium">{b.location}</td>
                              <td className="py-3 text-text-muted font-medium">{b.date}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-[20px] shadow-sm border border-border-leaf">
                  <h5 className="text-xs font-bold text-text-main mb-4 uppercase tracking-wider">Search History by Location</h5>
                  <div className="space-y-4">
                    {topProgramsDetails.searchHistoryByLocation.length === 0 ? (
                      <div className="text-center text-slate-400 font-medium py-4 text-xs">No search history</div>
                    ) : (
                      topProgramsDetails.searchHistoryByLocation.map((loc, idx) => (
                        <div key={idx} className="flex items-center justify-between border-b border-border-leaf/50 pb-3 last:border-0 last:pb-0">
                          <div>
                            <p className="text-sm font-bold text-text-main">{loc.location}</p>
                            <p className="text-[10px] text-text-muted font-medium">Trending: <span className="text-brand-teal font-bold">{loc.trending}</span></p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-black text-text-main">{loc.volume.toLocaleString()}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">searches</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm font-semibold text-text-muted flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-teal inline-block shadow-[0_0_8px_rgba(20,184,166,0.5)]"></span>
                {kpiData.find(k => k.id === activeKpi)?.details}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Charts / Lower Section */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {/* Mock Chart Area 1 */}
        <div className="bg-white border border-border-leaf rounded-[24px] p-7 shadow-sm">
          <h3 className="text-sm font-black text-text-main mb-6 uppercase tracking-wider">Lead Volume by Channel (MTD)</h3>
          <div className="h-48 flex items-end justify-between gap-2 md:gap-4 border-b border-border-leaf/50 pb-2">
            {/* Mock Bars */}
            <div className="w-full bg-slate-100 rounded-t-[12px] h-[0%] relative group"></div>
            <div className="w-full bg-slate-100 rounded-t-[12px] h-[0%] relative group"></div>
            <div className="w-full bg-slate-100 rounded-t-[12px] h-[0%] relative group"></div>
            <div className="w-full bg-slate-100 rounded-t-[12px] h-[0%] relative group"></div>
          </div>
          <div className="flex justify-between text-[11px] font-bold text-slate-400 mt-4 px-1 uppercase tracking-wider">
            <span>Org. Search</span>
            <span>Paid Social</span>
            <span>Referrals</span>
            <span>Direct</span>
          </div>
        </div>

        {/* Mock Chart Area 2 */}
        <div className="bg-white border border-border-leaf rounded-[24px] p-7 shadow-sm">
          <h3 className="text-sm font-black text-text-main mb-6 uppercase tracking-wider">Campaign Performance</h3>
          <div className="flex items-center justify-center h-48 border-2 border-dashed border-border-leaf rounded-[16px]">
            <div className="text-sm font-bold text-slate-400">No active campaigns data to display.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
