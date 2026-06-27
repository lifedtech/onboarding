import React, { useState } from 'react';
import useOpsStore from '../../store/useOpsStore';

export default function AdminDashboard() {
  const currentUser = useOpsStore((s) => s.user);
  const [activeKpi, setActiveKpi] = useState(null);

  const kpiData = [
    { id: 'visitors', label: 'Website visitors', value: '6,840', sub: '↑ 18% vs last period', details: 'Organic: 4,200 | Social: 1,840 | Referral: 800' },
    { id: 'leads', label: 'Qualified leads', value: '118', sub: '52% of inquiries', details: 'High Intent: 45 | Medium Intent: 50 | Low Intent: 23' },
    { id: 'bookings', label: 'Bookings', value: '24', sub: '20.3% lead → booking', details: 'Residential: 18 | Online Sessions: 6' },
    { id: 'gbv', label: 'Gross booking value', value: '₹4.82L', sub: 'Residential + sessions', details: 'Residential: ₹3.90L | Sessions: ₹0.92L' },
    { id: 'commission', label: 'Lifed commission', value: '₹1.02L', sub: '20-25% blended', details: 'Avg Margin: 21.1% | Net Realized: ₹0.98L' }
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
              { label: 'Visitors', value: '6,840', height: '100%' },
              { label: 'Program views', value: '2,140', height: '70%' },
              { label: 'WhatsApp starts', value: '226', height: '50%' },
              { label: 'Qualified leads', value: '118', height: '35%' },
              { label: 'Bookings', value: '24', height: '25%' },
              { label: 'Reviews', value: '14', height: '20%' }
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
            <span className="font-bold text-text-main">Primary drop-off:</span> Program views → WhatsApp starts. Improve trust signals: host video, inclusions, dates, cancellation, "who this is for."
          </div>
        </div>

        {/* Strategic Actions */}
        <div className="bg-transparent flex flex-col">
          <h3 className="text-text-main font-bold text-base px-2 mb-4 mt-1">This week's strategic actions</h3>
          <div className="flex flex-col gap-3">
            {[
              { 
                num: 1, 
                title: 'Scale "Find Your Reset"', 
                desc: 'Burnt-out professionals are producing the highest qualified lead rate. Increase spend only on the top two ads.'
              },
              { 
                num: 2, 
                title: 'Fix Ojas booking friction', 
                desc: 'Strong interest, lower conversion. Add travel logistics, sample day plan, and "can I take leave?" FAQ.'
              },
              { 
                num: 3, 
                title: 'Run Kochi Session Sprint', 
                desc: 'Inner Reset and Know Thyself have lower friction and can generate first reviews quickly.'
              },
              { 
                num: 4, 
                title: 'Interview 10 lost leads', 
                desc: 'Top objections: time, price, trust, unclear schedule. Use calls to improve program pages.'
              }
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
            data: [
              { name: 'Burnt-out professionals', value: 86, width: '90%' },
              { name: 'Women 30-55', value: 71, width: '75%' },
              { name: 'Wellness travellers', value: 62, width: '65%' }
            ]
          },
          { 
            title: 'Top programs', 
            data: [
              { name: 'The Inner Reset', value: 88, width: '92%' },
              { name: 'Ojas Renewal', value: 79, width: '82%' },
              { name: "Women's Wellbeing", value: 75, width: '78%' }
            ]
          },
          { 
            title: 'Top channels', 
            data: [
              { name: 'Instagram', value: 82, width: '85%' },
              { name: 'WhatsApp', value: 80, width: '82%' },
              { name: 'Google Search', value: 68, width: '70%' }
            ]
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
