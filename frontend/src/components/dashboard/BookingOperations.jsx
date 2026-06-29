import React from 'react';

export default function BookingOperations() {
  const operationsData = [
    {
      program: 'Inner Reset host',
      response: '45 min',
      availability: 'High',
      reviews: '4.8',
      content: 'Medium',
      opsScore: 86,
      action: 'Record testimonial reels'
    },
    {
      program: 'Ojas Renewal centre',
      response: '3.5 h',
      availability: 'Medium',
      reviews: '4.6',
      content: 'High',
      opsScore: 73,
      action: 'Improve response SLA'
    },
    {
      program: "Women's program host",
      response: '2.2 h',
      availability: 'High',
      reviews: '4.7',
      content: 'Medium',
      opsScore: 78,
      action: 'Add safety FAQ video'
    },
    {
      program: 'Forest Community',
      response: '6 h',
      availability: 'Low',
      reviews: '—',
      content: 'High',
      opsScore: 49,
      action: 'Do not run paid ads yet'
    }
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-[#e7f0e3] text-brand-teal'; // Green
    if (score >= 70) return 'bg-[#fff4e5] text-amber-600'; // Yellow
    return 'bg-[#fbe7e9] text-red-600'; // Red
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 w-full h-full overflow-y-auto flex-1">
      
      {/* Header section */}
      <div className="flex flex-col gap-2 mb-2">
        <h1 className="text-2xl font-black text-text-main tracking-tight">Booking & Healthmate Operations</h1>
        <p className="text-sm font-semibold text-text-muted mt-0.5">
          Monitor payment, confirmation, Healthmate response, cancellations, and delivery quality.
        </p>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div className="bg-white rounded-[24px] p-7 shadow-sm border border-border-leaf flex flex-col justify-center min-h-[145px] hover:shadow-md transition-shadow">
          <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-2">Payment success</p>
          <div className="flex items-end gap-3 mt-auto">
            <h3 className="text-[26px] font-black text-text-main tracking-tight">94%</h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />
            Healthy
          </p>
        </div>

        <div className="bg-white rounded-[24px] p-7 shadow-sm border border-border-leaf flex flex-col justify-center min-h-[145px] hover:shadow-md transition-shadow">
          <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-2">Host response avg</p>
          <div className="flex items-end gap-3 mt-auto">
            <h3 className="text-[26px] font-black text-text-main tracking-tight">2.4h</h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Target below 2h
          </p>
        </div>

        <div className="bg-white rounded-[24px] p-7 shadow-sm border border-border-leaf flex flex-col justify-center min-h-[145px] hover:shadow-md transition-shadow">
          <p className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider mb-2">Cancellation rate</p>
          <div className="flex items-end gap-3 mt-auto">
            <h3 className="text-[26px] font-black text-text-main tracking-tight">6%</h3>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Watch residential
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[24px] shadow-sm border border-border-leaf overflow-hidden mb-6">
        <div className="p-7 border-b border-border-leaf flex justify-between items-center bg-white">
          <h2 className="text-lg font-black text-text-main">Healthmate operations</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-border-leaf/50">
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider w-1/5">Healthmate / Program</th>
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Response</th>
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Availability accuracy</th>
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Reviews</th>
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Content assets</th>
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider text-center">Ops score</th>
                <th className="py-4 px-7 text-[11px] font-bold text-text-muted uppercase tracking-wider w-1/4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-leaf/50">
              {operationsData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-5 px-7">
                    <span className="text-sm font-bold text-text-main group-hover:text-brand-teal transition-colors">{row.program}</span>
                  </td>
                  <td className="py-5 px-7 text-center">
                    <span className="text-xs font-semibold text-slate-500">{row.response}</span>
                  </td>
                  <td className="py-5 px-7 text-center">
                    <span className="text-xs font-semibold text-slate-500">{row.availability}</span>
                  </td>
                  <td className="py-5 px-7 text-center">
                    <span className="text-xs font-semibold text-slate-500">{row.reviews}</span>
                  </td>
                  <td className="py-5 px-7 text-center">
                    <span className="text-xs font-semibold text-slate-500">{row.content}</span>
                  </td>
                  <td className="py-5 px-7 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black ${getScoreColor(row.opsScore)}`}>
                      {row.opsScore}
                    </span>
                  </td>
                  <td className="py-5 px-7 text-center">
                    <span className="text-xs font-bold text-text-main">{row.action}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
}
