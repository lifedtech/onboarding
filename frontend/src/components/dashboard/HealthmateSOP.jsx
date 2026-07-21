import React, { useState } from 'react';
import {   ArrowUpRight, X, Copy, CheckCircle2   } from 'lucide-react';
import { sopAssets } from '../../data/sopAssets';

const stages = [
  {
    id: 0,
    sla: "Instant\nwelcome",
    title: "Enquiry & Leads",
    lead: "A warm welcome to Lifed and a 60-second film, then a clear fork: explore programs to book, or become a Healthmate to host.",
    forks: [
      { title: "Explore programs", desc: "For seekers → Lifed website to discover and book." },
      { title: "Become a Healthmate", desc: "Show the partnership poster → registration page. This path continues below.", active: true }
    ],
    happens: [
      "Send the welcome message + \"What is Lifed?\" video.",
      "Offer the two paths: explore, or partner.",
      "If partner: share the Healthmate poster & FAQ.",
      "Link straight to the registration page."
    ],
    assets: [
      { id: "A1", label: "Welcome WhatsApp" },
      { id: "A2", label: "Welcome email" },
      { id: "A3", label: "What is Lifed?" },
      { id: "A4", label: "Become a Healthmate poster" },
      { id: "A5", label: "Video: What is Lifed?" },
      { id: "A6", label: "Video: Who is a Healthmate?" },
      { id: "A7", label: "Partner page" },
      { id: "A8", label: "Healthmate FAQ" }
    ],
    owner: "Growth / front desk",
    channel: "WhatsApp · Email · Web · Video",
    next: "Chooses \"Become a Healthmate\""
  },
  {
    id: 1,
    sla: "Score\n≥ 35 / 50",
    title: "Pre-Qualify",
    lead: "A friendly explainer call to understand the host, score fit consistently, and name the first program Lifed can co-create.",
    happens: [
      "Schedule a 15–20 min call to explain Lifed.",
      "Score the Healthmate against 10 criteria (below).",
      "Schedule follow-ups; log internal notes.",
      "Identify the first program to co-create."
    ],
    assets: [
      { id: "B1", label: "Call invitation" },
      { id: "B2", label: "Call script" },
      { id: "B3", label: "Scoring form" },
      { id: "B4", label: "Fit checklist" },
      { id: "B5", label: "Follow-up message" },
      { id: "B6", label: "Program idea worksheet" },
      { id: "B7", label: "Internal notes" }
    ],
    scorecard: true,
    owner: "Onboarding team",
    channel: "Call · WhatsApp · Internal",
    next: "Scores 35+ & agrees to co-create"
  },
  {
    id: 2,
    sla: "Approved\nin 1 day",
    title: "Register",
    lead: "Guide the host through registration, validate credentials and payout details, approve the account, and hand over the dashboard.",
    happens: [
      "Walk through the registration process on a call.",
      "Validate credentials and licences.",
      "Validate bank / UPI details for payouts.",
      "Approve the Healthmate account (within 1 day).",
      "Send the dashboard & program-builder videos."
    ],
    assets: [
      { id: "C1", label: "Registration instruction" },
      { id: "C2", label: "Registration page" },
      { id: "C3", label: "Credential checklist" },
      { id: "C4", label: "Bank validation" },
      { id: "C5", label: "Approval email" },
      { id: "C6", label: "On-hold email" },
      { id: "C7", label: "Rejection email" },
      { id: "C8", label: "Builder video" },
      { id: "C9", label: "Dashboard video" }
    ],
    owner: "Onboarding + Finance",
    channel: "Web · Email · Video · Internal",
    next: "Account approved, dashboard issued"
  },
  {
    id: 3,
    sla: "Ready or\nco-create",
    title: "Prepare",
    lead: "Walk through the dashboard and builder, collect the program, then sort it: ready to go live, or shape it together first.",
    forks: [
      { title: "Ready to go live", desc: "Follow up → Healthmate submits the program for review.", active: true },
      { title: "Co-create & curate", desc: "R&D curates with the Healthmate's input → then submit for review.", active: true }
    ],
    happens: [
      "Call to explain the dashboard and program builder.",
      "Collect the program details.",
      "Categorize: ready to go live, or co-create.",
      "Shape the objective and structure; submit for review."
    ],
    assets: [
      { id: "D1", label: "Dashboard guide" },
      { id: "D2", label: "Builder guide" },
      { id: "D3", label: "Details form" },
      { id: "D4", label: "Ready-to-go-live checklist" },
      { id: "D5", label: "Co-create worksheet" },
      { id: "D6", label: "Objective worksheet" },
      { id: "D7", label: "Structure worksheet" },
      { id: "D8", label: "Submission follow-up" }
    ],
    owner: "Onboarding + Curation (R&D)",
    channel: "Dashboard · Call · PDF",
    next: "Program submitted for review"
  },
  {
    id: 4,
    sla: "Live within\n1 week",
    title: "Review",
    lead: "Full validation against the curation standard. If anything needs fixing, we do it together on a call — then approve and send the SOP.",
    happens: [
      "Review the program with full validation.",
      "If rectification is needed, sit with the host and finish it.",
      "When ready, approve and send the conduction SOP.",
      "Whole review-to-live completes within 1 week."
    ],
    assets: [
      { id: "E1", label: "Review checklist" },
      { id: "E2", label: "Validation scorecard" },
      { id: "E3", label: "Rectification email" },
      { id: "E4", label: "Rectification call" },
      { id: "E5", label: "Approval email" },
      { id: "E6", label: "Rejection email" },
      { id: "E7", label: "Conduction SOP" },
      { id: "E8", label: "Quality & safety checklist" }
    ],
    owner: "Curation team",
    channel: "Internal · Email · Call · PDF",
    next: "Program approved & SOP sent"
  },
  {
    id: 5,
    sla: "Payout\n3–7 days",
    title: "Live",
    lead: "Go live, prompt sharing, send the welcome kit, and support the first bookings — stepping in if a program is quiet after ten days.",
    happens: [
      "Announce live; ask the host to share on their channels.",
      "Send the welcome kit — digital for all, physical for the first 100.",
      "Review the program at day 10.",
      "No booking by day 10 → trigger Sales & Marketing.",
      "Activation aims for first booking within ~3 weeks."
    ],
    assets: [
      { id: "F1", label: "Live announcement" },
      { id: "F2", label: "Welcome kit" },
      { id: "F3", label: "Caption templates" },
      { id: "F4", label: "WhatsApp share" },
      { id: "F5", label: "Instagram story" },
      { id: "F6", label: "Post-live follow-up" },
      { id: "F7", label: "10-day review" },
      { id: "F8", label: "No-booking trigger" },
      { id: "F9", label: "S&M activation" }
    ],
    owner: "Onboarding → Sales & Marketing",
    channel: "WhatsApp · Email · Social · Internal",
    nextLabel: "Welcome kit",
    next: "Handmade card + Lifed journal (first 100)"
  }
];

export default function HealthmateSOP() {
  const [activeAsset, setActiveAsset] = useState(null);
  const [copied, setCopied] = useState(false);
  const [editedCopies, setEditedCopies] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifed-sop-copies') || '{}'); } catch { return {}; }
  });

  const handleCopyChange = (id, newCopy) => {
    setEditedCopies(prev => {
      const next = { ...prev, [id]: newCopy };
      localStorage.setItem('lifed-sop-copies', JSON.stringify(next));
      return next;
    });
  };

  const handleCopy = () => {
    if (!activeAsset) return;
    const textToCopy = editedCopies[activeAsset.id] ?? activeAsset.copy;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-full bg-slate-50/50 p-8 md:p-12 overflow-y-auto relative">
      <div className="max-w-4xl mx-auto pb-24">
        
        {/* Header */}
        <div className="mb-14">
          <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.18em] uppercase text-brand-teal mb-4">
            <span className="w-6 h-0.5 bg-brand-teal"></span>
            THE FLOW
          </div>
          <h1 className="text-[32px] md:text-[44px] font-extrabold leading-[1.08] tracking-[-0.02em] mb-4 text-slate-800 max-w-xl">
            Six stages — read the steps, deploy the assets.
          </h1>
          <p className="text-[16px] text-slate-500 max-w-2xl leading-relaxed mb-8">
            Each stage shows what happens in the operating system and the assets that carry it. The asset chips are live: tap one to open its full copy and deploy it.
          </p>
          <div className="inline-flex items-center gap-2.5 bg-slate-800 text-white text-[14px] font-semibold px-4 py-2.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-brand-teal ring-4 ring-brand-teal/25"></div>
            Tap any <ArrowUpRight className="w-4 h-4 text-teal-400 inline" strokeWidth={3} /> asset to open and copy it
          </div>
        </div>

        {/* Timeline */}
        <div className="relative">
          {stages.map((stage, idx) => {
            const isLast = idx === stages.length - 1;
            return (
              <div key={stage.id} className="relative flex gap-6 md:gap-10 mb-12 group">
                
                {/* Rail */}
                <div className="relative flex flex-col items-center shrink-0 w-[60px] md:w-[70px]">
                  {!isLast && (
                    <div className="absolute top-0 bottom-[-48px] left-1/2 -translate-x-1/2 w-[2px] bg-slate-200"></div>
                  )}
                  <div className="relative z-10 w-12 h-12 md:w-14 md:h-14 rounded-full bg-brand-teal text-white flex items-center justify-center font-extrabold text-[20px] md:text-[22px] border-4 border-slate-50 shadow-[0_0_0_1px_#e2e8f0]">
                    {stage.id}
                  </div>
                  <div className="relative z-10 mt-3.5 py-1 text-center bg-transparent">
                    <span className="block text-[10px] md:text-[11px] font-bold uppercase tracking-[0.04em] text-brand-teal leading-tight whitespace-pre-line">
                      {stage.sla}
                    </span>
                  </div>
                </div>

                {/* Card */}
                <div className="flex-1 bg-white rounded-[16px] p-6 md:p-8 shadow-sm">
                  <div className="flex items-center gap-3 text-[11px] font-bold tracking-[0.18em] uppercase text-brand-teal mb-2.5">
                    <span className="w-6 h-0.5 bg-brand-teal"></span>
                    STAGE {stage.id}
                  </div>
                  
                  <h3 className="text-[24px] text-slate-800 font-extrabold mb-2.5">
                    {stage.title}
                  </h3>
                  
                  <p className="text-[15px] text-slate-500 max-w-2xl mb-6">
                    {stage.lead}
                  </p>

                  {/* Forks */}
                  {stage.forks && (
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      {stage.forks.map((fork, fidx) => (
                        <div key={fidx} className={`flex-1 p-4 rounded-xl border ${fork.active ? 'border-brand-teal bg-brand-teal/10' : 'border-dashed bg-white'}`}>
                          <h5 className="text-[15px] font-bold text-slate-800 mb-1">{fork.title}</h5>
                          <p className="text-[13.5px] text-slate-500 m-0">
                            {fork.desc.split('→').map((part, i, arr) => (
                              <React.Fragment key={i}>
                                {part}
                                {i < arr.length - 1 && <span className="text-brand-teal font-extrabold mx-1">→</span>}
                              </React.Fragment>
                            ))}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Grid: What happens & Assets */}
                  <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] gap-8 mb-6">
                    
                    {/* What happens */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-teal mb-3">WHAT HAPPENS</h4>
                      <ol className="relative m-0 p-0 list-none" style={{ counterReset: 's' }}>
                        {stage.happens.map((item, hidx) => (
                          <li key={hidx} className="relative pl-[26px] pb-[11px] text-[15px] text-slate-700 before:content-[counter(s)] before:[counter-increment:s] before:absolute before:left-0 before:top-[1px] before:w-[17px] before:h-[17px] before:rounded-full before:bg-slate-100 before:text-slate-800 before:text-[10.5px] before:font-bold before:flex before:items-center before:justify-center">
                            {item}
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Assets */}
                    <div>
                      <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-brand-teal mb-3">ASSETS · TAP TO DEPLOY</h4>
                      <div className="flex flex-wrap gap-2">
                        {stage.assets.map(asset => (
                          <button key={asset.id} onClick={() => setActiveAsset(sopAssets.find(a => a.id === asset.id))} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-white hover:border-brand-teal hover:shadow-md hover:-translate-y-[1px] transition-all rounded-[8px] text-[12px] font-semibold text-slate-800 cursor-pointer group">
                            <span className="text-brand-teal font-extrabold">{asset.id}</span>
                            {asset.label}
                            <ArrowUpRight className="w-3 h-3 text-slate-300 group-hover:text-brand-teal ml-0.5" strokeWidth={3} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Scorecard Table (Stage 1) */}
                  {stage.scorecard && (
                    <div className="mt-2 mb-6 rounded-xl overflow-hidden bg-white">
                      <div className="bg-slate-800 text-white px-4.5 py-3.5 flex justify-between items-center flex-wrap gap-2">
                        <h5 className="text-[16px] font-bold m-0 pl-4">Healthmate Qualification — score each 1–5</h5>
                        <span className="text-[12.5px] text-teal-400 font-semibold pr-4">Ideal first Healthmate: 35+ / 50</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-[14px] border-collapse min-w-[500px]">
                          <thead>
                            <tr className="border-b">
                              <th className="py-2.5 px-4.5 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 pl-4">CRITERION</th>
                              <th className="py-2.5 px-4.5 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500">WHAT TO CHECK</th>
                              <th className="py-2.5 px-4.5 text-[11px] font-bold tracking-[0.08em] uppercase text-slate-500 text-center w-16 pr-4">SCORE</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {[
                              { c: 'Program relevance', w: 'Fits wellness, functional movement, or recovery' },
                              { c: 'Safety', w: 'Non-clinical, non-invasive, suitable for general users' },
                              { c: 'Experience quality', w: 'Meaningful, structured, memorable' },
                              { c: 'Facilitator credibility', w: 'Training, experience, reviews, or visible work' },
                              { c: 'Location quality', w: 'Venue is safe, accessible, calm, suitable' },
                              { c: 'Visual appeal', w: 'Markets well through photos and video' },
                              { c: 'Booking readiness', w: 'Has date, duration, price, inclusions, capacity' },
                              { c: 'Uniqueness', w: 'Adds something different to Lifed' },
                              { c: 'Corporate potential (internal)', w: 'Could adapt for employee wellbeing' },
                              { c: 'Repeatability', w: 'Can run monthly or quarterly' }
                            ].map((row, rIdx) => (
                              <tr key={rIdx}>
                                <td className="py-2.5 px-4.5 text-slate-800 pl-4">{row.c}</td>
                                <td className="py-2.5 px-4.5 text-slate-500">{row.w}</td>
                                <td className="py-2.5 px-4.5 text-brand-teal font-bold text-center pr-4">1–5</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="bg-slate-50 px-4.5 py-3 text-[13px] text-slate-800 font-semibold pl-4">
                        Proceed at 35+. Score 25–34 → develop and re-score. Below 25 → hold. A safety score of 1–2 is an automatic hold, whatever the total.
                      </div>
                    </div>
                  )}

                  {/* Stage Footer Meta */}
                  <div className="flex flex-wrap gap-x-10 gap-y-4 pt-4.5 border-t">
                    <div className="text-[13.5px] text-slate-700">
                      <b className="block font-bold text-[11.5px] tracking-[0.08em] uppercase text-slate-500 mb-0.5">OWNER</b>
                      {stage.owner}
                    </div>
                    <div className="text-[13.5px] text-slate-700">
                      <b className="block font-bold text-[11.5px] tracking-[0.08em] uppercase text-slate-500 mb-0.5">CHANNEL</b>
                      {stage.channel}
                    </div>
                    <div className="text-[13.5px] text-slate-700">
                      <b className="block font-bold text-[11.5px] tracking-[0.08em] uppercase text-brand-teal mb-0.5">{stage.nextLabel || 'NEXT'} →</b>
                      {stage.next}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Asset Modal */}
      {activeAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={() => setActiveAsset(null)}>
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="flex items-start justify-between p-6">
              <div>
                <div className="flex items-center gap-2 text-[11px] font-bold tracking-[0.1em] uppercase text-brand-teal mb-2">
                  <span>{activeAsset.id}</span>
                  {activeAsset.stage && <span className="w-1 h-1 rounded-full bg-slate-300"></span>}
                  {activeAsset.stage && <span>{activeAsset.stage}</span>}
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800">{activeAsset.name}</h3>
                <div className="flex items-center flex-wrap gap-2 mt-3">
                  {activeAsset.channel && <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px] font-bold uppercase tracking-wider">{activeAsset.channel}</span>}
                  {activeAsset.audience && <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[11px] font-bold uppercase tracking-wider">{activeAsset.audience}</span>}
                </div>
              </div>
              <button onClick={() => setActiveAsset(null)} className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-8">
              {activeAsset.purpose && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-2">Purpose</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{activeAsset.purpose}</p>
                </div>
              )}

              {activeAsset.copy && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Final copy · deploy this</h4>
                    <button onClick={handleCopy} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${copied ? 'bg-green-100 text-green-700' : 'bg-brand-teal text-white hover:bg-brand-teal/90'}`}>
                      {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1">
                    <textarea
                      value={editedCopies[activeAsset.id] ?? activeAsset.copy}
                      onChange={(e) => handleCopyChange(activeAsset.id, e.target.value)}
                      className="w-full bg-slate-50 rounded-xl p-5 text-sm text-slate-800 whitespace-pre-wrap font-medium outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal resize-y min-h-[150px] transition-colors"
                      rows={Math.max(5, (editedCopies[activeAsset.id] ?? activeAsset.copy).split('\n').length)}
                    />
                    {editedCopies[activeAsset.id] && editedCopies[activeAsset.id] !== activeAsset.copy && (
                      <div className="flex justify-end pr-1">
                        <button 
                          onClick={() => handleCopyChange(activeAsset.id, activeAsset.copy)} 
                          className="text-[10px] uppercase font-bold tracking-wider text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          Reset to default
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeAsset.cta && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-2">Call to action</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{activeAsset.cta}</p>
                </div>
              )}

              {activeAsset.design && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-2">Design / layout</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{activeAsset.design}</p>
                </div>
              )}

              {activeAsset.tone && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-2">Tone</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{activeAsset.tone}</p>
                </div>
              )}

              {activeAsset.avoid && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500 mb-2">What to avoid</h4>
                  <p className="text-sm text-rose-600 font-medium leading-relaxed">{activeAsset.avoid}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
