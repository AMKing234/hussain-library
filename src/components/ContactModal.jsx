import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, X, Shield } from 'lucide-react';

export default function ContactModal({ isOpen, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const mailto = `mailto:abdulmalequeaby@gmail.com?subject=${encodeURIComponent(
      `[Hussain Library Inquiry] ${subject || 'General Request'}`
    )}&body=${encodeURIComponent(
      `From: ${name} (${email})\n\nMessage:\n${message}`
    )}`;
    window.location.href = mailto;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#F2EDFF] text-[#33216B] flex items-center justify-center mx-auto mb-2">
            <Mail className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#17143D]">Contact Library Desk</h2>
          <p className="text-xs text-slate-500 mt-1">
            Inquiries regarding book loans, donations, digital access, and research requests.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="font-bold text-slate-800 text-base">Opening Email Client...</h3>
            <p className="text-xs text-slate-500">Your message is being prepared for the Chief Librarian.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Reader Name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#17143D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Your Email Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#17143D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Digital Book Request or Circulation Query"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#17143D]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Message / Details *
              </label>
              <textarea
                required
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#17143D]"
              ></textarea>
            </div>

            <div className="bg-[#FAF8FC] p-3 rounded-xl border border-slate-200/60 text-[11px] text-slate-600 space-y-1">
              <div className="flex items-center gap-1.5 font-medium text-[#17143D]">
                <Shield className="w-3.5 h-3.5 text-[#D9A441]" />
                <span>Direct Administration Reach</span>
              </div>
              <p>Recipient: <strong>ABDUL MALEQUE</strong> (abdulmalequeaby@gmail.com)</p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#17143D] hover:bg-[#251f5c] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#17143D]/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4 text-[#D9A441]" />
              <span>Send Message</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
