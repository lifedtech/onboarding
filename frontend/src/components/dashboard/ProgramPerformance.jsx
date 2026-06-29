import React, { useState } from 'react';

export default function ProgramPerformance() {
  const [expandedRow, setExpandedRow] = useState(null);

  const programData = [];

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-[#e7f0e3] text-brand-teal'; // Green
    if (score >= 70) return 'bg-[#fff4e5] text-amber-600'; // Yellow
    return 'bg-[#fbe7e9] text-red-600'; // Red
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 w-full h-full overflow-y-auto flex-1">
      
      {/* Header section */}
      <div className="flex flex-col gap-2 mb-2">
        <h1 className="text-2xl font-black text-text-main tracking-tight">Program Performance</h1>
        <p className="text-sm font-semibold text-text-muted mt-0.5">
          Decide which Lifed programs to scale, improve, pause, or keep organic.
        </p>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[24px] shadow-sm border border-border-leaf overflow-hidden mb-6">
        <div className="p-7 border-b border-border-leaf">
          <h2 className="text-lg font-black text-text-main">Program marketing priority score</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border-leaf/50">
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider w-1/4">Program</th>
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider">Category</th>
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider">Format</th>
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Leads</th>
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Bookings</th>
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Score</th>
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider w-1/4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-leaf/50">
              {programData.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-text-muted text-sm font-semibold">
                    No program performance data available.
                  </td>
                </tr>
              )}
              {programData.map((row, idx) => (
                <React.Fragment key={idx}>
                  <tr 
                    onClick={() => setExpandedRow(expandedRow === idx ? null : idx)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer group ${expandedRow === idx ? 'bg-slate-50' : ''}`}
                  >
                    <td className="py-5 px-7">
                      <span className="text-sm font-bold text-text-main group-hover:text-brand-teal transition-colors">{row.program}</span>
                    </td>
                    <td className="py-5 px-7">
                      <span className="text-xs font-semibold text-slate-500">{row.category}</span>
                    </td>
                    <td className="py-5 px-7">
                      <span className="text-xs font-semibold text-slate-500">{row.format}</span>
                    </td>
                    <td className="py-5 px-7 text-center">
                      <span className="text-sm font-black text-text-main">{row.leads}</span>
                    </td>
                    <td className="py-5 px-7 text-center">
                      <span className="text-sm font-black text-text-main">{row.bookings}</span>
                    </td>
                    <td className="py-5 px-7 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black ${getScoreColor(row.score)}`}>
                        {row.score}
                      </span>
                    </td>
                    <td className="py-5 px-7 text-center">
                      <span className="text-xs font-bold text-text-main">{row.action}</span>
                    </td>
                  </tr>
                  
                  {/* Expanded List View */}
                  {expandedRow === idx && (
                    <tr className="bg-slate-50 border-b border-border-leaf/50">
                      <td colSpan={7} className="px-7 py-5">
                        <div className="bg-white border border-border-leaf/50 rounded-[16px] p-5 shadow-sm animate-in slide-in-from-top-1 duration-200">
                          <h4 className="font-black text-text-main text-sm mb-4">Recent Leads & Bookings</h4>
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-[10px] text-text-muted uppercase font-bold border-b border-border-leaf/30">
                                <th className="pb-3 pl-3">Name</th>
                                <th className="pb-3">Status</th>
                                <th className="pb-3">Date</th>
                                <th className="pb-3 text-right pr-3">Assigned To</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border-leaf/30">
                              <tr>
                                <td className="py-3 pl-3 text-xs font-bold text-text-main">Rahul Sharma</td>
                                <td className="py-3"><span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-brand-teal/10 text-brand-teal uppercase">Booking</span></td>
                                <td className="py-3 text-xs text-text-muted font-medium">Today, 10:45 AM</td>
                                <td className="py-3 text-xs text-text-muted text-right pr-3 font-semibold">Agent 01</td>
                              </tr>
                              <tr>
                                <td className="py-3 pl-3 text-xs font-bold text-text-main">Sneha Patel</td>
                                <td className="py-3"><span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-amber-500/10 text-amber-600 uppercase">Lead</span></td>
                                <td className="py-3 text-xs text-text-muted font-medium">Yesterday, 3:20 PM</td>
                                <td className="py-3 text-xs text-text-muted text-right pr-3 font-semibold">Agent 02</td>
                              </tr>
                              <tr>
                                <td className="py-3 pl-3 text-xs font-bold text-text-main">Anjali Desai</td>
                                <td className="py-3"><span className="px-2.5 py-1 rounded-lg text-[10px] font-black bg-brand-teal/10 text-brand-teal uppercase">Booking</span></td>
                                <td className="py-3 text-xs text-text-muted font-medium">2 days ago</td>
                                <td className="py-3 text-xs text-text-muted text-right pr-3 font-semibold">Agent 01</td>
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
        <div className="bg-white rounded-[24px] p-7 shadow-sm border border-border-leaf hover:shadow-md transition-shadow">
          <h3 className="text-lg font-black text-text-main mb-3">Scale</h3>
          <p className="text-sm font-semibold text-slate-500 leading-relaxed">
            The Inner Reset, Ojas Renewal, Women's Wellbeing. They show demand and clear audience fit.
          </p>
        </div>

        <div className="bg-white rounded-[24px] p-7 shadow-sm border border-border-leaf hover:shadow-md transition-shadow">
          <h3 className="text-lg font-black text-text-main mb-3">Improve</h3>
          <p className="text-sm font-semibold text-slate-500 leading-relaxed">
            Know Thyself, Restore Ayurveda. Improve copy, trust content, and practical details.
          </p>
        </div>

        <div className="bg-white rounded-[24px] p-7 shadow-sm border border-border-leaf hover:shadow-md transition-shadow">
          <h3 className="text-lg font-black text-text-main mb-3">Delay</h3>
          <p className="text-sm font-semibold text-slate-500 leading-relaxed">
            Forest Community, broad yoga/culture retreats. Use storytelling first, paid ads later.
          </p>
        </div>
      </div>

    </div>
  );
}
