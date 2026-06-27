import React, { useState } from 'react';
import useOpsStore from '../../store/useOpsStore';
import { Target, Users, Megaphone, TrendingUp, DollarSign, Activity, Search } from 'lucide-react';

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
      label: 'New Leads (Month-to-Date)', 
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
      label: 'Avg. Cost Per Acquisition (CAC)', 
      value: '₹0', 
      sub: 'Cost Per Acquisition', 
      details: 'No data available',
      icon: Activity
    },
    { 
      id: 'roas', 
      label: 'Est. Return on Ad Spend (ROAS)', 
      value: '0x', 
      sub: 'Return on Ad Spend', 
      details: 'Total Ad Spend (Month-to-Date): ₹0 | Attributed Revenue: ₹0',
      icon: TrendingUp
    },
    {
      id: 'top_programs',
      label: 'Top Programs (Searched/Booked)',
      value: '-',
      sub: 'No data this month',
      details: 'No bookings recorded yet',
      icon: Search
    }
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 bg-bg-base w-full h-full overflow-y-auto">
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
            return (
              <div 
                key={card.id} 
                onClick={() => setActiveKpi(activeKpi === card.id ? null : card.id)}
                className={`bg-white rounded-2xl p-5 shadow-sm border cursor-pointer flex flex-col justify-between transition-all ${
                  activeKpi === card.id ? 'border-brand-teal ring-1 ring-brand-teal' : 'border-border-leaf hover:border-brand-teal/50'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">{card.label}</p>
                  <Icon className={`w-4 h-4 ${activeKpi === card.id ? 'text-brand-teal' : 'text-slate-300'}`} />
                </div>
                <div>
                  <h3 className="text-[28px] font-black text-text-main mb-1 tracking-tight">{card.value}</h3>
                  <p className="text-[11px] font-semibold text-text-muted">{card.sub}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Details Pane */}
        {activeKpi && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-teal/30 bg-brand-teal/5 animate-in slide-in-from-top-2 duration-200">
            <h4 className="text-sm font-bold text-text-main mb-4">
              Deep Dive: {kpiData.find(k => k.id === activeKpi)?.label}
            </h4>
            
            {activeKpi === 'top_programs' ? (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-border-leaf">
                  <h5 className="text-xs font-bold text-text-main mb-3 uppercase tracking-wider">Recent Bookings</h5>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="text-text-muted border-b border-border-leaf">
                        <tr>
                          <th className="pb-2 font-semibold">User</th>
                          <th className="pb-2 font-semibold">Program</th>
                          <th className="pb-2 font-semibold">Location</th>
                          <th className="pb-2 font-semibold">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-leaf/50">
                        {topProgramsDetails.recentBookings.map(b => (
                          <tr key={b.id}>
                            <td className="py-2 font-medium text-text-main">{b.name}</td>
                            <td className="py-2 text-text-muted">{b.program}</td>
                            <td className="py-2 text-text-muted">{b.location}</td>
                            <td className="py-2 text-text-muted">{b.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm border border-border-leaf">
                  <h5 className="text-xs font-bold text-text-main mb-3 uppercase tracking-wider">Search History by Location</h5>
                  <div className="space-y-3">
                    {topProgramsDetails.searchHistoryByLocation.map((loc, idx) => (
                      <div key={idx} className="flex items-center justify-between border-b border-border-leaf/50 pb-2 last:border-0 last:pb-0">
                        <div>
                          <p className="text-sm font-semibold text-text-main">{loc.location}</p>
                          <p className="text-[10px] text-text-muted">Trending: <span className="text-brand-teal font-medium">{loc.trending}</span></p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-text-main">{loc.volume.toLocaleString()}</span>
                          <span className="text-[10px] text-text-muted block">searches</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-xs font-semibold text-text-muted flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-teal inline-block"></span>
                {kpiData.find(k => k.id === activeKpi)?.details}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Charts / Lower Section */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        {/* Mock Chart Area 1 */}
        <div className="bg-white border border-border-leaf rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-text-main mb-4 uppercase tracking-wider">Lead Volume by Channel (Month-to-Date)</h3>
          <div className="h-48 flex items-end justify-between gap-2 border-b border-border-leaf/50 pb-2">
            {/* Mock Bars */}
            <div className="w-full bg-slate-100 transition-colors rounded-t-sm h-[0%] relative group">
            </div>
            <div className="w-full bg-slate-100 transition-colors rounded-t-sm h-[0%] relative group">
            </div>
            <div className="w-full bg-slate-100 transition-colors rounded-t-sm h-[0%] relative group">
            </div>
            <div className="w-full bg-slate-100 transition-colors rounded-t-sm h-[0%] relative group">
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-bold text-text-muted mt-2 px-1">
            <span>Org. Search</span>
            <span>Paid Social</span>
            <span>Referrals</span>
            <span>Direct</span>
          </div>
        </div>

        {/* Mock Chart Area 2 */}
        <div className="bg-white border border-border-leaf rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-text-main mb-4 uppercase tracking-wider">Campaign Performance</h3>
          <div className="space-y-4">
            <div className="text-xs text-text-muted italic">No active campaigns data to display.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
