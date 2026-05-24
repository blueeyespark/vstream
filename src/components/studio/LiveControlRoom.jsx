import React, { useState } from "react";
import { MonitorUp, Play } from "lucide-react";

function InputBlock({ label, value, onChange }) {
  return (
    <label>
      <span className="mb-2 block text-xs font-black uppercase tracking-widest text-blue-100/42">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-xl border border-[#12305f] bg-[#03080f] px-3 py-2 text-sm text-white outline-none focus:border-[#00c8ff]" />
    </label>
  );
}

export default function LiveControlRoom({ streamForm, setStreamForm }) {
  const [activeScene, setActiveScene] = useState("Starting Soon");
  const [markers, setMarkers] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chat, setChat] = useState(["Welcome viewers as they arrive.", "Pin the stream rules before going live."]);
  const scenes = ["Starting Soon", "Main Camera", "Screen Share", "Guest Split", "BRB", "Outro"];

  const addMarker = () => setMarkers((current) => [`Marker ${current.length + 1} at ${new Date().toLocaleTimeString()}`, ...current]);
  const sendChat = () => {
    if (!chatInput.trim()) return;
    setChat((current) => [chatInput.trim(), ...current]);
    setChatInput("");
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <section className="rounded-2xl border p-4 bg-[#03080f]/72">
          <h3 className="font-black text-white">Stream Setup</h3>
          <div className="grid gap-4 md:grid-cols-2 mt-3">
            <InputBlock label="Stream title" value={streamForm.title} onChange={(title) => setStreamForm((current) => ({ ...current, title }))} />
            <InputBlock label="Category" value={streamForm.category} onChange={(category) => setStreamForm((current) => ({ ...current, category }))} />
          </div>
        </section>

        <section className="rounded-2xl border p-4 bg-[#03080f]/72">
          <h3 className="font-black text-white">Scenes and Sources</h3>
          <div className="grid gap-3 md:grid-cols-[220px_minmax(0,1fr)] mt-3">
            <div className="space-y-2">
              {scenes.map((scene) => (
                <button key={scene} onClick={() => setActiveScene(scene)} className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-black ${activeScene === scene ? "border-[#00c8ff] bg-[#00c8ff]/12 text-white" : "border-[#12305f] bg-[#03080f]/55 text-blue-100/55 hover:text-white"}`}>{scene}</button>
              ))}
            </div>
            <div className="grid min-h-[360px] place-items-center rounded-2xl border border-[#12305f] bg-[radial-gradient(circle_at_center,rgba(30,120,255,0.18),transparent_38%),#020712]">
              <div className="text-center">
                <Play className="mx-auto mb-4 h-10 w-10 text-[#00c8ff]" />
                <h3 className="text-2xl font-black text-white">{activeScene}</h3>
                <p className="mt-2 text-sm text-blue-100/48">Scene preview and source controls are staged here.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-5">
        <section className="rounded-2xl border p-4 bg-[#03080f]/72">
          <h3 className="font-black text-white">Chat Dock</h3>
          <div className="mb-3 space-y-2">
            {chat.slice(0, 4).map((item) => <div key={item} className="rounded-xl border border-[#12305f] bg-[#03080f]/55 p-3 text-sm text-blue-100/65">{item}</div>)}
          </div>
          <div className="flex gap-2">
            <input value={chatInput} onChange={(event) => setChatInput(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-[#12305f] bg-[#03080f] px-3 py-2 text-sm text-white outline-none" placeholder="Post to chat..." />
            <button onClick={sendChat} className="rounded-xl bg-[#1e78ff] px-3 py-2 text-sm font-black text-white">Send</button>
          </div>
        </section>

        <section className="rounded-2xl border p-4 bg-[#03080f]/72">
          <h3 className="font-black text-white">Markers and Clips</h3>
          <div className="space-y-2 mt-3">
            {markers.length ? markers.map((marker) => <p key={marker} className="rounded-xl border border-[#12305f] bg-[#03080f]/55 p-3 text-sm text-blue-100/65">{marker}</p>) : <p className="rounded-xl border border-dashed border-[#12305f] p-4 text-sm text-blue-100/42">No stream markers yet.</p>}
          </div>
        </section>
      </aside>
    </div>
  );
}
