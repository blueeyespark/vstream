import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Code, Wand2, Loader2, Check, Youtube, Tv, Zap, Users, DollarSign, MessageSquare, BarChart3, Settings, Play, Star, Sparkles, Music, Image, Film } from "lucide-react";
import { toast } from "sonner";
import CodePreviewModal from "@/components/scanner/CodePreviewModal";

// ─── YouTube Features ──────────────────────────────────────────────────────────
const YOUTUBE_FUNCTIONS = [
  // Video Playback
  { category: "Video Playback", name: "Fine-tunable Playback Speed", description: "Adjust playback speed in 0.05 increments (0.25x to 2x). A slider in the settings menu updates the video element's playbackRate.", how_it_works: "HTML5 video.playbackRate property. UI: dropdown or slider with steps of 0.05.", effort: "low" },
  { category: "Video Playback", name: "Floating Miniplayer", description: "A resizable, draggable picture-in-picture player that persists while the user browses other videos.", how_it_works: "Use Picture-in-Picture Web API or a floating <video> overlay with drag/resize handlers. State persists in context.", effort: "medium" },
  { category: "Video Playback", name: "Sleep Timer", description: "Auto-pause video after a user-set duration (15min, 30min, 60min or custom).", how_it_works: "setTimeout that calls video.pause(). Countdown shown in corner of player. Cancel button clears the timer.", effort: "low" },
  { category: "Video Playback", name: "Ambient Mode / Cinematic Blur", description: "Blurs and extends the video colors as a glow behind the player for immersive viewing.", how_it_works: "Canvas element samples edge pixels from video frames at intervals. CSS backdrop-filter or box-shadow mirrors sampled colors.", effort: "medium" },
  { category: "Video Playback", name: "Video Chapters with Timeline Preview", description: "Named chapters jump to specific timestamps, shown as segments on the seek bar.", how_it_works: "Parse chapter timestamps from description (e.g. 0:00 Intro). Render segment lines on the timeline. Hovering shows chapter name.", effort: "low" },
  { category: "Video Playback", name: "Auto-play Queue", description: "After a video ends, auto-play the next recommended video with a countdown overlay.", how_it_works: "Show 5-second countdown with cancel option. On expire, navigate to next recommended video URL. Store in queue array in state.", effort: "low" },
  { category: "Video Playback", name: "Keyboard Shortcuts Overlay", description: "Press ? to reveal a hotkey cheat sheet (J/K/L for seek, M for mute, F for fullscreen, etc.).", how_it_works: "keydown listener on window. Toggle modal on '?'. Map keys to video player actions via ref calls.", effort: "low" },

  // Discovery
  { category: "Discovery", name: "AI-Powered Search", description: "Conversational search with intent understanding — 'show me gaming videos from this week'.", how_it_works: "Pass user query + context to LLM, return structured filters (category, date, duration). Apply filters to video list.", effort: "medium" },
  { category: "Discovery", name: "Category Chip Filters", description: "Horizontal scrollable chips at the top of the feed that filter videos by topic in real-time.", how_it_works: "State variable activeCategory. Filter video array client-side. Already partially implemented in Dashboard.", effort: "done" },
  { category: "Discovery", name: "Trending / Trending Now Section", description: "Dedicated section showing trending videos ranked by recent view velocity.", how_it_works: "Sort by (view_count / days_since_publish) desc. Show rank badge (#1, #2...). Refresh every few minutes.", effort: "low" },
  { category: "Discovery", name: "Search Suggestions / Autocomplete", description: "As user types in search, show dropdown with suggested queries derived from existing video titles.", how_it_works: "Debounce input 300ms. Filter video titles/tags client-side. Render suggestion dropdown with keyboard navigation.", effort: "low" },
  { category: "Discovery", name: "Watch Time Streak Tracker", description: "Show a daily watch streak to encourage return visits.", how_it_works: "Track last_watch_date in user profile. Increment streak if watched today. Reset on gap. Display streak badge in profile/nav.", effort: "low" },
  { category: "Discovery", name: "Video Queue / Up Next Sidebar", description: "Drag-reorderable queue of videos to watch next, persisted per session.", how_it_works: "Array stored in localStorage. Drag-and-drop with @hello-pangea/dnd. Add to queue via right-click or button on video cards.", effort: "medium" },

  // Community
  { category: "Community", name: "Community Posts with Polls", description: "Creator posts text, images, or polls to their community tab. Viewers vote and comment.", how_it_works: "SocialPost entity storing post type, poll_options[], poll_votes[]. Vote increments index in array. Already implemented.", effort: "done" },
  { category: "Community", name: "Badges & Milestones", description: "Earn badges for being an early subscriber, liking X videos, commenting X times, watching X hours.", how_it_works: "Track viewer actions in a ViewerStats entity. Compare thresholds. Display badge grid in user profile/You tab.", effort: "medium" },
  { category: "Community", name: "Collaborative Playlists with QR code", description: "Invite friends to co-build a playlist via shareable link or QR code. Members can vote to reorder.", how_it_works: "Playlist entity with collaborators[] array. Voting stored as votes{} map on each entry. QR generated from playlist URL.", effort: "medium" },
  { category: "Community", name: "Nested Comment Threads", description: "Replies to comments shown in collapsible threads. Emoji reactions per comment.", how_it_works: "TaskComment entity with parent_comment_id. Render tree recursively. Collapse beyond depth 2. Emoji reaction map stored per comment.", effort: "medium" },
  { category: "Community", name: "Watch Party / Synchronized Viewing", description: "Multiple users watch the same video in sync with shared chat. Host controls playback for all.", how_it_works: "WatchParty entity with host_id and current_time. Broadcast seek/play/pause events via base44 real-time subscribe. Shared chat via ChatMessage filter.", effort: "high" },
  { category: "Community", name: "Viewer Profiles / Watch History", description: "Public or private profile showing watch history, liked videos, subscriptions, badges.", how_it_works: "User entity extended with privacy_settings. WatchHistory entity per user. Render feed of watched/liked videos with timestamps.", effort: "medium" },

  // Monetization
  { category: "Monetization", name: "Super Chat / Live Donations", description: "Viewers pay to highlight their message in live chat, pinned for a set duration based on amount.", how_it_works: "Chat message with amount field. Sort highlighted messages by amount. Auto-expire after timeout. Stripe payment flow.", effort: "high" },
  { category: "Monetization", name: "Channel Memberships", description: "Monthly recurring subscriptions with tiers (e.g. $2.99, $4.99, $9.99) giving perks like badges, emotes, exclusive posts.", how_it_works: "Stripe recurring subscription. Tier stored on Subscription entity. Gate content/posts by tier check.", effort: "high" },
  { category: "Monetization", name: "YouTube Shopping / Merch Shelf", description: "Product shelf below or alongside video showing creator merchandise that viewers can buy.", how_it_works: "Products entity linked to channel. Displayed below video player. Click opens product page or external store URL.", effort: "medium" },
  { category: "Monetization", name: "Ad Revenue Dashboard", description: "Show estimated ad revenue, CPM, RPM, monetized playbacks for each video.", how_it_works: "VideoAnalytics entity with revenue fields. Aggregate per video. Display in Creator Studio with sparklines and total earnings card.", effort: "medium" },
  { category: "Monetization", name: "Paid Content / Course Gate", description: "Mark specific videos or playlists as 'Members Only' or premium paid content.", how_it_works: "Video entity with access_tier field. On play, check user subscription tier. Show upgrade prompt if insufficient. Gate video element render.", effort: "medium" },
  { category: "Monetization", name: "Super Thanks", description: "One-time tip button on any video with preset amounts ($2, $5, $10, $50).", how_it_works: "Stripe one-time payment intent per amount. On success, create a highlighted comment with thank-you badge. Notify creator.", effort: "medium" },

  // Creator Tools
  { category: "Creator Tools", name: "YouTube Studio Analytics Dashboard", description: "Deep analytics: impressions, CTR, watch time, subscriber gain/loss, audience retention graph per video.", how_it_works: "VideoAnalytics entity per video per day. Charts: retention curve (area chart), impression funnel, top traffic sources.", effort: "medium" },
  { category: "Creator Tools", name: "AI Shorts Generator", description: "Take a long video, AI detects the best 30–60 second clip and generates a Short automatically.", how_it_works: "Pass video transcript/description to LLM. LLM returns start/end timestamps. Create new Short video entry. Use VideoEditor to trim.", effort: "high" },
  { category: "Creator Tools", name: "End Screens & Cards", description: "Overlay interactive cards at video end pointing to other videos, playlists, or subscribe button.", how_it_works: "Video metadata stores end_screens[] with timestamp, type, target_id. Player renders overlay div at correct timestamp.", effort: "medium" },
  { category: "Creator Tools", name: "Thumbnail A/B Testing", description: "Upload 2 thumbnails, YouTube shows each to a portion of viewers, pick the winner by CTR.", how_it_works: "Store two thumbnail URLs on video. Randomly assign thumbnail variant per user. Track clicks per variant. Show winner stats.", effort: "medium" },
  { category: "Creator Tools", name: "Bulk Video Editor", description: "Select multiple videos and batch-update metadata: tags, category, description template, visibility.", how_it_works: "Multi-select checkboxes on video list. Bulk update modal with shared fields. Apply changes via Promise.all over selected video IDs.", effort: "medium" },
  { category: "Creator Tools", name: "AI Video Description Generator", description: "One-click generate a full description with timestamps, links, and hashtags from the video title/content.", how_it_works: "Send video title, tags, and duration to LLM. LLM returns structured description with sections. Auto-fill description field.", effort: "low" },
  { category: "Creator Tools", name: "Subtitle / Caption Editor", description: "Edit auto-generated captions line by line with timing adjustment before publishing.", how_it_works: "Store captions as VTT format on Video entity. Parse into editable segments. Update timing and text. Re-serialize on save.", effort: "medium" },
  { category: "Creator Tools", name: "Upload Scheduler with Preview", description: "Schedule a video to go public at a specific date/time, with a pre-publish checklist.", how_it_works: "Video entity has publish_at field. Scheduled automation checks for due videos and updates status to 'public'. Checklist shows SEO warnings.", effort: "low" },
  { category: "Creator Tools", name: "Channel Audit / Health Score", description: "AI evaluates channel consistency, posting frequency, CTR, engagement and gives a score with tips.", how_it_works: "Aggregate VideoAnalytics data. Pass to LLM with channel metrics. LLM returns score (0-100) + prioritized improvement actions.", effort: "medium" },

  // Shorts
  { category: "Shorts", name: "Shorts Feed (Vertical Swipe)", description: "Full-screen vertical video feed that auto-plays next Short on swipe-up. Like, comment, share overlaid on video.", how_it_works: "Full-height container. touch events for swipe detection. Auto-play next in array. Overlay action buttons.", effort: "done" },
  { category: "Shorts", name: "Shorts Remixer / Duet", description: "Record a new Short side-by-side with an existing one, response-style.", how_it_works: "Split screen: original video left, webcam/upload right. Store both video IDs on new Short entity with remix_of field. Show both in player.", effort: "high" },
  { category: "Shorts", name: "Shorts Analytics Summary", description: "Swipe metrics per Short: views, likes, avg watch %, audience retention drop-off point.", how_it_works: "VideoAnalytics entity filtered by type='short'. Show retention as a gradient bar (high→low). Aggregate per 24h buckets.", effort: "medium" },

  // Live
  { category: "Live", name: "Live Chat with Emotes", description: "Real-time chat during live streams with custom channel emotes, moderation tools, slow mode.", how_it_works: "WebSocket or base44 real-time subscription on ChatMessage entity. Filter by stream_id. Slow mode = rate limit per user.", effort: "done" },
  { category: "Live", name: "Live Stream DVR / Rewind", description: "Viewers can rewind up to 4 hours into a live stream while it's still running.", how_it_works: "HLS stream with sliding window. Seek bar shows live edge and buffer. Click timestamps in chat to jump to that moment.", effort: "high" },
  { category: "Live", name: "Stream Info Editor (Mid-stream)", description: "Update title, category, and thumbnail while stream is live without interruption.", how_it_works: "Editable fields on StreamerDashboard. Update Channel entity in real-time. Viewers see updated info without page refresh via subscription.", effort: "low" },
  { category: "Live", name: "Multi-stream Destinations", description: "Go live simultaneously to YouTube, Twitch, and other platforms with a single click.", how_it_works: "Store multiple RTMP endpoints per channel. Backend function fans out stream to each destination using provided keys.", effort: "high" },
];

// ─── Twitch Features ───────────────────────────────────────────────────────────
const TWITCH_FUNCTIONS = [
  // Viewer Rewards
  { category: "Viewer Rewards", name: "Channel Points System", description: "Viewers earn points by watching, following, raiding. Spend points on custom rewards the streamer defines (e.g. choose next game, sound alert, dance emote).", how_it_works: "ChannelPoints entity per viewer per channel. Auto-increment on watch time. RewardRedemption entity. Streamer defines rewards in dashboard.", effort: "high" },
  { category: "Viewer Rewards", name: "Hype Train", description: "A community-wide challenge — when enough subs/cheers happen in a time window, a hype train starts. Level up together to unlock bigger rewards.", how_it_works: "Track cheer/sub events in real-time. Sum contributions in rolling 5-min window. When threshold hit, trigger HypeTrain with level progress bar in UI.", effort: "high" },
  { category: "Viewer Rewards", name: "Predictions", description: "Streamer poses a question (e.g. 'Will I win this match?'). Viewers bet Channel Points on outcomes. Winner takes the pot.", how_it_works: "Prediction entity with outcomes[], viewers place bets (PredictionBet entity). On resolve, distribute pool proportionally to winners.", effort: "medium" },
  { category: "Viewer Rewards", name: "Polls", description: "Streamer creates quick polls visible to all viewers. Results update live. Can be Channel Point powered.", how_it_works: "Poll entity with options[], vote_counts[]. Viewers click to vote (one vote per user). Live update via subscription. Already have community polls.", effort: "low" },
  { category: "Viewer Rewards", name: "Bits / Cheering", description: "Viewers buy Bits (virtual currency) and 'Cheer' in chat. Animated emotes appear, streamer earns money per bit.", how_it_works: "Bits are Stripe-purchased credits. Cheer message triggers animated overlay on stream. Leaderboard shows top cheerers.", effort: "high" },
  { category: "Viewer Rewards", name: "Loyalty Points Leaderboard", description: "Public leaderboard showing top point earners on a channel, updated live during streams.", how_it_works: "Aggregate ChannelPoints entity by channel_id. Sort desc. Render top-10 list with avatars and point totals. Update via real-time subscription.", effort: "low" },
  { category: "Viewer Rewards", name: "Viewer Milestone Alerts", description: "Auto-trigger confetti / sound alert when channel hits follower/sub milestones (100, 500, 1000...).", how_it_works: "Subscribe to Subscription entity. On count thresholds (check after each new sub), trigger animated overlay with canvas-confetti and sound.", effort: "low" },

  // Community
  { category: "Community", name: "Raids", description: "At stream end, send your entire live audience to another channel's stream, boosting their viewer count with a raid message.", how_it_works: "Raid entity. On initiate, create a massive animated chat flood on target channel. Increment target's current_viewers. Notify target streamer.", effort: "done" },
  { category: "Community", name: "Squad Stream / Co-Streaming", description: "Up to 4 streamers broadcast together in a split-screen layout. Viewers can watch all 4 simultaneously.", how_it_works: "SquadSession entity with participant channel IDs. Frontend renders 2x2 grid of embedded stream players. Shared chat feed.", effort: "high" },
  { category: "Community", name: "Clips", description: "Any viewer can create a 30-90 second clip from any stream or VOD. Clips are shareable and browsable.", how_it_works: "Clip entity stores source_video_id, start_time, duration. Player renders trimmed section. Clips have their own view counts & sharing.", effort: "done" },
  { category: "Community", name: "Shoutout Command", description: "Mod or streamer types !so @user in chat — highlights that user with their channel preview in a card.", how_it_works: "Chat bot parses !so command. Looks up user channel. Renders animated shoutout card overlay. Also posts in chat with channel link.", effort: "low" },
  { category: "Community", name: "Viewer Card / Hover Profile", description: "Hovering a username in chat shows their follower date, sub status, total bits cheered, and mod status.", how_it_works: "Popover on username click. Fetch Subscription + ChannelPoints entity for that user. Render card with stats and quick mod-action buttons.", effort: "medium" },

  // Moderation
  { category: "Moderation", name: "AutoMod with AI", description: "AI automatically catches hate speech, spam, slurs in chat before they're posted. Mod approves or denies held messages.", how_it_works: "Pass chat message through LLM moderation check. If flagged, hold in moderation queue instead of publishing. Mod gets alert.", effort: "medium" },
  { category: "Moderation", name: "Mod Actions Dashboard", description: "Moderators see real-time stream of chat with quick timeout/ban/unban/block buttons per user.", how_it_works: "ChatMessage list with author info. Buttons call UserBan entity create. Banned users filtered from future messages.", effort: "medium" },
  { category: "Moderation", name: "Chat Rules Pinned Message", description: "Permanent pinned message at top of chat showing the streamer's chat rules, auto-posted on stream start.", how_it_works: "Channel entity stores chat_rules text. On stream start, create a pinned system ChatMessage. Render with distinct style pinned at top.", effort: "low" },
  { category: "Moderation", name: "Follower-only / Sub-only Chat Mode", description: "Restrict chat to followers or subscribers only with a toggle in the stream control panel.", how_it_works: "Channel entity has chat_mode field (open|followers|subscribers). Chat input checks mode + user subscription status before allowing message send.", effort: "low" },
  { category: "Moderation", name: "Word Blacklist / Regex Filter", description: "Block specific words or regex patterns from being posted in chat.", how_it_works: "Channel entity stores blacklist string array. Before saving ChatMessage, test content against each pattern. Reject and notify sender if matched.", effort: "low" },

  // Live Tools
  { category: "Live Tools", name: "Stream Deck Integration UI", description: "A web-based stream control panel with big buttons for scene switching, alerts, chat actions, timers.", how_it_works: "Grid of customizable action buttons. Each button triggers an action (toggle overlay, send chat message, start/stop timer, play sound).", effort: "done" },
  { category: "Live Tools", name: "Stream Goals / Alerts Overlay", description: "Animated browser-source overlay that shows new follower/sub alerts, goal progress bars.", how_it_works: "Subscribe to Subscription/Follow entity events. When new event fires, animate an overlay popup with sound + gif. Goal bar tracks progress.", effort: "done" },
  { category: "Live Tools", name: "Category / Game Tagging", description: "Streamers tag their stream with game/category, letting viewers browse streams by category.", how_it_works: "Category entity. Stream has category_id. Viewers browse category page showing all live streams in that game.", effort: "low" },
  { category: "Live Tools", name: "Stream Timer / Countdown Widget", description: "On-screen countdown to stream start or a segment timer (e.g. 'BRB back in 5 min').", how_it_works: "Timer widget component that accepts duration. Counts down using setInterval. Streamer can reset/pause from dashboard. Shown in stream overlay.", effort: "low" },
  { category: "Live Tools", name: "Sound Alerts / TTS Chat", description: "Viewers trigger sound clips (or text-to-speech readout) with Channel Points or Bits.", how_it_works: "SoundAlert entity stores audio_url per reward. On redemption, play audio via Web Audio API. TTS uses SpeechSynthesis API to read chat message.", effort: "medium" },
  { category: "Live Tools", name: "Subscriber Milestone Ticker", description: "Scrolling ticker strip showing recent subs, gifted subs, and cheers in real-time.", how_it_works: "Subscribe to Subscription entity. New events prepend to a scrolling queue array. Animate slide-in each entry with framer-motion.", effort: "low" },
  { category: "Live Tools", name: "Guest / Co-host Invite", description: "Invite another creator to join the stream as a co-host with a sharable invite link.", how_it_works: "Generate unique invite token. Guest opens the link, joins a shared StreamSession. Both video feeds merged in a split-screen layout component.", effort: "high" },

  // Monetization
  { category: "Monetization", name: "Subscriptions with Emotes", description: "Viewers subscribe (Tier 1/2/3) unlocking channel-specific emotes usable in any chat + ad-free viewing.", how_it_works: "Subscription entity with tier. EmoteSet entity per tier. Chat parser replaces emote codes with images. Check sub status for ad removal.", effort: "high" },
  { category: "Monetization", name: "Gift Subscriptions", description: "Viewers can gift subscriptions to random community members or a specific user.", how_it_works: "Stripe payment for N subscriptions. Randomly assign to active viewers (from recent ChatMessage senders). Create Subscription records. Announce in chat.", effort: "medium" },
  { category: "Monetization", name: "Bounty Board / Sponsored Goals", description: "Brand-sponsored challenges: complete X task this stream for a reward that viewers unlock.", how_it_works: "BountyGoal entity with target, sponsor, reward. Streamer accepts/rejects bounties. Progress tracked via custom counter. Announce completion to chat.", effort: "medium" },

  // Discovery
  { category: "Discovery", name: "Following Feed / Homepage", description: "Personalized homepage showing live channels from people you follow first, then recommendations.", how_it_works: "Subscription list determines follow_ids[]. Filter live channels by follow_ids. Show offline/recommended in secondary section.", effort: "done" },
  { category: "Discovery", name: "Browse by Category Page", description: "Full page grid of all live streams organized by game/category with viewer counts.", how_it_works: "Group Channel entities by category. Sort by current_viewers desc. Render category header cards with stream grid below each.", effort: "low" },
  { category: "Discovery", name: "Recommended Streams Algorithm", description: "Suggest streams the user might like based on their watch history and followed channels' categories.", how_it_works: "Collect user's followed channel categories. Filter live channels by matching tags. Exclude already-followed. Rank by viewer count.", effort: "medium" },

  // Analytics
  { category: "Analytics", name: "Stream Recap / Annual Recap", description: "After each stream: total hours watched, peak viewers, new followers, top clips. Annual recap with highlights.", how_it_works: "Aggregate StreamSession entity data. Generate recap card with stats. Annual recap pulls all sessions by year.", effort: "medium" },
  { category: "Analytics", name: "Chat Engagement Heatmap", description: "Visual timeline showing spikes in chat activity during a stream, helping creators find their best moments.", how_it_works: "Count ChatMessage per minute bucket during stream. Render as a sparkline/heatmap below the VOD timeline. Click to jump to that timestamp.", effort: "medium" },
  { category: "Analytics", name: "Subscriber Churn Report", description: "Track sub gains vs losses over time. Identify which streams caused spikes or drops.", how_it_works: "Daily snapshot of subscriber count in UserStats. Diff day-over-day. Annotate chart with stream titles for that day. Show net change line chart.", effort: "medium" },
];

// ─── ArtForge AI Features ──────────────────────────────────────────────────────
const ARTFORGE_FUNCTIONS = [
  { category: "Image Generation", name: "Inpainting / Fill Selection", description: "Select a region of a generated image and regenerate just that area with a new prompt.", how_it_works: "Canvas with selection tool. Send base image + mask + new prompt to GenerateImage with existing_image_urls. Replace selected region on result.", effort: "medium" },
  { category: "Image Generation", name: "Image Upscaler", description: "AI-upscale any generated image to 4x resolution for print-quality output.", how_it_works: "Pass image URL back to GenerateImage with upscale prompt. Store upscaled version as separate MediaAsset with linked parent_id.", effort: "low" },
  { category: "Image Generation", name: "Style Transfer", description: "Apply the visual style of one uploaded image to any new generation.", how_it_works: "Upload a style reference image. Pass its URL in existing_image_urls alongside prompt. LLM produces images in that art style.", effort: "low" },
  { category: "Image Generation", name: "LoRA / Character Consistency", description: "Upload a reference face or character and generate multiple scenes with that character staying consistent.", how_it_works: "User uploads 2-5 reference photos. Pass all as existing_image_urls. Append 'consistent character' to suffix. Gallery tags by character set.", effort: "medium" },
  { category: "Image Generation", name: "Prompt History & Favorites", description: "Save and re-run previous prompts from a history panel. Star prompts to a favorites library.", how_it_works: "Store prompts in localStorage or a PromptHistory entity. Render sidebar with past prompts. Click to restore prompt + mode + style tags.", effort: "low" },
  { category: "Image Generation", name: "Negative Prompt Control", description: "Add a negative prompt field to exclude unwanted elements (e.g. 'no blur, no text, no watermark').", how_it_works: "Second textarea below main prompt. Append as suffix: '...NEGATIVE: {negativePrompt}' in the final prompt string to GenerateImage.", effort: "low" },
  { category: "Image Generation", name: "Random Prompt Inspiration", description: "One-click random prompt generator using AI — generates a creative, detailed prompt in the current mode.", how_it_works: "Button calls InvokeLLM asking for a creative image prompt for the selected mode. Output fills the prompt textarea.", effort: "low" },
  { category: "Video Generation", name: "Image-to-Video Animation", description: "Upload a still image and animate it into a short video (pan, zoom, particles, etc.).", how_it_works: "Pass image URL in existing_image_urls to GenerateVideo with an animation prompt. Store result as video MediaAsset.", effort: "medium" },
  { category: "Video Generation", name: "Video Prompt Templates", description: "Pre-built prompt templates for common video types: product reveal, logo animation, nature timelapse.", how_it_works: "Array of template objects with name + prompt string. User picks template, it populates the prompt field. Can then customize.", effort: "low" },
  { category: "Video Generation", name: "Video to GIF Converter", description: "Convert any generated video into a looping GIF for easy sharing.", how_it_works: "Render video frames to canvas at set FPS. Use gifshot or similar to encode GIF blob. Upload to UploadFile. Save new MediaAsset with type 'gif'.", effort: "medium" },
  { category: "Comic Creator", name: "Multi-Panel Comic Builder", description: "Generate 2–6 sequential comic panels from a story description, arranged in a grid layout.", how_it_works: "Split story into N scene prompts via LLM. Generate each panel image in parallel. Render in CSS grid panel layout. Export as single PNG.", effort: "medium" },
  { category: "Comic Creator", name: "Speech Bubble Overlay", description: "Add editable speech/thought bubbles on top of any generated image.", how_it_works: "Absolute-positioned SVG bubble overlays on canvas. User clicks to add, drags to position, types dialogue. Export via html2canvas.", effort: "medium" },
  { category: "Sticker Pack", name: "Sticker Pack Export", description: "Generate a set of 8–12 themed stickers at once and download as a ZIP.", how_it_works: "LLM generates 8 variant prompts from a theme. Generate all in parallel. Create ZIP file in browser using JSZip. Download all stickers.", effort: "medium" },
  { category: "Sticker Pack", name: "Animated Sticker (APNG)", description: "Generate a static sticker and animate it with a subtle loop (bounce, pulse, wiggle).", how_it_works: "Generate base sticker. Apply CSS animation (framer-motion) in a canvas loop. Capture frames. Encode APNG using upng-js or similar.", effort: "high" },
  { category: "Gallery", name: "Gallery Collections / Albums", description: "Organize gallery assets into named collections/albums for different projects.", how_it_works: "Add collection_id to MediaAsset. Create a Collection entity. Gallery sidebar shows collections. Drag assets between collections.", effort: "medium" },
  { category: "Gallery", name: "AI Caption Generator", description: "Auto-generate a descriptive caption/alt-text for any gallery image with one click.", how_it_works: "Pass image URL to InvokeLLM with file_urls. LLM describes the image. Update MediaAsset.description. Show in gallery card.", effort: "low" },
  { category: "Gallery", name: "Bulk Download", description: "Select multiple gallery items and download them all as a ZIP file.", how_it_works: "Multi-select checkboxes on gallery items. Fetch each image URL, convert to blob. Bundle with JSZip. Trigger download.", effort: "medium" },
  { category: "Content Tools", name: "Hashtag Research Tool", description: "Enter a niche topic and get ranked hashtag suggestions with estimated reach.", how_it_works: "InvokeLLM with add_context_from_internet=true to research trending hashtags for topic. Return JSON with hashtags + estimated_reach. Render ranked list.", effort: "low" },
  { category: "Content Tools", name: "Script / Voiceover Writer", description: "Write a full video script with intro hook, body segments, and CTA for any topic.", how_it_works: "InvokeLLM with topic, duration, tone. Returns structured script with timestamps. Display in formatted sections with copy buttons per section.", effort: "low" },
  { category: "Content Tools", name: "Content Calendar Planner", description: "AI suggests an optimal posting schedule based on niche and upload frequency.", how_it_works: "InvokeLLM with channel niche, current posting frequency. Returns 30-day content calendar as JSON with dates + video ideas. Render as calendar grid.", effort: "medium" },
  { category: "Content Tools", name: "Trend Spotter", description: "Daily-updated list of trending topics and AI content ideas in the user's niche.", how_it_works: "InvokeLLM with add_context_from_internet=true and user's niche from channel. Returns 5 trending topics with content angle suggestions. Cache for 24h.", effort: "low" },
];

// ─── TikTok / Short-form Features ─────────────────────────────────────────────
const TIKTOK_FUNCTIONS = [
  { category: "Discovery", name: "For You Algorithm Feed", description: "Personalized infinite scroll feed of short-form videos driven by engagement signals.", how_it_works: "Score videos by (likes×2 + comments×3 + shares×5) / hours_since_upload. Filter by user interests from watch history tags. Paginate 10 at a time.", effort: "medium" },
  { category: "Discovery", name: "Sound / Audio Trend Feed", description: "Browse videos by trending audio tracks. Tap a sound to see all videos using it.", how_it_works: "SoundTrack entity. Video entity has sound_id. Group videos by sound_id. Sort sounds by usage count desc. Show on dedicated Sounds page.", effort: "medium" },
  { category: "Discovery", name: "Hashtag Challenge Pages", description: "Dedicated page per hashtag showing all videos using it, with total view count and trending indicator.", how_it_works: "HashtagChallenge entity with name, video_ids[], total_views. Render when a hashtag is clicked. Show participant count and top videos.", effort: "low" },
  { category: "Creation", name: "Duet / Stitch Mode", description: "Record a short video as a side-by-side duet or stitch response to any existing video.", how_it_works: "Original video plays in half the screen. User records/uploads the other half. New Video entity with duet_of_id. Render both synchronized.", effort: "high" },
  { category: "Creation", name: "Short Video Trimmer & Cropper", description: "In-browser tool to trim a short video and crop it to 9:16 before uploading.", how_it_works: "Video element with start/end trim handles. Canvas to crop to 9:16 aspect. Export via MediaRecorder API. Upload trimmed blob.", effort: "medium" },
  { category: "Creation", name: "Text-on-Video Overlays", description: "Add animated text captions, stickers, and emojis on top of videos before publishing.", how_it_works: "Canvas overlay on video preview. User types text, picks position, style, animation. Composited into final export frame-by-frame.", effort: "high" },
  { category: "Creation", name: "Voiceover Recording", description: "Record a voiceover directly over a video in-browser before uploading.", how_it_works: "MediaDevices.getUserMedia for mic. Record audio track via MediaRecorder. Merge with video audio using AudioContext. Save combined blob.", effort: "medium" },
  { category: "Monetization", name: "Creator Fund / Payout Dashboard", description: "Display estimated creator earnings from views with a payout history and threshold tracker.", how_it_works: "Calculate estimated_payout = view_count × CPM_rate. Display monthly breakdown. Show 'cashout available' when threshold ($10) is met.", effort: "low" },
  { category: "Monetization", name: "TikTok Shop / Link in Bio Commerce", description: "Product links embedded in video and profile bio that viewers can shop directly.", how_it_works: "Product entity with buy_url. Video has product_tag_ids[]. Show product carousel below video player. Profile bio renders linked product grid.", effort: "medium" },
  { category: "Analytics", name: "Short-form Retention Graph", description: "Bar chart showing at which second viewers drop off from a short video.", how_it_works: "Track video_position events on play. Aggregate into 1-second buckets per video. Plot as horizontal bar chart showing viewer % at each second.", effort: "medium" },
  { category: "Community", name: "Q&A Feature (Live Questions)", description: "Viewers submit questions during live; streamer pins answers as overlays on the video.", how_it_works: "Question entity with live_id. Viewers submit text. Streamer sees queue and pins selected Q. Pinned question shows as overlay on stream.", effort: "medium" },
  { category: "Community", name: "Series / Playlist for Shorts", description: "Group related Shorts into a Series so viewers auto-advance through the story.", how_it_works: "Playlist entity with type='series' and ordered Short video_ids[]. Auto-advance on swipe same as Shorts feed but filtered to playlist.", effort: "low" },
];

const EFFORT_COLOR = {
  low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  done: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
};

const CATEGORY_ICON = {
  "Video Playback": Play, "Discovery": Zap, "Community": Users,
  "Monetization": DollarSign, "Creator Tools": Settings, "Shorts": Star,
  "Live": Tv, "Viewer Rewards": Star, "Moderation": Settings,
  "Live Tools": Tv, "Analytics": BarChart3, "Image Generation": Image,
  "Video Generation": Film, "Comic Creator": MessageSquare, "Sticker Pack": Sparkles,
  "Gallery": BarChart3, "Content Tools": Wand2, "Creation": Play,
};

function FeatureCard({ feature, platform, onImplement, implementing, codeReady }) {
  const Icon = CATEGORY_ICON[feature.category] || Code;
  return (
    <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <Badge variant="outline" className="text-xs gap-1">
              <Icon className="w-3 h-3" />{feature.category}
            </Badge>
            <Badge className={`text-xs ${EFFORT_COLOR[feature.effort]}`}>
              {feature.effort === "done" ? "✓ Implemented" : `${feature.effort} effort`}
            </Badge>
          </div>
          <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{feature.name}</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{feature.description}</p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">⚙️ {feature.how_it_works}</p>
        </div>
        {feature.effort !== "done" && (
          <Button
            size="sm"
            variant={codeReady ? "outline" : "default"}
            onClick={() => onImplement(feature, platform)}
            disabled={implementing === `${platform}-${feature.name}`}
            className="flex-shrink-0 text-xs gap-1"
          >
            {implementing === `${platform}-${feature.name}` ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : codeReady ? (
              <><Check className="w-3 h-3 text-green-500" /> View Code</>
            ) : (
              <><Code className="w-3 h-3" /> Generate Code</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

const CATEGORIES_YT = [...new Set(YOUTUBE_FUNCTIONS.map(f => f.category))];
const CATEGORIES_TW = [...new Set(TWITCH_FUNCTIONS.map(f => f.category))];
const CATEGORIES_AF = [...new Set(ARTFORGE_FUNCTIONS.map(f => f.category))];
const CATEGORIES_TK = [...new Set(TIKTOK_FUNCTIONS.map(f => f.category))];

const ALL_FEATURES = [...YOUTUBE_FUNCTIONS, ...TWITCH_FUNCTIONS, ...ARTFORGE_FUNCTIONS, ...TIKTOK_FUNCTIONS];

export default function DeepScanResults() {
  const [implementing, setImplementing] = useState(null);
  const [codeModal, setCodeModal] = useState(null);
  const [codeReady, setCodeReady] = useState(new Set());
  const [filterYT, setFilterYT] = useState("All");
  const [filterTW, setFilterTW] = useState("All");
  const [filterAF, setFilterAF] = useState("All");
  const [filterTK, setFilterTK] = useState("All");

  const handleImplement = async (feature, platform) => {
    const key = `${platform}-${feature.name}`;
    setImplementing(key);
    toast.loading(`Generating code for "${feature.name}"...`, { id: key });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are an expert React/Tailwind developer building "VStream" — a creator-focused platform (like YouTube + Twitch + TikTok + AI Studio) built with React, Tailwind CSS, shadcn/ui, and base44 SDK.

Implement this ${platform} feature for VStream:
Feature: "${feature.name}"
Description: "${feature.description}"
How it works: "${feature.how_it_works}"

Generate a COMPLETE, PRODUCTION-READY React component:
- Tailwind CSS for ALL styling (dark: variants included)
- shadcn/ui from @/components/ui/ where appropriate
- lucide-react for icons (only use valid icons)
- base44 SDK: import { base44 } from '@/api/base44Client'; for data
- useQuery from @tanstack/react-query for data fetching
- export default function ComponentName() pattern
- Must be fully functional, not just a skeleton
- Include all state, handlers, and real UI logic

Return the FULL component code, the exact file path (e.g. components/live/ChannelPoints.jsx), and a brief explanation.`,
      model: "claude_sonnet_4_6",
      response_json_schema: {
        type: "object",
        properties: {
          code: { type: "string" },
          file_path: { type: "string" },
          explanation: { type: "string" }
        }
      }
    });

    await base44.entities.AIAppliedChange.create({
      title: feature.name,
      source: "external_scan",
      change_type: "feature",
      file_path: result.file_path || "",
      code_snippet: result.code || "",
      explanation: result.explanation || "",
      applied_by: "deep-scan",
      origin_site: platform,
    }).catch(() => {});

    setImplementing(null);
    setCodeReady(prev => new Set([...prev, key]));
    toast.success(`Code ready for "${feature.name}"`, { id: key });
    setCodeModal({
      title: `${platform}: ${feature.name}`,
      code: result.code || "// No code generated",
      description: result.explanation,
      filePath: result.file_path,
    });
  };

  const filteredYT = filterYT === "All" ? YOUTUBE_FUNCTIONS : YOUTUBE_FUNCTIONS.filter(f => f.category === filterYT);
  const filteredTW = filterTW === "All" ? TWITCH_FUNCTIONS : TWITCH_FUNCTIONS.filter(f => f.category === filterTW);
  const filteredAF = filterAF === "All" ? ARTFORGE_FUNCTIONS : ARTFORGE_FUNCTIONS.filter(f => f.category === filterAF);
  const filteredTK = filterTK === "All" ? TIKTOK_FUNCTIONS : TIKTOK_FUNCTIONS.filter(f => f.category === filterTK);

  const lowEffortCount = ALL_FEATURES.filter(f => f.effort === "low").length;
  const doneCount = ALL_FEATURES.filter(f => f.effort === "done").length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Deep Scan Results</h1>
              <p className="text-sm text-gray-500 dark:text-zinc-400">YouTube · Twitch · TikTok · ArtForge AI — {ALL_FEATURES.length} functions detected</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: "YouTube Functions", value: YOUTUBE_FUNCTIONS.length, color: "text-red-600" },
              { label: "Twitch Functions", value: TWITCH_FUNCTIONS.length, color: "text-purple-600" },
              { label: "TikTok / Short-form", value: TIKTOK_FUNCTIONS.length, color: "text-pink-600" },
              { label: "ArtForge AI", value: ARTFORGE_FUNCTIONS.length, color: "text-blue-600" },
              { label: "Low Effort Wins", value: lowEffortCount, color: "text-green-600" },
              { label: "Already Done", value: doneCount, color: "text-emerald-600" },
              { label: "Medium Effort", value: ALL_FEATURES.filter(f => f.effort === "medium").length, color: "text-amber-600" },
              { label: "Total Scanned", value: ALL_FEATURES.length, color: "text-gray-600 dark:text-zinc-300" },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-3 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <Tabs defaultValue="youtube">
          <TabsList className="w-full mb-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex flex-wrap h-auto gap-1 p-1">
            <TabsTrigger value="youtube" className="gap-2 flex-1">
              <Youtube className="w-4 h-4 text-red-500" /> YouTube ({YOUTUBE_FUNCTIONS.length})
            </TabsTrigger>
            <TabsTrigger value="twitch" className="gap-2 flex-1">
              <Tv className="w-4 h-4 text-purple-500" /> Twitch ({TWITCH_FUNCTIONS.length})
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="gap-2 flex-1">
              <Music className="w-4 h-4 text-pink-500" /> TikTok ({TIKTOK_FUNCTIONS.length})
            </TabsTrigger>
            <TabsTrigger value="artforge" className="gap-2 flex-1">
              <Sparkles className="w-4 h-4 text-blue-500" /> ArtForge ({ARTFORGE_FUNCTIONS.length})
            </TabsTrigger>
          </TabsList>

          {/* YouTube */}
          <TabsContent value="youtube">
            <FilterBar categories={CATEGORIES_YT} active={filterYT} setActive={setFilterYT} color="red" />
            <FeatureList features={filteredYT} platform="YouTube" onImplement={handleImplement} implementing={implementing} codeReady={codeReady} />
          </TabsContent>

          {/* Twitch */}
          <TabsContent value="twitch">
            <FilterBar categories={CATEGORIES_TW} active={filterTW} setActive={setFilterTW} color="purple" />
            <FeatureList features={filteredTW} platform="Twitch" onImplement={handleImplement} implementing={implementing} codeReady={codeReady} />
          </TabsContent>

          {/* TikTok */}
          <TabsContent value="tiktok">
            <FilterBar categories={CATEGORIES_TK} active={filterTK} setActive={setFilterTK} color="pink" />
            <FeatureList features={filteredTK} platform="TikTok" onImplement={handleImplement} implementing={implementing} codeReady={codeReady} />
          </TabsContent>

          {/* ArtForge */}
          <TabsContent value="artforge">
            <FilterBar categories={CATEGORIES_AF} active={filterAF} setActive={setFilterAF} color="blue" />
            <FeatureList features={filteredAF} platform="ArtForge" onImplement={handleImplement} implementing={implementing} codeReady={codeReady} />
          </TabsContent>
        </Tabs>
      </div>

      {codeModal && (
        <CodePreviewModal
          open={!!codeModal}
          onOpenChange={() => setCodeModal(null)}
          title={codeModal.title}
          code={codeModal.code}
          description={codeModal.description}
          filePath={codeModal.filePath}
        />
      )}
    </div>
  );
}

function FilterBar({ categories, active, setActive, color }) {
  const activeClass = {
    red: "bg-red-600 text-white",
    purple: "bg-purple-600 text-white",
    pink: "bg-pink-600 text-white",
    blue: "bg-blue-600 text-white",
  }[color] || "bg-gray-800 text-white";

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
      {["All", ...categories].map(cat => (
        <button key={cat} onClick={() => setActive(cat)}
          className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${active === cat ? activeClass : "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-800"}`}>
          {cat}
        </button>
      ))}
    </div>
  );
}

function FeatureList({ features, platform, onImplement, implementing, codeReady }) {
  return (
    <div className="space-y-3">
      {features.map((f, i) => (
        <motion.div key={f.name} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}>
          <FeatureCard feature={f} platform={platform} onImplement={onImplement} implementing={implementing} codeReady={codeReady.has(`${platform}-${f.name}`)} />
        </motion.div>
      ))}
    </div>
  );
}