import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Hash,
  Heart,
  Megaphone,
  Mic2,
  MoreHorizontal,
  Pin,
  Radio,
  Search,
  Send,
  Shield,
  Smile,
  Sparkles,
  Users,
  Video,
  Volume2,
  Wand2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/AuthContext";
import VStreamAIAssistant from "@/components/ai/VStreamAIAssistant";

const communities = [
  { id: "world", name: "World Chat", short: "VS", status: "Public", description: "Global VStream lobby for viewers, creators, and live moments.", color: "from-[#1e78ff] to-[#00c8ff]" },
  { id: "creator-lab", name: "Creator Lab", short: "CL", status: "Creators", description: "Planning, growth, thumbnails, clips, and collaboration rooms.", color: "from-[#a855f7] to-[#1e78ff]" },
  { id: "artforge-circle", name: "ArtForge Circle", short: "AI", status: "AI Lab", description: "Prompt jams, asset reviews, and generative workflow critique.", color: "from-[#00c8ff] to-[#a855f7]" },
  { id: "blue-room", name: "Blue Room Radio", short: "BR", status: "Live", description: "Music, late-night streams, stage rooms, and community watch parties.", color: "from-red-500 to-[#a855f7]" },
];

const channelGroups = [
  {
    title: "Text Channels",
    channels: [
      { id: "world-chat", label: "world-chat", icon: Hash, unread: 18 },
      { id: "community-chat", label: "community-chat", icon: Hash, unread: 7 },
      { id: "live-stream-chat", label: "live-stream-chat", icon: Radio, live: true },
      { id: "creator-help", label: "creator-help", icon: Wand2 },
    ],
  },
  {
    title: "Broadcast",
    channels: [
      { id: "announcements", label: "announcements", icon: Megaphone, unread: 2 },
      { id: "events", label: "events", icon: CalendarDays },
      { id: "pinned-drops", label: "pinned-drops", icon: Pin },
    ],
  },
  {
    title: "Voice & Stage",
    channels: [
      { id: "stage-room", label: "stage-room", icon: Mic2, live: true },
      { id: "creator-lounge", label: "creator-lounge", icon: Volume2 },
      { id: "watch-party", label: "watch-party", icon: Video, live: true },
    ],
  },
];

const channelData = {
  "world-chat": {
    title: "world-chat",
    description: "Public VStream lobby for platform-wide conversation.",
    stats: [["Online", "24.8K"], ["Active threads", "128"], ["New today", "2.4K"]],
    pins: ["Welcome to VStream Communities.", "Keep creator feedback specific and kind.", "Use creator-help for production questions."],
    composer: "Message world-chat",
    messages: [
      message("VStream Guide", "@guide", "Mod", "STAFF", "Welcome to the public lobby. Use channels on the left to jump into live chat, events, or creator support.", "2 min ago", [["check", 31]], true),
      message("Creator Lab", "@creatorlab", "Creator Space", "DEMO", "Demo note: this hub uses organized VStream sample content until backend community messages are connected.", "6 min ago", [["spark", 18]]),
      message("Blue Room Radio", "@blueroom", "Creator", "LIVE", "Tonight's synth set moves into watch-party after the Neon City Finals recap.", "11 min ago", [["hype", 42], ["blue", 16]]),
    ],
    members: ["VStream Guide", "Creator Lab", "Blue Room Radio", "ArtForge Circle", "Neon City Finals"],
    events: ["Community welcome room", "Weekly platform Q&A", "Creator intro thread"],
  },
  "community-chat": {
    title: "community-chat",
    description: "Fan-server style discussion for VStream communities.",
    stats: [["Communities", "42"], ["Posts", "812"], ["Mods", "9"]],
    pins: ["Introduce your community before posting invites.", "Fan art and highlights belong here."],
    composer: "Message community-chat",
    messages: [
      message("VStream Guide", "@guide", "Mod", "STAFF", "Community spotlights rotate every Friday. Drop a concise pitch and one recent highlight.", "5 min ago", [["pin", 11]]),
      message("Neon City Finals", "@neonfinals", "Creator", "EVENT", "Our finals room is open for predictions, brackets, and co-watch planning.", "13 min ago", [["join", 27]]),
    ],
    members: ["VStream Guide", "Neon City Finals", "Creator Lab", "Fan Server Hosts"],
    events: ["Fan server spotlight", "Community mod roundtable"],
  },
  "live-stream-chat": {
    title: "live-stream-chat",
    description: "Live reactions, co-stream calls, and stream-room chat.",
    stats: [["Live rooms", "18"], ["Watching", "31.4K"], ["Co-streams", "6"]],
    pins: ["No stream spoilers without tags.", "Use watch-party for synchronized viewing."],
    composer: "React to the live stream",
    messages: [
      message("Blue Room Radio", "@blueroom", "Creator", "LIVE", "Going live after the finals with a recap set and open requests.", "Now", [["live", 88]], true),
      message("VStream Guide", "@guide", "Mod", "STAFF", "Live chat is public preview. Sign in to participate and save watch parties.", "1 min ago", [["check", 22]]),
    ],
    members: ["Blue Room Radio", "VStream Guide", "Neon City Finals", "Live Hosts"],
    events: ["Blue Room live set", "Neon City postgame"],
  },
  "creator-help": {
    title: "creator-help",
    description: "Creator-first support for videos, clips, growth, thumbnails, and workflows.",
    stats: [["Open asks", "34"], ["Solved today", "19"], ["Creators", "1.2K"]],
    pins: ["Share one clear question per thread.", "Creator Studio and ArtForge AI require sign-in."],
    composer: "Ask for creator help",
    messages: [
      message("Creator Lab", "@creatorlab", "Creator Space", "DEMO", "Upload cadence tip: one live recap, three clips, one community post within the first hour.", "8 min ago", [["tip", 39]], true),
      message("ArtForge Circle", "@artforge", "Creator Space", "AI", "For thumbnails, test two readable words max and keep the face/object contrast high.", "16 min ago", [["save", 21]]),
    ],
    members: ["Creator Lab", "ArtForge Circle", "VStream Guide", "Growth Mentors"],
    events: ["Creator office hours", "Thumbnail review room"],
  },
  announcements: {
    title: "announcements",
    description: "Official VStream updates and community notices.",
    stats: [["Updates", "12"], ["Pinned", "4"], ["Audience", "Public"]],
    pins: ["Creator tools are locked behind login.", "Communities public preview is live."],
    composer: "Announcements are read-only in demo mode",
    messages: [
      message("VStream Guide", "@guide", "Mod", "STAFF", "Communities now support server and channel switching with channel-specific sample content.", "Today", [["new", 44]], true),
      message("Creator Lab", "@creatorlab", "Creator Space", "DEMO", "Creator Studio and ArtForge AI links redirect guests to sign in with a return URL.", "Today", [["lock", 28]]),
    ],
    members: ["VStream Guide", "Creator Lab"],
    events: ["Product notes", "Creator onboarding"],
  },
  events: {
    title: "events",
    description: "Scheduled rooms, watch parties, stage sessions, and creator events.",
    stats: [["Today", "3"], ["This week", "11"], ["Hosts", "7"]],
    pins: ["Events are demo data until backend scheduling is connected."],
    composer: "Suggest an event",
    messages: [
      message("Neon City Finals", "@neonfinals", "Creator", "EVENT", "Watch party opens at 8 PM with a live prediction thread.", "Today", [["going", 72]], true),
      message("ArtForge Circle", "@artforge", "Creator Space", "AI", "Prompt sprint: glass oceans, electric weather, impossible camera move.", "Tomorrow", [["remix", 64]]),
    ],
    members: ["Neon City Finals", "ArtForge Circle", "Blue Room Radio"],
    events: ["Neon City Finals Watch Party", "ArtForge Prompt Sprint", "Creator Lab Q&A"],
  },
  "pinned-drops": {
    title: "pinned-drops",
    description: "Important links, creator drops, and evergreen community resources.",
    stats: [["Resources", "18"], ["Creator drops", "5"], ["Saved", "Demo"]],
    pins: ["Starter guide: set up your first channel.", "ArtForge prompt pack: cinematic thumbnails."],
    composer: "Share a useful drop",
    messages: [
      message("VStream Guide", "@guide", "Mod", "STAFF", "Pinned drop: community rules, creator onboarding, and live room etiquette.", "Today", [["pin", 55]], true),
      message("Creator Lab", "@creatorlab", "Creator Space", "DEMO", "Template drop: stream recap checklist for shorts and long-form edits.", "Yesterday", [["save", 33]]),
    ],
    members: ["VStream Guide", "Creator Lab", "ArtForge Circle"],
    events: ["Resource refresh", "Template review"],
  },
  "stage-room": {
    title: "stage-room",
    description: "Live audio stage for hosted creator conversations.",
    stats: [["Speakers", "4"], ["Listeners", "1.8K"], ["Status", "Live"]],
    pins: ["Raise hand to join the stage.", "Stage room is demo-only until voice backend is connected."],
    composer: "Post a stage question",
    messages: [
      message("VStream Guide", "@guide", "Mod", "STAFF", "Stage topic: how to turn live moments into repeatable community rituals.", "Now", [["question", 19]], true),
      message("Blue Room Radio", "@blueroom", "Creator", "LIVE", "I can talk through how we plan setlists around chat energy.", "Now", [["stage", 22]]),
    ],
    members: ["VStream Guide", "Blue Room Radio", "Creator Lab", "Listeners"],
    events: ["Live stage Q&A"],
  },
  "creator-lounge": {
    title: "creator-lounge",
    description: "Casual voice lounge for creators and collaborators.",
    stats: [["In lounge", "14"], ["Open tables", "3"], ["Mode", "Voice"]],
    pins: ["Keep rooms small and focused.", "Use creator-help for written support."],
    composer: "Leave a lounge note",
    messages: [
      message("Creator Lab", "@creatorlab", "Creator Space", "DEMO", "Lounge table 2 is talking sponsor decks and analytics screenshots.", "4 min ago", [["join", 12]], true),
      message("VStream Guide", "@guide", "Mod", "STAFF", "Voice is represented as demo context until realtime voice is wired.", "6 min ago", [["note", 8]]),
    ],
    members: ["Creator Lab", "VStream Guide", "Growth Mentors"],
    events: ["Open creator lounge"],
  },
  "watch-party": {
    title: "watch-party",
    description: "Synchronized viewing rooms for live events and community premieres.",
    stats: [["Rooms", "5"], ["Watching", "9.6K"], ["Premieres", "2"]],
    pins: ["Watch parties are public preview.", "Sign in to start or save a room."],
    composer: "React in watch-party",
    messages: [
      message("Neon City Finals", "@neonfinals", "Creator", "EVENT", "Room A is synced to the finals opener. Room B is running creator commentary.", "Now", [["watch", 91]], true),
      message("Blue Room Radio", "@blueroom", "Creator", "LIVE", "Afterparty playlist is queued for the postgame watch room.", "2 min ago", [["music", 37]]),
    ],
    members: ["Neon City Finals", "Blue Room Radio", "Watch Party Hosts"],
    events: ["Finals co-watch", "Blue Room afterparty"],
  },
};

function message(author, handle, role, badge, content, time, reactions = [], pinned = false) {
  return { id: `${author}-${time}-${content.slice(0, 8)}`, author, handle, role, badge, content, time, reactions: reactions.map(([label, count]) => ({ label, count })), pinned, online: badge === "LIVE" || badge === "STAFF" };
}

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function roleClass(role) {
  if (role === "Mod") return "border-[#a855f7]/40 bg-[#a855f7]/15 text-purple-100";
  if (role === "Creator" || role === "Creator Space") return "border-[#00c8ff]/40 bg-[#00c8ff]/12 text-cyan-100";
  return "border-blue-300/18 bg-blue-300/8 text-blue-100/75";
}

function ServerSidebar({ activeCommunity, onSelectCommunity }) {
  return (
    <aside className="flex w-full gap-2 overflow-x-auto border-b border-[#12305f] bg-[#03080f]/94 p-3 lg:w-20 lg:flex-col lg:border-b-0 lg:border-r lg:py-4">
      {communities.map((community) => {
        const active = activeCommunity === community.id;
        return (
          <button key={community.id} onClick={() => onSelectCommunity(community.id)} title={community.name} className={cx("relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-sm font-black text-white transition-all", community.color, active ? "rounded-xl ring-2 ring-[#00c8ff]/70" : "opacity-75 hover:rounded-xl hover:opacity-100")}>
            <span>{community.short}</span>
            {community.status === "Live" && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[#03080f] bg-red-500" />}
          </button>
        );
      })}
      <div className="hidden h-px w-10 bg-[#12305f] lg:block" />
      <Link to="/CreatorStudio" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#12305f] bg-[#06101f] text-blue-200/70 transition hover:border-[#00c8ff]/60 hover:text-white" title="Create community">
        <Sparkles className="h-5 w-5" />
      </Link>
    </aside>
  );
}

function ChannelList({ activeChannel, setActiveChannel, community }) {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-[#12305f] bg-[#06101f]/86 lg:flex lg:flex-col">
      <div className="border-b border-[#12305f] p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg font-black text-white">{community.name}</p>
            <p className="mt-1 text-xs leading-5 text-blue-100/52">{community.description}</p>
          </div>
          <button className="rounded-xl p-2 text-blue-200/50 transition hover:bg-[#1e78ff]/12 hover:text-white"><MoreHorizontal className="h-4 w-4" /></button>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#12305f] bg-[#03080f]/70 px-3 py-2">
          <Search className="h-4 w-4 text-blue-300/38" />
          <span className="text-xs text-blue-200/40">Search {community.name}</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {channelGroups.map((group) => (
          <div key={group.title} className="mb-4">
            <div className="mb-1 flex items-center gap-1 px-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-300/38">
              <ChevronDown className="h-3 w-3" /> {group.title}
            </div>
            <div className="space-y-1">
              {group.channels.map((channel) => {
                const Icon = channel.icon;
                const active = activeChannel === channel.id;
                return (
                  <button key={channel.id} onClick={() => setActiveChannel(channel.id)} className={cx("group flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition", active ? "bg-[#1e78ff]/22 text-white shadow-[inset_3px_0_0_#00c8ff]" : "text-blue-100/58 hover:bg-[#1e78ff]/10 hover:text-white")}>
                    <Icon className={cx("h-4 w-4", channel.live ? "text-red-300" : active ? "text-[#00c8ff]" : "text-blue-300/52")} />
                    <span className="min-w-0 flex-1 truncate text-left">{channel.label}</span>
                    {channel.unread && !active && <span className="rounded-full bg-[#00c8ff] px-1.5 py-0.5 text-[10px] font-black text-[#03080f]">{channel.unread}</span>}
                    {channel.live && <span className="h-2 w-2 rounded-full bg-red-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[#12305f] p-3">
        <Link to="/CreatorStudio" className="flex items-center gap-3 rounded-2xl border border-[#00c8ff]/25 bg-[#00c8ff]/10 p-3 transition hover:bg-[#00c8ff]/15">
          <Shield className="h-5 w-5 text-[#00c8ff]" />
          <div className="min-w-0">
            <p className="text-sm font-black text-white">Creator spaces</p>
            <p className="truncate text-xs text-blue-100/48">Tools, fans, events, drops</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}

function ChatHeader({ channelData: data, community }) {
  return (
    <header className="border-b border-[#12305f] bg-[#06101f]/78 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Hash className="h-5 w-5 text-[#00c8ff]" />
            <h1 className="truncate text-lg font-black text-white">{data.title}</h1>
            <span className="hidden rounded-full border border-[#00c8ff]/35 bg-[#00c8ff]/10 px-2 py-1 text-[10px] font-black uppercase tracking-widest text-[#00c8ff] sm:inline-flex">{community.status}</span>
          </div>
          <p className="mt-1 truncate text-xs text-blue-100/48">{data.description}</p>
        </div>
        <div className="flex items-center gap-1">
          {[Pin, Bell, Users].map((Icon, index) => (
            <button key={index} className="rounded-xl p-2 text-blue-200/52 transition hover:bg-[#1e78ff]/12 hover:text-white"><Icon className="h-4 w-4" /></button>
          ))}
        </div>
      </div>
    </header>
  );
}

function PinnedStrip({ pins }) {
  return (
    <div className="border-b border-[#12305f] bg-[#03080f]/76 px-4 py-3">
      <div className="flex gap-3 overflow-x-auto">
        {pins.map((pin) => (
          <div key={pin} className="flex shrink-0 items-center gap-2 rounded-full border border-yellow-300/20 bg-yellow-300/8 px-3 py-1.5 text-xs font-bold text-yellow-100/82">
            <Pin className="h-3.5 w-3.5" /> {pin}
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageList({ messages }) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-5">
      <div className="mx-auto max-w-4xl space-y-4">
        {messages.map((msg, index) => (
          <motion.article key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} className={cx("rounded-2xl border bg-[#06101f]/72 p-4 transition hover:border-[#00c8ff]/35 hover:bg-[#08172d]/82", msg.pinned ? "border-yellow-300/25" : "border-[#12305f]/65")}>
            <div className="flex gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-sm font-black text-white">
                {msg.author.slice(0, 1)}
                <span className={cx("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#06101f]", msg.online ? "bg-emerald-400" : "bg-slate-500")} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-black text-white">{msg.author}</p>
                  <span className={cx("rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-widest", roleClass(msg.role))}>{msg.role}</span>
                  {msg.badge && <span className="rounded-full bg-[#1e78ff]/18 px-2 py-0.5 text-[10px] font-black text-[#00c8ff]">{msg.badge}</span>}
                  <span className="text-xs text-blue-300/36">{msg.handle}</span>
                  <span className="text-xs text-blue-300/30">{msg.time}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-blue-50/78">{msg.content}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {msg.reactions.map((reaction) => (
                    <button key={reaction.label} className="rounded-full border border-[#12305f] bg-[#03080f]/70 px-2.5 py-1 text-xs font-bold text-blue-100/70 transition hover:border-[#00c8ff]/45 hover:text-white">{reaction.label} {reaction.count}</button>
                  ))}
                  <button className="rounded-full border border-[#12305f] bg-[#03080f]/70 px-2.5 py-1 text-xs font-bold text-blue-100/48 transition hover:border-[#00c8ff]/45 hover:text-white">
                    <Heart className="mr-1 inline h-3.5 w-3.5" /> react
                  </button>
                </div>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function Composer({ user, channelData: data, onSend }) {
  const [value, setValue] = useState("");
  const locked = !user?.email;
  return (
    <form onSubmit={(event) => { event.preventDefault(); if (!locked && value.trim()) onSend(value.trim()); setValue(""); }} className="border-t border-[#12305f] bg-[#06101f]/92 p-4">
      <div className="mx-auto max-w-4xl">
        {locked && (
          <div className="mb-3 rounded-2xl border border-[#1e78ff]/25 bg-[#1e78ff]/10 px-4 py-3 text-sm text-blue-100/72">
            You can preview public communities. Sign in to send messages, react, or create watch parties.
            <Link to="/login?from_url=%2FCommunities" className="ml-2 font-black text-[#00c8ff] hover:text-white">Sign in</Link>
          </div>
        )}
        <div className={cx("flex items-center gap-3 rounded-2xl border px-4 py-3", locked ? "border-[#12305f] bg-[#03080f]/70 opacity-75" : "border-[#1e78ff]/30 bg-[#03080f]/78")}>
          <Smile className="h-5 w-5 text-blue-200/45" />
          <input value={value} onChange={(event) => setValue(event.target.value)} disabled={locked} placeholder={locked ? "Sign in to join this channel" : data.composer} className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-blue-300/35 disabled:cursor-not-allowed" />
          <button disabled={locked || !value.trim()} className="rounded-xl bg-[#1e78ff] p-2 text-white transition hover:bg-[#00a6ff] disabled:cursor-not-allowed disabled:opacity-45"><Send className="h-4 w-4" /></button>
        </div>
      </div>
    </form>
  );
}

function MemberRail({ data, embedded = false }) {
  return (
    <aside className={embedded ? "flex min-h-0 flex-1 flex-col" : "hidden w-72 shrink-0 border-l border-[#12305f] bg-[#06101f]/86 xl:flex xl:flex-col"}>
      <div className="border-b border-[#12305f] p-4">
        <p className="text-sm font-black text-white">Channel Context</p>
        <p className="mt-1 text-xs text-blue-100/45">{data.members.length} demo members visible</p>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        <p className="mb-2 px-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-300/38">Members</p>
        <div className="mb-5 space-y-1">
          {data.members.map((member, index) => (
            <div key={member} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-[#1e78ff]/10">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1e78ff] to-[#a855f7] text-xs font-black text-white">
                {member.slice(0, 1)}
                <span className={cx("absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[#06101f]", index < 2 ? "bg-emerald-400" : "bg-slate-500")} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-black text-blue-50">{member}</p>
                <p className="text-[11px] text-blue-300/42">{index < 2 ? "Online" : "Demo member"}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mb-2 px-2 text-[11px] font-black uppercase tracking-[0.18em] text-blue-300/38">Events</p>
        <div className="space-y-2">
          {data.events.map((event) => (
            <div key={event} className="rounded-2xl border border-[#12305f]/65 bg-[#03080f]/62 p-3">
              <span className="rounded-full bg-[#00c8ff]/12 px-2 py-0.5 text-[10px] font-black text-[#00c8ff]">Demo</span>
              <p className="mt-2 text-xs font-black leading-5 text-white">{event}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export default function WorldChat() {
  const { user } = useAuth();
  const [activeCommunity, setActiveCommunity] = useState("world");
  const [activeChannel, setActiveChannel] = useState("world-chat");
  const [localMessages, setLocalMessages] = useState({});

  const community = communities.find((item) => item.id === activeCommunity) || communities[0];
  const data = channelData[activeChannel] || channelData["world-chat"];
  const flatChannels = useMemo(() => channelGroups.flatMap((group) => group.channels), []);
  const messages = [...data.messages, ...(localMessages[activeChannel] || [])];

  const handleCommunitySelect = (communityId) => {
    setActiveCommunity(communityId);
    if (communityId === "blue-room") setActiveChannel("live-stream-chat");
    if (communityId === "creator-lab") setActiveChannel("creator-help");
    if (communityId === "artforge-circle") setActiveChannel("pinned-drops");
    if (communityId === "world") setActiveChannel("world-chat");
  };

  const handleSend = (content) => {
    const next = {
      id: `local-${activeChannel}-${Date.now()}`,
      author: user?.full_name || "You",
      handle: user?.email ? `@${user.email.split("@")[0]}` : "@you",
      role: "Member",
      online: true,
      content,
      time: "Just now",
      reactions: [],
    };
    setLocalMessages((current) => ({ ...current, [activeChannel]: [...(current[activeChannel] || []), next] }));
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#03080f] text-[#e8f4ff]">
      <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(30,120,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(30,120,255,0.06)_1px,transparent_1px)] bg-[size:42px_42px]" />
      <div className="flex min-h-[calc(100vh-4rem)] flex-col overflow-hidden border-y border-[#12305f]/60 lg:flex-row">
        <ServerSidebar activeCommunity={activeCommunity} onSelectCommunity={handleCommunitySelect} />
        <ChannelList activeChannel={activeChannel} setActiveChannel={setActiveChannel} community={community} />
        <main className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-[#12305f] bg-[#03080f]/90 px-4 py-3 lg:hidden">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#00c8ff]">Communities</p>
                <p className="text-lg font-black text-white">{community.name}</p>
              </div>
              <Link to="/CreatorStudio" className="rounded-xl border border-[#00c8ff]/30 bg-[#00c8ff]/10 p-2 text-[#00c8ff]"><Sparkles className="h-4 w-4" /></Link>
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {flatChannels.map((item) => (
                <button key={item.id} onClick={() => setActiveChannel(item.id)} className={cx("shrink-0 rounded-full border px-3 py-1.5 text-xs font-black", activeChannel === item.id ? "border-[#00c8ff] bg-[#00c8ff]/14 text-white" : "border-[#12305f] bg-[#06101f] text-blue-200/58")}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <ChatHeader channelData={data} community={community} />
          <PinnedStrip pins={data.pins} />
          <div className="border-b border-[#12305f] bg-[#06101f]/55 px-4 py-3">
            <div className="mx-auto grid max-w-4xl gap-3 md:grid-cols-3">
              {data.stats.map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-[#12305f]/65 bg-[#03080f]/58 p-3">
                  <p className="text-lg font-black text-white">{value}</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-blue-300/42">{label}</p>
                </div>
              ))}
            </div>
          </div>
          <MessageList messages={messages} />
          <Composer user={user} channelData={data} onSend={handleSend} />
        </main>
        <aside className="hidden w-72 shrink-0 border-l border-[#12305f] bg-[#06101f]/86 xl:flex xl:flex-col">
          <div className="border-b border-[#12305f] p-3">
            <VStreamAIAssistant
              surface="compact"
              contextType="communities"
              context={{
                title: data.title,
                description: data.description,
                pins: data.pins,
                members: data.members,
                actions: ["Moderation scan", "Conversation prompt", "Event idea", "Pinned message"],
              }}
              onApply={(text) => handleSend(text.split("\n")[0])}
            />
          </div>
          <MemberRail data={data} embedded />
        </aside>
      </div>
    </div>
  );
}
