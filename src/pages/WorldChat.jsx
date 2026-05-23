import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { 
  MessageSquare, Users, Headphones, Send, Hash, Plus, X, Volume2, Smile, Search, MoreVertical, UserPlus, LogOut, Bell, Ban, Reply, Heart, Laugh, ThumbsUp
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

export default function WorldChat() {
  const { user: authUser } = useAuth();
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [selectedServer, setSelectedServer] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [userStatus, setUserStatus] = useState("online");
  const [voiceActive, setVoiceActive] = useState(false);
  const [showCreateServer, setShowCreateServer] = useState(false);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [hoveredUser, setHoveredUser] = useState(null);
  const [selectedDMUser, setSelectedDMUser] = useState(null);
  const [threadingMessageId, setThreadingMessageId] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [mutedUsers, setMutedUsers] = useState(new Set());
  const [bannedUsers, setBannedUsers] = useState(new Set());
  const [userRoles, setUserRoles] = useState({});
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState("");
  const [pinnedMessages, setPinnedMessages] = useState(new Set());
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());

  useEffect(() => {
    setUser(authUser);
  }, [authUser]);

  const [servers, setServers] = useState([
    { id: 1, name: "Global", icon: "🌍", banner: "🌐", description: "Global community", channels: [
      { id: 1, name: "general", type: "text", description: "Main discussion", category: "Text Channels" },
      { id: 2, name: "announcements", type: "text", description: "Important updates", category: "Text Channels" },
      { id: 3, name: "lounge", type: "voice", description: "Casual chat", category: "Voice Channels" }
    ]},
    { id: 2, name: "Gaming", icon: "🎮", banner: "🕹️", description: "Gaming hub", channels: [
      { id: 4, name: "games", type: "text", description: "Gaming talk", category: "Text Channels" },
      { id: 5, name: "gaming-voice", type: "voice", description: "Game sessions", category: "Voice Channels" }
    ]},
    { id: 3, name: "Creative", icon: "🎨", banner: "🖌️", description: "Creative space", channels: [
      { id: 6, name: "art-showcase", type: "text", description: "Share artwork", category: "Text Channels" },
      { id: 7, name: "creative-chat", type: "voice", description: "Creative collab", category: "Voice Channels" }
    ]}
  ]);

  const [allMessages, setAllMessages] = useState([
    { id: 1, author: "Luna", avatar: "🌙", content: "Welcome to World Chat! 🌎", timestamp: new Date(Date.now() - 5*60000), reactions: {}, replies: [], edited: false, role: "moderator" },
    { id: 2, author: "Nova", avatar: "⭐", content: "/poll What's your favorite feature?", timestamp: new Date(Date.now() - 3*60000), reactions: {}, replies: [], edited: false, role: "member" },
  ]);

  const roleColors = {
    admin: "text-red-400",
    moderator: "text-purple-400",
    member: "text-white"
  };

  const [dmConversations, setDmConversations] = useState({
    "Luna": [
      { id: 1, author: "Luna", content: "Hey there!", timestamp: new Date(Date.now() - 10*60000) },
      { id: 2, author: "You", content: "Hi Luna!", timestamp: new Date(Date.now() - 9*60000) },
    ]
  });

  const [onlineUsers] = useState([
    { id: 1, name: "Luna", status: "online", avatar: "🌙", role: "member", activity: "Chatting" },
    { id: 2, name: "Nova", status: "online", avatar: "⭐", role: "moderator", activity: "Moderating" },
    { id: 3, name: "Phoenix", status: "idle", avatar: "🔥", role: "member", activity: "Away" },
    { id: 4, name: "Echo", status: "dnd", avatar: "🎤", role: "member", activity: "In Voice" },
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !user) return;

    if (editingMessageId) {
      setAllMessages(prev => prev.map(m => m.id === editingMessageId ? { ...m, content: editingMessageText, edited: true } : m));
      setEditingMessageId(null);
      setEditingMessageText("");
    } else {
      const newMessage = {
        id: allMessages.length + 1,
        author: user.full_name || "You",
        avatar: user.full_name?.charAt(0).toUpperCase() || "?",
        content: messageInput,
        timestamp: new Date(),
        userId: user.email,
        reactions: {},
        replies: [],
        parentId: threadingMessageId,
        edited: false,
        role: "member"
      };
      setAllMessages([...allMessages, newMessage]);
    }
    setMessageInput("");
    setThreadingMessageId(null);
  };

  const addReaction = (messageId, emoji) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: { ...prev[messageId], [emoji]: (prev[messageId]?.[emoji] || 0) + 1 }
    }));
  };

  const handleModerationAction = (action, targetUser) => {
    if (action === "mute") {
      setMutedUsers(prev => new Set([...prev, targetUser]));
      toast.info(`${targetUser} muted`);
    } else if (action === "ban") {
      setBannedUsers(prev => new Set([...prev, targetUser]));
      toast.info(`${targetUser} banned`);
    } else if (action === "kick") {
      toast.info(`${targetUser} kicked`);
    }
  };

  const activeServer = servers.find(s => s.id === selectedServer) || servers[0];
  const activeChannel = activeServer?.channels.find(c => c.id === selectedChannel) || activeServer?.channels[0];

  useEffect(() => {
    setSelectedServer(servers[0].id);
    setSelectedChannel(servers[0].channels[0].id);
  }, []);

  const statusColors = {
    online: "bg-green-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
    offline: "bg-gray-500"
  };

  const [showServerList, setShowServerList] = useState(true);
  const [showMembersList, setShowMembersList] = useState(false);

  return (
    <div className="min-h-screen bg-[#36393f] text-white flex flex-col md:flex-row">
      {/* Server List - Hidden on mobile by default */}
      <aside className={`${showServerList ? "flex" : "hidden"} md:flex w-full md:w-20 bg-[#2c2f33] border-r border-[#202225] flex-col items-center py-4 gap-3`}>
        {servers.map(server => (
          <button
            key={server.id}
            onClick={() => {
              setSelectedServer(server.id);
              setSelectedChannel(server.channels[0].id);
            }}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold transition-all ${
              selectedServer === server.id
                ? "bg-[#5865f2] ring-2 ring-white"
                : "bg-[#36393f] hover:bg-[#5865f2]"
            }`}
            title={server.name}
          >
            {server.icon}
          </button>
        ))}
        <div className="h-px bg-[#202225] w-8 my-2" />
        <button
          onClick={() => setShowCreateServer(true)}
          className="w-12 h-12 rounded-full flex items-center justify-center bg-[#36393f] hover:bg-green-500 transition-all text-xl"
          title="Create Server"
        >
          <Plus className="w-6 h-6" />
        </button>
      </aside>

      {/* Channel List - Hidden on mobile */}
      <aside className="hidden md:flex w-60 bg-[#2f3136] border-r border-[#202225] flex-col">
        <div className="h-16 border-b border-[#202225] px-4 flex items-center justify-between bg-[#36393f]">
          <h2 className="font-bold text-white">{activeServer?.name}</h2>
          <button className="text-[#72767d] hover:text-white">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2 px-2">
          {["Text Channels", "Voice Channels"].map(category => {
            const categoryChannels = activeServer?.channels.filter(c => c.category === category) || [];
            if (categoryChannels.length === 0) return null;
            const isCollapsed = collapsedCategories.has(category);
            return (
              <div key={category}>
                <button
                  onClick={() => setCollapsedCategories(prev => {
                    const next = new Set(prev);
                    isCollapsed ? next.delete(category) : next.add(category);
                    return next;
                  })}
                  className="w-full flex items-center gap-1 px-2 py-1 text-xs font-bold text-[#72767d] hover:text-white transition-colors uppercase"
                >
                  <span>{isCollapsed ? "▶" : "▼"}</span>
                  {category}
                </button>
                {!isCollapsed && categoryChannels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => setSelectedChannel(channel.id)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded text-sm transition-all ml-2 ${
                      selectedChannel === channel.id
                        ? "bg-[#36393f] text-white"
                        : "text-[#99aab5] hover:text-white hover:bg-[#2c2f33]"
                    }`}
                    title={channel.description}
                  >
                    {channel.type === "voice" ? <Headphones className="w-4 h-4" /> : <Hash className="w-4 h-4" />}
                    <span>{channel.name}</span>
                    {channel.type === "voice" && voiceActive && selectedChannel === channel.id && (
                      <Volume2 className="w-3 h-3 ml-auto text-green-500 animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            );
          })}
        </div>

        <div className="h-14 border-t border-[#202225] bg-[#292b2f] px-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setShowUserProfile(true)}>
            <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-xs font-bold">
              {user?.full_name?.charAt(0) || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name || "Guest"}</p>
              <p className="text-xs text-[#72767d]">{userStatus}</p>
            </div>
          </div>
          <button onClick={() => logout('/login')} className="text-[#72767d] hover:text-white">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-h-screen md:min-h-auto">
        <div className="h-16 border-b border-[#202225] px-3 md:px-6 flex items-center justify-between bg-[#36393f]">
          {/* Mobile: Toggle server/members */}
          <button onClick={() => setShowServerList(!showServerList)} className="md:hidden text-[#72767d] hover:text-white">
            <Users className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${statusColors[userStatus]}`} />
            <h1 className="text-xl font-bold">
              {activeChannel?.type === "voice" ? "🎤" : "#"} {activeChannel?.name}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[#72767d] hover:text-white">
              <Bell className="w-5 h-5" />
            </button>
            <button className="text-[#72767d] hover:text-white">
              <Search className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-3 md:px-6 py-4 space-y-2 mb-16 md:mb-0">
          {allMessages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 group hover:bg-[#36393f]/50 px-3 py-1 rounded ${threadingMessageId === msg.id ? "ring-2 ring-[#5865f2]" : ""} ${pinnedMessages.has(msg.id) ? "border-l-4 border-yellow-500" : ""}`}
            >
              <div className="w-10 h-10 rounded-full bg-[#5865f2] flex items-center justify-center text-sm font-bold flex-shrink-0">
                {msg.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className={`font-semibold ${msg.role ? roleColors[msg.role] : "text-white"}`}>{msg.author}</p>
                  {msg.role && msg.role !== "member" && <span className="text-xs bg-[#5865f2]/30 px-1.5 rounded">{msg.role}</span>}
                  <p className="text-xs text-[#72767d]">{msg.timestamp.toLocaleTimeString()}</p>
                  {msg.edited && <p className="text-xs text-[#72767d] italic">(edited)</p>}
                </div>
                {editingMessageId === msg.id ? (
                  <input
                    type="text"
                    value={editingMessageText}
                    onChange={(e) => setEditingMessageText(e.target.value)}
                    className="w-full bg-[#40444b] text-white px-2 py-1 rounded text-sm mb-1"
                    autoFocus
                  />
                ) : (
                  <p className="text-[#dbdee1] break-words">{msg.content}</p>
                )}
                
                {/* Reactions */}
                <div className="flex gap-1 mt-1 flex-wrap">
                  {Object.entries(messageReactions[msg.id] || {}).map(([emoji, count]) => (
                    <button key={emoji} className="text-xs bg-[#40444b] hover:bg-[#5865f2] px-2 py-1 rounded-full">
                      {emoji} {count}
                    </button>
                  ))}
                </div>

                {/* Message Actions */}
                <div className="flex gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity flex-wrap">
                  <button onClick={() => addReaction(msg.id, "👍")} className="text-[#72767d] hover:text-white text-xs">
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button onClick={() => addReaction(msg.id, "❤️")} className="text-[#72767d] hover:text-white text-xs">
                    <Heart className="w-4 h-4" />
                  </button>
                  <button onClick={() => setThreadingMessageId(msg.id)} className="text-[#72767d] hover:text-white text-xs">
                    <Reply className="w-4 h-4" />
                  </button>
                  <button onClick={() => { setEditingMessageId(msg.id); setEditingMessageText(msg.content); }} className="text-[#72767d] hover:text-white text-xs">
                    ✏️
                  </button>
                  <button onClick={() => setPinnedMessages(prev => prev.has(msg.id) ? new Set([...prev].filter(id => id !== msg.id)) : new Set([...prev, msg.id]))} className={`text-xs ${pinnedMessages.has(msg.id) ? "text-yellow-500" : "text-[#72767d] hover:text-white"}`}>
                    📌
                  </button>
                  <button onClick={() => addReaction(msg.id, "😂")} className="text-[#72767d] hover:text-white text-xs">
                    <Laugh className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="px-3 md:px-6 py-2 md:py-4 border-t border-[#202225] bg-[#36393f] space-y-2 fixed md:static bottom-16 md:bottom-auto left-0 right-0 md:left-auto md:right-auto">
          {threadingMessageId && (
            <div className="flex items-center gap-2 text-xs text-[#72767d] bg-[#40444b] px-3 py-1.5 rounded">
              <Reply className="w-3 h-3" />
              <span>Replying in thread</span>
              <button type="button" onClick={() => setThreadingMessageId(null)} className="ml-auto">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-3 bg-[#40444b] rounded-lg px-4 py-2.5">
            <button type="button" className="text-[#72767d] hover:text-white">
              <Plus className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={editingMessageId ? editingMessageText : messageInput}
              onChange={(e) => editingMessageId ? setEditingMessageText(e.target.value) : setMessageInput(e.target.value)}
              onFocus={() => typingUsers.size > 0 && setTypingUsers(new Set())}
              placeholder={editingMessageId ? "Edit message..." : `Message #${activeChannel?.name} (use / for commands)`}
              className="flex-1 bg-transparent text-white placeholder-[#72767d] focus:outline-none text-sm"
            />
            <button type="button" className="text-[#72767d] hover:text-white">
              <Smile className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!messageInput.trim()}
              className="text-[#72767d] hover:text-white disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          {editingMessageId && (
            <div className="flex gap-2 text-xs">
              <button type="button" onClick={() => { setEditingMessageId(null); setEditingMessageText(""); }} className="text-[#72767d] hover:text-white">Cancel</button>
              <button type="submit" className="text-green-400 hover:text-green-300">Save</button>
            </div>
          )}
          {!editingMessageId && <p className="text-xs text-[#72767d]">💡 Try: /poll, /remind, /mute @user, /ban @user</p>}
        </form>
      </div>

      {/* Online Users Sidebar - Hidden on mobile */}
      <aside className={`${showMembersList ? "flex" : "hidden"} md:flex w-full md:w-64 bg-[#2f3136] border-l border-[#202225] flex-col overflow-hidden`}>
        <div className="h-16 border-b border-[#202225] px-4 flex items-center justify-between bg-[#36393f]">
          <h3 className="font-bold text-sm">Online Members</h3>
          <button className="text-[#72767d] hover:text-white">
            <UserPlus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
          {onlineUsers.map(u => (
            <div
              key={u.id}
              onMouseEnter={() => setHoveredUser(u.id)}
              onMouseLeave={() => setHoveredUser(null)}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-[#36393f] cursor-pointer group"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-[#5865f2] flex items-center justify-center text-sm font-bold">
                  {u.avatar}
                </div>
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#2f3136] ${statusColors[u.status]}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{u.name}</p>
                {u.role === "moderator" && <p className="text-xs text-[#5865f2]">Moderator</p>}
              </div>
              {hoveredUser === u.id && !bannedUsers.has(u.name) && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => setSelectedDMUser(u.name)} className="text-[#72767d] hover:text-white">
                    <MessageSquare className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleModerationAction("mute", u.name)} className="text-[#72767d] hover:text-white">
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleModerationAction("ban", u.name)} className="text-[#72767d] hover:text-red-500">
                    <Ban className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Voice Channel Active Indicator */}
      {voiceActive && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 shadow-lg">
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span className="text-sm font-semibold">In voice chat</span>
          <button onClick={() => setVoiceActive(false)} className="ml-2 text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* DM Modal */}
      <AnimatePresence>
        {selectedDMUser && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 right-6 w-80 bg-[#36393f] border border-[#202225] rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="h-12 bg-[#2f3136] px-4 flex items-center justify-between">
              <p className="font-semibold text-white text-sm">💬 {selectedDMUser}</p>
              <button onClick={() => setSelectedDMUser(null)} className="text-[#72767d] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="h-48 overflow-y-auto bg-[#36393f] space-y-2 p-3">
              {dmConversations[selectedDMUser]?.map(msg => (
                <div key={msg.id} className={`flex ${msg.author === "You" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-3 py-1.5 rounded-lg text-sm ${msg.author === "You" ? "bg-[#5865f2] text-white" : "bg-[#40444b] text-[#dbdee1]"}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
            <div className="h-10 border-t border-[#202225] px-2 py-1 flex gap-1">
              <input type="text" placeholder="Message..." className="flex-1 bg-[#40444b] rounded px-2 text-xs text-white outline-none" />
              <button type="button" className="text-[#72767d] hover:text-white"><Send className="w-4 h-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Server Settings Modal */}
      <AnimatePresence>
        {showCreateServer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowCreateServer(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-[#36393f] border border-[#202225] rounded-lg p-6 w-96"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-white mb-4">Create Server</h2>
              <div className="space-y-3">
                <input placeholder="Server Name" className="w-full bg-[#40444b] text-white px-3 py-2 rounded outline-none text-sm" />
                <input placeholder="Server Icon" className="w-full bg-[#40444b] text-white px-3 py-2 rounded outline-none text-sm" />
                <input placeholder="Description" className="w-full bg-[#40444b] text-white px-3 py-2 rounded outline-none text-sm" />
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setShowCreateServer(false)} className="flex-1 bg-[#40444b] hover:bg-[#4f525c] text-white py-2 rounded text-sm font-semibold">Cancel</button>
                  <button onClick={() => { toast.success("Server created!"); setShowCreateServer(false); }} className="flex-1 bg-[#5865f2] hover:bg-[#4752c4] text-white py-2 rounded text-sm font-semibold">Create</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
