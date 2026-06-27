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
    <div className="p-6 md:p-8 space-y-6 bg-bg-base w-full h-full overflow-y-auto font-sans">
      
      {/* Header section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black text-text-main tracking-tight">Booking & Healthmate Operations</h1>
        <p className="text-sm font-medium text-text-muted">
          Monitor payment, confirmation, Healthmate response, cancellations, and delivery quality.
        </p>
      </div>

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-border-leaf flex flex-col justify-center h-32 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-text-muted mb-2">Payment success</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-text-main tracking-tight">94%</h3>
          </div>
          <p className="text-xs font-medium text-text-muted mt-2">Healthy</p>
        </div>

        <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-border-leaf flex flex-col justify-center h-32 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-text-muted mb-2">Host response avg</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-text-main tracking-tight">2.4h</h3>
          </div>
          <p className="text-xs font-medium text-text-muted mt-2">Target below 2h</p>
        </div>

        <div className="bg-white rounded-[1.25rem] p-6 shadow-sm border border-border-leaf flex flex-col justify-center h-32 hover:shadow-md transition-shadow">
          <p className="text-xs font-semibold text-text-muted mb-2">Cancellation rate</p>
          <div className="flex items-end gap-3">
            <h3 className="text-4xl font-black text-text-main tracking-tight">6%</h3>
          </div>
          <p className="text-xs font-medium text-text-muted mt-2">Watch residential</p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[1.25rem] shadow-sm border border-border-leaf overflow-hidden mt-6">
        <div className="p-6 border-b border-border-leaf">
          <h2 className="text-lg font-bold text-text-main">Healthmate operations</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-leaf/50">
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted w-1/5">Healthmate / Program</th>
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted text-center">Response</th>
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted text-center">Availability accuracy</th>
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted text-center">Reviews</th>
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted text-center">Content assets</th>
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted text-center">Ops score</th>
                <th className="py-4 px-6 text-[11px] font-bold text-text-muted w-1/4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-leaf/50">
              {operationsData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-[13px] font-bold text-text-main">{row.program}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-[13px] font-medium text-text-main">{row.response}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-[13px] font-medium text-text-main">{row.availability}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-[13px] font-medium text-text-main">{row.reviews}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-[13px] font-medium text-text-main">{row.content}</span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-black ${getScoreColor(row.opsScore)}`}>
                      {row.opsScore}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="text-[13px] font-medium text-text-main">{row.action}</span>
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
