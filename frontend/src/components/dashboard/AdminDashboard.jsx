import React, { useState } from 'react';
import useOpsStore from '../../store/useOpsStore';

export default function AdminDashboard() {
  const currentUser = useOpsStore((s) => s.user);
  const [activeKpi, setActiveKpi] = useState(null);

  const kpiData = [
    { id: 'visitors', label: 'Website visitors', value: '0', sub: 'No data', details: 'Organic: 0 | Social: 0 | Referral: 0' },
    { id: 'leads', label: 'Qualified leads', value: '0', sub: '0% of inquiries', details: 'High Intent: 0 | Medium Intent: 0 | Low Intent: 0' },
    { id: 'bookings', label: 'Bookings', value: '0', sub: '0% lead → booking', details: 'Residential: 0 | Online Sessions: 0' },
    { id: 'gbv', label: 'Gross booking value', value: '₹0', sub: 'Residential + sessions', details: 'Residential: ₹0 | Sessions: ₹0' },
    { id: 'commission', label: 'Lifed commission', value: '₹0', sub: '0% blended', details: 'Avg Margin: 0% | Net Realized: ₹0' }
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 bg-bg-base w-full h-full overflow-y-auto">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold text-text-muted">
          A single operating view for users, leads, bookings, program performance, Healthmate readiness, and marketing decisions.
        </p>
      </div>

      {/* Top 5 Cards */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {kpiData.map((card) => (
            <div 
              key={card.id} 
              onClick={() => setActiveKpi(activeKpi === card.id ? null : card.id)}
              className={`bg-white rounded-2xl p-5 shadow-sm border cursor-pointer flex flex-col justify-between transition-all ${
                activeKpi === card.id ? 'border-brand-teal ring-1 ring-brand-teal' : 'border-border-leaf hover:border-brand-teal/50'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <p className="text-[11px] font-bold text-text-muted uppercase tracking-wide">{card.label}</p>
              </div>
              <div>
                <h3 className="text-[28px] font-black text-text-main mb-1 tracking-tight">{card.value}</h3>
                <p className="text-[11px] font-semibold text-text-muted">{card.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Details Pane */}
        {activeKpi && (
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-brand-teal/30 bg-brand-teal/5 animate-in slide-in-from-top-2 duration-200">
            <h4 className="text-sm font-bold text-text-main mb-2">
              {kpiData.find(k => k.id === activeKpi)?.label} Breakdown
            </h4>
            <p className="text-xs font-semibold text-text-muted">
              {kpiData.find(k => k.id === activeKpi)?.details}
            </p>
          </div>
        )}
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Funnel Chart - Spans 2 cols */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-border-leaf p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-text-main font-bold text-base">Journey conversion snapshot</h3>
            <span className="text-[10px] font-extrabold text-brand-teal bg-bg-mint px-2.5 py-1 rounded-md tracking-wide">Live Well. For Real.</span>
          </div>
          
          <div className="flex-1 flex items-end gap-2 md:gap-3 h-[250px] mt-4 mb-6">
            {[
              { label: 'Visitors', value: '0', height: '0%' },
              { label: 'Program views', value: '0', height: '0%' },
              { label: 'WhatsApp starts', value: '0', height: '0%' },
              { label: 'Qualified leads', value: '0', height: '0%' },
              { label: 'Bookings', value: '0', height: '0%' },
              { label: 'Reviews', value: '0', height: '0%' }
            ].map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                <div 
                  className="w-full bg-bg-mint border border-brand-teal/20 rounded-t-xl flex flex-col items-center justify-end pb-4 transition-all hover:bg-brand-teal/20 cursor-pointer" 
                  style={{ height: bar.height }}
                >
                  <p className="font-black text-brand-teal text-lg md:text-xl">{bar.value}</p>
                  <p className="text-[10px] text-brand-teal/80 font-extrabold mt-1 text-center leading-tight px-1">{bar.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl p-4 text-[11px] text-text-muted font-medium leading-relaxed border border-border-leaf">
            <span className="font-bold text-text-main">No data available:</span> Accumulate more user journeys to view drop-off points.
          </div>
        </div>

        {/* Strategic Actions */}
        <div className="bg-transparent flex flex-col">
          <h3 className="text-text-main font-bold text-base px-2 mb-4 mt-1">This week's strategic actions</h3>
          <div className="flex flex-col gap-3">
            {[
            ].map((action, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-5 shadow-sm border border-border-leaf flex gap-4 items-start hover:shadow-md transition-shadow">
                <div className="w-6 h-6 shrink-0 rounded-full bg-brand-teal text-white flex items-center justify-center text-[11px] font-black mt-0.5 shadow-md">
                  {action.num}
                </div>
                <div>
                  <h4 className="text-text-main text-[13px] font-bold">{action.title}</h4>
                  <p className="text-[11px] text-text-muted mt-1.5 leading-relaxed font-medium">{action.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row - Horizontal Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            title: 'Top audience', 
            data: []
          },
          { 
            title: 'Top programs', 
            data: []
          },
          { 
            title: 'Top channels', 
            data: []
          }
        ].map((block, idx) => (
          <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-border-leaf">
            <h3 className="text-text-main font-bold text-[13px] mb-5">{block.title}</h3>
            <div className="space-y-4">
              {block.data.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-32 text-[11px] font-semibold text-text-muted truncate">{item.name}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-teal rounded-full" style={{ width: item.width }} />
                  </div>
                  <span className="w-6 text-right text-[11px] font-black text-text-main">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
