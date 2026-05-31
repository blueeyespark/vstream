import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ListVideo, Plus, Trash2, ArrowLeft, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import VideoPlayerModal from "@/components/dashboard/VideoPlayerModal";

export default function Playlists() {
  const { user } = useAuth();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const queryClient = useQueryClient();

  const { data: playlists = [] } = useQuery({
    queryKey: ["playlists", user?.email],
    queryFn: () => base44.entities.Playlist.filter({ owner_email: user.email }),
    enabled: !!user?.email,
    staleTime: 2 * 60 * 1000,
  });

  const { data: videos = [] } = useQuery({
    queryKey: ["videos-all"],
    queryFn: () => base44.entities.Video.list("-created_date", 80),
    staleTime: 5 * 60 * 1000,
  });

  const { data: channels = [] } = useQuery({
    queryKey: ["channels-all"],
    queryFn: () => base44.entities.Channel.list(),
    staleTime: 5 * 60 * 1000,
  });

  const channelMap = channels.reduce((acc, c) => { acc[c.id] = c; return acc; }, {});
  const videoMap = videos.reduce((acc, v) => { acc[v.id] = v; return acc; }, {});

  const createMutation = useMutation({
    mutationFn: (name) => base44.entities.Playlist.create({ name, owner_email: user.email, video_ids: [] }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["playlists"] }); setNewPlaylistName(""); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Playlist.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["playlists"] }); setSelectedPlaylist(null); },
  });

  const removeFromPlaylist = useMutation({
    mutationFn: ({ playlistId, videoId }) => {
      const playlist = playlists.find(p => p.id === playlistId);
      const updated = (playlist?.video_ids || []).filter(id => id !== videoId);
      return base44.entities.Playlist.update(playlistId, { video_ids: updated });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["playlists"] }),
  });

  if (!user) return (
    <div className="min-h-screen bg-[#03080f] flex items-center justify-center">
      <p className="text-blue-400/50">Loading...</p>
    </div>
  );

  // Playlist detail view
  if (selectedPlaylist) {
    const playlistVideos = (selectedPlaylist.video_ids || []).map(id => videoMap[id]).filter(Boolean);
    return (
      <div className="min-h-screen bg-[#03080f] text-[#e8f4ff]">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button onClick={() => setSelectedPlaylist(null)} className="flex items-center gap-2 text-blue-400 hover:text-blue-200 mb-6 font-semibold text-sm">
            <ArrowLeft className="w-4 h-4" /> Back to Playlists
          </button>

          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#1e78ff]/20 flex items-center justify-center">
                <ListVideo className="w-5 h-5 text-[#1e78ff]" />
              </div>
              <div>
                <h1 className="text-2xl font-black">{selectedPlaylist.name}</h1>
                <p className="text-sm text-blue-400/50">{playlistVideos.length} videos</p>
              </div>
            </div>
            <button onClick={() => deleteMutation.mutate(selectedPlaylist.id)} className="text-xs text-red-400/60 hover:text-red-400 font-semibold transition-colors">
              Delete Playlist
            </button>
          </div>

          {playlistVideos.length > 0 ? (
            <div className="space-y-3">
              {playlistVideos.map((video, i) => {
                const channel = channelMap[video.channel_id];
                return (
                  <motion.div key={video.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    className="flex items-center gap-3 group rounded-2xl border border-[#12305f]/60 bg-[#06101f] p-2 hover:border-[#1e78ff]/40 transition-all"
                  >
                    <button onClick={() => setSelectedVideo(video)} className="relative w-36 aspect-video rounded-xl overflow-hidden flex-shrink-0 bg-[#0a1525] group/thumb">
                      <img src={video.thumbnail_url || "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=200&h=113&fit=crop"} alt="" className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white fill-white" />
                      </div>
                    </button>
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedVideo(video)}>
                      <p className="text-sm font-semibold text-[#e8f4ff] line-clamp-2 group-hover:text-[#00c8ff] transition-colors">{video.title}</p>
                      <p className="text-xs text-blue-400/50 mt-1 truncate">{channel?.channel_name || "Creator"}</p>
                      <p className="text-xs text-blue-400/30 mt-0.5">{(video.view_count || 0).toLocaleString()} views</p>
                    </div>
                    <button onClick={() => removeFromPlaylist.mutate({ playlistId: selectedPlaylist.id, videoId: video.id })} className="p-2 text-red-400/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-2xl bg-[#06101f] border border-[#12305f] flex items-center justify-center mx-auto mb-4">
                <ListVideo className="w-6 h-6 text-blue-400/30" />
              </div>
              <p className="text-blue-400/50 text-sm">This playlist is empty</p>
              <p className="text-blue-400/30 text-xs mt-1">Add videos from the dashboard</p>
            </div>
          )}
        </div>

        {selectedVideo && (
          <VideoPlayerModal
            video={selectedVideo}
            channel={channelMap[selectedVideo.channel_id]}
            relatedVideos={playlistVideos}
            channelMap={channelMap}
            onClose={() => setSelectedVideo(null)}
            onSelectVideo={setSelectedVideo}
          />
        )}
      </div>
    );
  }

  // Main playlists list
  return (
    <div className="min-h-screen bg-[#03080f] text-[#e8f4ff]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link to="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-200 mb-6 font-semibold text-sm">
          <ArrowLeft className="w-4 h-4" /> Dashboard
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-[#1e78ff]/20 flex items-center justify-center">
            <ListVideo className="w-5 h-5 text-[#1e78ff]" />
          </div>
          <div>
            <h1 className="text-2xl font-black">My Playlists</h1>
            <p className="text-sm text-blue-400/50">{playlists.length} playlists</p>
          </div>
        </div>

        {/* Create */}
        <div className="mb-8 p-4 rounded-2xl border border-[#12305f]/60 bg-[#06101f]">
          <div className="flex gap-2">
            <input
              value={newPlaylistName}
              onChange={e => setNewPlaylistName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && newPlaylistName.trim() && createMutation.mutate(newPlaylistName)}
              placeholder="New playlist name..."
              className="flex-1 bg-[#0a1525] border border-[#1a3a60] rounded-xl px-3 py-2.5 text-sm text-[#c8dff5] placeholder-blue-400/30 outline-none focus:border-[#1e78ff] transition-colors"
            />
            <button
              onClick={() => newPlaylistName.trim() && createMutation.mutate(newPlaylistName)}
              disabled={!newPlaylistName.trim() || createMutation.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#1e78ff] hover:bg-[#3d8fff] disabled:opacity-40 rounded-xl text-white text-sm font-bold transition-colors"
            >
              <Plus className="w-4 h-4" /> Create
            </button>
          </div>
        </div>

        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {playlists.map((playlist, i) => {
                const firstVideo = (playlist.video_ids || []).map(id => videoMap[id]).find(Boolean);
                return (
                  <motion.button
                    key={playlist.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedPlaylist(playlist)}
                    className="text-left rounded-2xl border border-[#12305f]/60 bg-[#06101f] overflow-hidden hover:border-[#1e78ff]/50 hover:-translate-y-1 transition-all group"
                  >
                    <div className="aspect-video bg-[#0a1525] relative overflow-hidden">
                      {firstVideo?.thumbnail_url ? (
                        <img src={firstVideo.thumbnail_url} alt="" className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ListVideo className="w-10 h-10 text-blue-400/20" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#06101f] to-transparent" />
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        {playlist.video_ids?.length || 0} videos
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-[#e8f4ff] group-hover:text-[#00c8ff] transition-colors truncate">{playlist.name}</h3>
                      <p className="text-xs text-blue-400/40 mt-1">Playlist</p>
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-[#06101f] border border-[#12305f] flex items-center justify-center mx-auto mb-4">
              <ListVideo className="w-7 h-7 text-blue-400/20" />
            </div>
            <p className="text-[#e8f4ff] font-bold mb-1">No playlists yet</p>
            <p className="text-blue-400/40 text-sm">Create one above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}