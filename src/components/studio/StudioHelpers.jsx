import React from "react";
import { CheckCircle2 } from "lucide-react";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

export function MetricCard({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-2xl border border-[#12305f] bg-[#03080f]/72 p-4">
      <Icon className="mb-4 h-5 w-5 text-[#00c8ff]" />
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase tracking-widest text-blue-100/42">{label}</p>
      <p className="mt-2 text-xs text-blue-100/45">{detail}</p>
    </div>
  );
}

export function HeaderLine({ icon: Icon, title, action, onAction }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#00c8ff]" />
        <h2 className="font-black text-white">{title}</h2>
      </div>
      {action && (
        <button onClick={onAction} className="text-xs font-black text-[#00c8ff] hover:text-white">
          {action}
        </button>
      )}
    </div>
  );
}

export function InputBlock({ label, value, onChange }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-blue-100/42">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-[#12305f] bg-[#03080f] px-3 py-2 text-sm text-white outline-none focus:border-[#00c8ff]" />
    </label>
  );
}

export function StatusTile({ label, value, color }) {
  return (
    <div className="rounded-2xl border border-[#12305f] bg-[#03080f]/55 p-3">
      <p className={cx("text-xl font-black", color)}>{value}</p>
      <p className="text-xs font-black uppercase tracking-widest text-blue-100/38">{label}</p>
    </div>
  );
}

export default {
  MetricCard,
  HeaderLine,
  InputBlock,
  StatusTile,
};
