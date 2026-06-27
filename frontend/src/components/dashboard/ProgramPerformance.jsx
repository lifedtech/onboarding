import React, { useState } from 'react';

export default function ProgramPerformance() {
  const [expandedRow, setExpandedRow] = useState(null);

  const programData = [
    {
      program: 'The Inner Reset',
      category: 'Wellness / recovery',
      format: 'Session',
      leads: 38,
      bookings: 9,
      score: 88,
      action: 'Scale local ads'
    },
    {
      program: 'Ojas Renewal',
      category: 'Digital-worker reset',
      format: 'Residential',
      leads: 41,
      bookings: 5,
      score: 79,
      action: 'Fix travel + leave friction'
    },
    {
      program: "Women's Well-Being",
      category: "Women's reset",
      format: 'Residential',
      leads: 20,
      bookings: 4,
      score: 75,
      action: 'Add safety/trust content'
    },
    {
      program: 'Know Thyself',
      category: 'Functional movement',
      format: 'Session',
      leads: 16,
      bookings: 3,
      score: 71,
      action: 'Translate "embodied" language'
    },
    {
      program: 'Restore Ayurveda',
      category: 'Recovery',
      format: 'Residential',
      leads: 10,
      bookings: 3,
      score: 69,
      action: 'Add schedule + host proof'
    },
    {
      program: 'Forest Community',
      category: 'Nature / lifestyle',
      format: 'Residential',
      leads: 9,
      bookings: 0,
      score: 48,
      action: 'Organic storytelling only'
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-[#e7f0e3] text-brand-teal'; // Green
    if (score >= 70) return 'bg-[#fff4e5] text-amber-600'; // Yellow
    return 'bg-[#fbe7e9] text-red-600'; // Red
  };

  return (
    <div className="p-6 md:p-8 space-y-6 bg-bg-base w-full h-full overflow-y-auto font-sans">
      
      {/* Header section */}
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-black text-text-main tracking-tight">Program Performance</h1>
        <p className="text-sm font-medium text-text-muted">
          Decide which Lifed programs to scale, improve, pause, or keep organic.
        </p>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[1.25rem] shadow-sm border border-border-leaf overflow-hidden mb-6">
        <div className="p-6 border-b border-border-leaf">
          <h2 className="text-lg font-bold text-text-main">Program marketing priority score</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-leaf/50">
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted w-1/4">Program</th>
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted">Category</th>
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted">Format</th>
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted text-center">Leads</th>
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted text-center">Bookings</th>
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted text-center">Score</th>
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted w-1/4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-leaf/50">
              {programData.map((row, idx) => (
                <React.Fragment key={idx}>
                  <tr 
                    onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedRow === idx ? 'bg-slate-50' : ''}`}
                  >
                    <td className="py-4 px-6">
                      <span className="text-[13px] font-bold text-text-main">{row.program}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[13px] font-medium text-text-main">{row.category}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-[13px] font-medium text-text-main">{row.format}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-[13px] font-bold text-text-main">{row.leads}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-[13px] font-bold text-text-main">{row.bookings}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black ${getScoreColor(row.score)}`}>
                        {row.score}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="text-[13px] font-medium text-text-main">{row.action}</span>
                    </td>
                  </tr>
                  
                  {/* Expanded List View */}
                  {expandedRow === idx && (
                    <tr className="bg-slate-50 border-b border-border-leaf/50">
                      <td colSpan={7} className="px-6 py-4">
                        <div className="bg-white border border-border-leaf/50 rounded-xl p-4 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] animate-in slide-in-from-top-1 duration-200">
                          <h4 className="font-bold text-text-main text-sm mb-3">Recent Leads & Bookings</h4>
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-[10px] text-text-muted uppercase font-bold border-b border-border-leaf/30">
                                <th className="pb-2 pl-2">Name</th>
                                <th className="pb-2">Status</th>
                                <th className="pb-2">Date</th>
                                <th className="pb-2 text-right pr-2">Assigned To</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-leaf/30">
                              <tr>
                                <td className="py-2.5 pl-2 text-xs font-semibold text-text-main">Rahul Sharma</td>
                                <td className="py-2.5"><span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-brand-teal/10 text-brand-teal">BOOKING</span></td>
                                <td className="py-2.5 text-xs text-text-muted font-medium">Today, 10:45 AM</td>
                                <td className="py-2.5 text-xs text-text-muted text-right pr-2 font-medium">Agent 01</td>
                              </tr>
                              <tr>
                                <td className="py-2.5 pl-2 text-xs font-semibold text-text-main">Sneha Patel</td>
                                <td className="py-2.5"><span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/10 text-amber-600">LEAD</span></td>
                                <td className="py-2.5 text-xs text-text-muted font-medium">Yesterday, 3:20 PM</td>
                                <td className="py-2.5 text-xs text-text-muted text-right pr-2 font-medium">Agent 02</td>
                              </tr>
                              <tr>
                                <td className="py-2.5 pl-2 text-xs font-semibold text-text-main">Anjali Desai</td>
                                <td className="py-2.5"><span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-brand-teal/10 text-brand-teal">BOOKING</span></td>
                                <td className="py-2.5 text-xs text-text-muted font-medium">2 days ago</td>
                                <td className="py-2.5 text-xs text-text-muted text-right pr-2 font-medium">Agent 01</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-border-leaf hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-text-main mb-3">Scale</h3>
          <p className="text-[13px] font-medium text-text-muted leading-relaxed">
            The Inner Reset, Ojas Renewal, Women's Wellbeing. They show demand and clear audience fit.
          </p>
        </div>

        <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-border-leaf hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-text-main mb-3">Improve</h3>
          <p className="text-[13px] font-medium text-text-muted leading-relaxed">
            Know Thyself, Restore Ayurveda. Improve copy, trust content, and practical details.
          </p>
        </div>

        <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-border-leaf hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-text-main mb-3">Delay</h3>
          <p className="text-[13px] font-medium text-text-muted leading-relaxed">
            Forest Community, broad yoga/culture retreats. Use storytelling first, paid ads later.
          </p>
        </div>
      </div>

    </div>
  );
}
