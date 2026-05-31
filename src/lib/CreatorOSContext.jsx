import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const CreatorOSContext = createContext(null);

export function CreatorOSProvider({ children }) {
  const { user } = useAuth();
  const [activeChannelId, setActiveChannelId] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      return localStorage.getItem("activeChannelId") || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!activeChannelId) return;
    try {
      localStorage.setItem("activeChannelId", activeChannelId);
    } catch {
      // ignore storage failures in restrictive browsers
    }
  }, [activeChannelId]);

  useEffect(() => {
    // Legacy event listener removed: channel changes are now handled
    // via `setActiveChannelId` from the CreatorOSProvider API.
  }, []);

  const { data: channels = [] } = useQuery({
    queryKey: ["channels-all"],
    queryFn: () => base44.entities.Channel.list(),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

  const { data: videos = [] } = useQuery({
    queryKey: ["videos-all", user?.email],
    queryFn: () => base44.entities.Video.list("-created_date", 120),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

  const { data: assets = [] } = useQuery({
    queryKey: ["creator-os-assets", user?.email],
    queryFn: () => base44.entities.MediaAsset.filter({ created_by: user.email }, "-created_date", 120),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

  const { data: analytics = [] } = useQuery({
    queryKey: ["creator-os-analytics"],
    queryFn: () => base44.entities.VideoAnalytics.list("-date", 120),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });

  const myChannels = useMemo(
    () => channels.filter((channel) => channel.creator_email === user?.email),
    [channels, user?.email]
  );

  const channel = useMemo(
    () => myChannels.find((item) => item.id === activeChannelId) || myChannels[0] || null,
    [myChannels, activeChannelId]
  );

  const channelVideos = useMemo(
    () => videos.filter((video) => !channel?.id || video.channel_id === channel.id),
    [videos, channel?.id]
  );

  const readyVideos = useMemo(
    () => channelVideos.filter((video) => video.status === "ready"),
    [channelVideos]
  );

  const drafts = useMemo(
    () => channelVideos.filter((video) => ["draft", "processing", "scheduled"].includes(video.status)),
    [channelVideos]
  );

  const totalViews = useMemo(
    () => channelVideos.reduce((sum, video) => sum + (video.view_count || 0), 0),
    [channelVideos]
  );

  const revenueEstimate = useMemo(() => Math.round(totalViews * 0.0032), [totalViews]);

  const stats = useMemo(
    () => ({
      videos: readyVideos.length,
      drafts: drafts.length,
      views: totalViews,
      assets: assets.length,
      analytics: analytics.length,
      revenue: revenueEstimate,
    }),
    [readyVideos.length, drafts.length, totalViews, assets.length, analytics.length, revenueEstimate]
  );

  const value = useMemo(
    () => ({
      user,
      channels,
      videos,
      assets,
      analytics,
      myChannels,
      channel,
      channelVideos,
      readyVideos,
      drafts,
      stats,
      activeChannelId,
      setActiveChannelId,
    }),
    [user, channels, videos, assets, analytics, myChannels, channel, channelVideos, readyVideos, drafts, stats, activeChannelId]
  );

  return <CreatorOSContext.Provider value={value}>{children}</CreatorOSContext.Provider>;
}

export function useCreatorOS() {
  const context = useContext(CreatorOSContext);
  if (!context) {
    throw new Error("useCreatorOS must be used within a CreatorOSProvider");
  }
  return context;
}

// Safe version — returns empty defaults when used outside the provider (e.g. in TopNav)
export function useCreatorOSSafe() {
  const context = useContext(CreatorOSContext);
  return context || { channels: [], myChannels: [], channel: null, channelVideos: [], assets: [], activeChannelId: null, setActiveChannelId: () => {} };
}