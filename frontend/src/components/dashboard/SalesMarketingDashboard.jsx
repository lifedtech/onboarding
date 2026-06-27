import React, { useState } from 'react';
import useOpsStore from '../../store/useOpsStore';
import { Target, Users, Megaphone, TrendingUp, DollarSign, Activity, Search } from 'lucide-react';

export default function SalesMarketingDashboard() {
  const [activeKpi, setActiveKpi] = useState(null);

  const topProgramsDetails = {
    recentBookings: [
      { id: 1, name: 'Alice Smith', program: 'Yoga Basics', date: '2026-06-25', location: 'New York, NY' },
      { id: 2, name: 'John Doe', program: 'HIIT Pro', date: '2026-06-26', location: 'Los Angeles, CA' },
      { id: 3, name: 'Sarah Connor', program: 'Pilates', date: '2026-06-27', location: 'Austin, TX' },
      { id: 4, name: 'Mike Ross', program: 'Yoga Basics', date: '2026-06-27', location: 'Seattle, WA' },
    ],
    searchHistoryByLocation: [
      { location: 'New York, NY', volume: 1250, trending: 'Yoga Basics' },
      { location: 'Los Angeles, CA', volume: 980, trending: 'HIIT Pro' },
      { location: 'Austin, TX', volume: 850, trending: 'Pilates' },
      { location: 'Chicago, IL', volume: 720, trending: 'Core' },
    ]
  };

  const kpiData = [
    { 
      id: 'campaigns', 
      label: 'Active Campaigns', 
      value: '12', 
      sub: 'Across 4 channels', 
      details: 'Google Ads: 5 | Meta: 4 | Email: 2 | Affiliate: 1',
      icon: Megaphone
    },
    { 
      id: 'leads', 
      label: 'New Leads (Month-to-Date)', 
      value: '845', 
      sub: '↑ 24% vs last month', 
      details: 'Organic Search: 320 | Paid Social: 410 | Referrals: 115',
      icon: Users
    },
    { 
      id: 'conversion', 
      label: 'Conversion Rate', 
      value: '14.2%', 
      sub: 'Lead to Booking', 
      details: 'Highest converting channel: Organic Search (18.5%)',
      icon: Target
    },
    { 
      id: 'cac', 
      label: 'Avg. Cost Per Acquisition (CAC)', 
      value: '₹1,240', 
      sub: 'Cost Per Acquisition', 
      details: 'Paid Social CAC: ₹1,450 | Search CAC: ₹980',
      icon: Activity
    },
    { 
      id: 'roas', 
      label: 'Est. Return on Ad Spend (ROAS)', 
      value: '4.8x', 
      sub: 'Return on Ad Spend', 
      details: 'Total Ad Spend (Month-to-Date): ₹45,000 | Attributed Revenue: ₹216,000',
      icon: TrendingUp
    },
    {
      id: 'top_programs',
      label: 'Top Programs (Searched/Booked)',
      value: 'Yoga Basics',
      sub: 'Most popular this month',
      details: 'Yoga Basics: 145 bookings | HIIT Pro: 110 bookings | Pilates: 95 bookings',
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
            <div className="w-full bg-brand-teal/20 hover:bg-brand-teal/30 transition-colors rounded-t-sm h-[80%] relative group">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Organic</span>
            </div>
            <div className="w-full bg-brand-teal/40 hover:bg-brand-teal/50 transition-colors rounded-t-sm h-[100%] relative group">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Social</span>
            </div>
            <div className="w-full bg-brand-teal/10 hover:bg-brand-teal/20 transition-colors rounded-t-sm h-[30%] relative group">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Referral</span>
            </div>
            <div className="w-full bg-brand-teal/5 hover:bg-brand-teal/10 transition-colors rounded-t-sm h-[15%] relative group">
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">Direct</span>
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
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-text-main">Summer Wellness Promo</span>
                <span className="text-brand-teal">85% Target</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-brand-teal h-1.5 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-text-main">Retargeting Flow A</span>
                <span className="text-amber-500">42% Target</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-text-main">Corporate Partnerships</span>
                <span className="text-brand-green">112% Target</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div className="bg-brand-green h-1.5 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
