import { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Send, CheckCircle2, User, Mail, Tv, Link2,
  FileText, BarChart2, Tag, Share2, Sparkles, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const CATEGORIES = [
  { id: "gaming", label: "Gaming" },
  { id: "variety", label: "Variety" },
  { id: "art", label: "Art & Creative" },
  { id: "music", label: "Music" },
  { id: "education", label: "Education" },
  { id: "lifestyle", label: "Lifestyle" },
  { id: "other", label: "Other" },
];

const Field = ({ label, icon: Icon, required, children }) => (
  <div>
    <label className="flex items-center gap-1.5 text-xs font-semibold text-blue-400/60 uppercase tracking-wider mb-2">
      <Icon className="w-3.5 h-3.5" />
      {label}
      {required && <span className="text-[#1e78ff]">*</span>}
    </label>
    {children}
  </div>
);

const inputClass = "w-full bg-[#0a1525]/80 border border-blue-900/40 rounded-xl px-4 py-2.5 text-sm text-[#c8dff5] placeholder-blue-400/20 outline-none focus:border-[#1e78ff]/50 transition-colors";

export default function Apply() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    channel_name: "",
    channel_url: "",
    portfolio_link: "",
    bio: "",
    content_category: "",
    avg_viewers: "",
    social_links: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.channel_name || !form.bio) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await base44.functions.invoke("submitTalentApplication", form);
      if (res.data?.success) {
        setSubmitted(true);
      } else if (res.data?.duplicate) {
        toast.error("An application with this email already exists.");
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } catch (err) {
      const msg = err?.response?.data?.error || "Submission failed. Please try again.";
      if (msg.includes("already exists")) {
        toast.error("An application with this email already exists.");
      } else {
        toast.error(msg);
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#030810] text-[#e8f4ff]">
      {/* Header */}
      <div className="border-b border-[#1e78ff]/20 bg-[#030810]/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-200 bg-blue-900/20 hover:bg-blue-900/30 border border-blue-900/40 rounded-lg px-3 py-1.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#1e78ff] to-[#a855f7] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-[#e8f4ff]">Talent Application</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── Success State ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1e78ff]/20 to-[#22c55e]/20 border border-[#22c55e]/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-9 h-9 text-[#22c55e]" />
              </div>
              <h2 className="text-3xl font-black mb-3 bg-gradient-to-r from-[#e8f4ff] to-[#22c55e] bg-clip-text text-transparent">
                Application Submitted!
              </h2>
              <p className="text-blue-400/60 text-sm max-w-md mx-auto mb-8 leading-relaxed">
                Thank you for applying! Our team has been notified and will review your application. We'll be in touch at <span className="text-[#1e78ff]">{form.email}</span>.
              </p>
              <div className="flex gap-3 justify-center">
                <Link to="/TalentNexus">
                  <Button variant="outline" className="gap-2">
                    <Tv className="w-4 h-4" /> View Talent Nexus
                  </Button>
                </Link>
                <Link to="/">
                  <Button className="gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Dashboard
                  </Button>
                </Link>
              </div>
            </motion.div>
          ) : (
            /* ── Form ── */
            <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
              {/* Hero */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 bg-[#1e78ff]/10 border border-[#1e78ff]/20 rounded-full px-4 py-1.5 text-xs font-semibold text-[#1e78ff] mb-4">
                  <Sparkles className="w-3 h-3" />
                  Join the Roster
                </div>
                <h1 className="text-4xl sm:text-5xl font-black mb-3 bg-gradient-to-r from-[#e8f4ff] via-[#1e78ff] to-[#a855f7] bg-clip-text text-transparent">
                  Apply as Talent
                </h1>
                <p className="text-blue-400/50 text-sm max-w-lg mx-auto leading-relaxed">
                  Ready to grow your audience on our platform? Fill out the application below and our team will review your profile.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6 bg-[#060d18]/60 border border-blue-900/30 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">

                {/* Personal Info */}
                <div>
                  <p className="text-xs font-bold text-[#1e78ff]/60 uppercase tracking-widest mb-4">Personal Info</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Full Name" icon={User} required>
                      <input
                        className={inputClass}
                        placeholder="Your real name"
                        value={form.full_name}
                        onChange={set("full_name")}
                      />
                    </Field>
                    <Field label="Email Address" icon={Mail} required>
                      <input
                        type="email"
                        className={inputClass}
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={set("email")}
                      />
                    </Field>
                  </div>
                </div>

                {/* Channel Info */}
                <div>
                  <div className="h-px bg-blue-900/20 mb-6" />
                  <p className="text-xs font-bold text-[#a855f7]/60 uppercase tracking-widest mb-4">Channel Details</p>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Channel Name" icon={Tv} required>
                        <input
                          className={inputClass}
                          placeholder="e.g. NightStreamCo"
                          value={form.channel_name}
                          onChange={set("channel_name")}
                        />
                      </Field>
                      <Field label="Average Viewers / Subscribers" icon={BarChart2}>
                        <input
                          className={inputClass}
                          placeholder="e.g. 500 avg viewers"
                          value={form.avg_viewers}
                          onChange={set("avg_viewers")}
                        />
                      </Field>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Channel URL" icon={Link2}>
                        <input
                          className={inputClass}
                          placeholder="https://youtube.com/..."
                          value={form.channel_url}
                          onChange={set("channel_url")}
                        />
                      </Field>
                      <Field label="Portfolio / Highlight Reel" icon={FileText}>
                        <input
                          className={inputClass}
                          placeholder="https://..."
                          value={form.portfolio_link}
                          onChange={set("portfolio_link")}
                        />
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Content Category */}
                <div>
                  <div className="h-px bg-blue-900/20 mb-6" />
                  <Field label="Primary Content Category" icon={Tag}>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, content_category: cat.id }))}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            form.content_category === cat.id
                              ? "bg-[#1e78ff]/20 border-[#1e78ff]/60 text-[#1e78ff]"
                              : "border-blue-900/30 text-blue-400/50 hover:border-blue-700/50 hover:text-blue-300"
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>

                {/* Bio */}
                <div>
                  <div className="h-px bg-blue-900/20 mb-6" />
                  <Field label="Short Bio / Why You Want to Join" icon={FileText} required>
                    <textarea
                      className={inputClass + " resize-none"}
                      placeholder="Tell us about yourself, your content style, and why you'd be a great fit..."
                      rows={5}
                      value={form.bio}
                      onChange={set("bio")}
                    />
                    <p className="text-xs text-blue-400/25 mt-1 text-right">{form.bio.length} / 1000</p>
                  </Field>
                </div>

                {/* Social Links */}
                <div>
                  <div className="h-px bg-blue-900/20 mb-6" />
                  <Field label="Additional Social Links" icon={Share2}>
                    <input
                      className={inputClass}
                      placeholder="Twitter, Instagram, TikTok... (comma separated)"
                      value={form.social_links}
                      onChange={set("social_links")}
                    />
                  </Field>
                </div>

                {/* Submit */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full h-12 bg-gradient-to-r from-[#1e78ff] to-[#a855f7] hover:opacity-90 border-0 text-white font-bold text-base gap-2 rounded-xl disabled:opacity-40 transition-opacity"
                  >
                    {submitting ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> Submitting Application...</>
                    ) : (
                      <><Send className="w-5 h-5" /> Submit Application</>
                    )}
                  </Button>
                  <p className="text-center text-xs text-blue-400/25 mt-3">
                    We review all applications within 3–5 business days.
                  </p>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}