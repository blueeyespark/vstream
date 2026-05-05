import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

export default function Community() {
  const [user, setUser] = useState(null);
  const [postContent, setPostContent] = useState("");
  const [postingImage, setPostingImage] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setUser(null));
  }, []);

  const { data: posts = [] } = useQuery({
    queryKey: ["social-posts"],
    queryFn: () => base44.entities.SocialPost.filter({ visibility: "public" }, "-created_date", 100),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const { data: reactions = [] } = useQuery({
    queryKey: ["post-reactions"],
    queryFn: () => base44.entities.PostReaction.list("-created_date", 500),
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  const createPostMutation = useMutation({
    mutationFn: async (content) => {
      return base44.entities.SocialPost.create({
        title: content.slice(0, 60),
        content,
        platform: "youtube",
        media_type: "text",
        posted_by: user.email,
        posted_date: new Date().toISOString().split("T")[0],
        visibility: "public",
        file_urls: postingImage ? [postingImage] : [],
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-posts"] });
      setPostContent("");
      setPostingImage(null);
      toast.success("Post shared!");
    },
  });

  const reactMutation = useMutation({
    mutationFn: (postId) => {
      const existing = reactions.find(r => r.post_id === postId && r.created_by === user.email);
      if (existing) {
        return base44.entities.PostReaction.delete(existing.id);
      }
      return base44.entities.PostReaction.create({
        post_id: postId,
        author_email: user.email,
        author_name: user.full_name,
        reaction_type: "like",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-reactions"] });
    },
  });

  const handlePost = () => {
    if (!postContent.trim()) return;
    createPostMutation.mutate(postContent);
  };

  const getPostReactions = (postId) => {
    return reactions.filter(r => r.post_id === postId);
  };

  const userLikedPost = (postId) => {
    return reactions.some(r => r.post_id === postId && r.created_by === user?.email);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Community Feed</h1>
          <p className="text-muted-foreground mt-1">Share and discover what others are creating</p>
        </div>

        {/* Post Form */}
        {user && (
          <div className="bg-card rounded-lg border border-border p-6 mb-8">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                {user.full_name?.charAt(0) || "?"}
              </div>
              <div className="flex-1">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={3}
                  className="w-full bg-secondary rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast.info("Image upload coming soon")}
                  >
                    Add Image
                  </Button>
                  <Button
                    size="sm"
                    onClick={handlePost}
                    disabled={createPostMutation.isPending || !postContent.trim()}
                  >
                    {createPostMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
            </div>
          ) : (
            posts.map((post) => {
              const postReactions = getPostReactions(post.id);
              const userLiked = userLikedPost(post.id);
              return (
                <div key={post.id} className="bg-card rounded-lg border border-border p-6">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                      {(post.posted_by || "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{post.posted_by}</p>
                      <p className="text-xs text-muted-foreground">
                        {post.posted_date ? format(new Date(post.posted_date), "MMM d, yyyy") : ""}
                      </p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-sm mb-4 leading-relaxed">{post.content}</p>

                  {/* Post Images */}
                  {post.file_urls?.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4 rounded-lg overflow-hidden">
                      {post.file_urls.map((url, i) => (
                        <img key={i} src={url} alt="" className="w-full h-40 object-cover" />
                      ))}
                    </div>
                  )}

                  {/* Reactions */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border">
                    <button
                      onClick={() => reactMutation.mutate(post.id)}
                      className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                        userLiked
                          ? "text-red-500"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${userLiked ? "fill-current" : ""}`} />
                      {postReactions.length > 0 && <span>{postReactions.length}</span>}
                    </button>
                    <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      Comment
                    </button>
                    <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      <Share2 className="w-4 h-4" />
                      Share
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}