import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";
import { Upload, File, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import VStreamAIAssistant from "@/components/ai/VStreamAIAssistant";

export default function VideoUpload() {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [uploadedVideoId, setUploadedVideoId] = useState(null);
  const [channel, setChannel] = useState(null);

  useEffect(() => {
    setUser(authUser);
    if (authUser?.email) {
      base44.entities.Channel.filter({ creator_email: authUser.email }).then(channels => {
        setChannel(channels?.[0] || null);
      }).catch(() => setChannel(null));
    } else {
      setChannel(null);
    }
  }, [authUser]);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024 * 1024) {
        toast.error("File must be smaller than 5GB");
        return;
      }
      setFile(selectedFile);
      setVideoTitle(selectedFile.name.split(".")[0]);
    }
  };

  const applyMetadataSuggestion = (text) => {
    const titleMatch = text.match(/title:\s*(.+)/i);
    const descriptionMatch = text.match(/description:\s*([\s\S]*?)(?:\nTags:|$)/i);
    if (titleMatch?.[1]) setVideoTitle(titleMatch[1].replace(/\|/g, "-").trim());
    if (descriptionMatch?.[1]) setVideoDescription(descriptionMatch[1].trim());
    toast.success("AI metadata suggestion applied");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    if (!videoTitle) {
      toast.error("Please enter a video title");
      return;
    }

    setUploading(true);

    try {
      // Step 1: Get upload URL
      const uploadRes = await base44.functions.invoke("generateUploadURL", {
        filename: file.name,
        size: file.size,
        content_type: file.type,
      });

      const { upload_url, video_id, upload_key } = uploadRes.data;

      // Step 2: Upload file to S3
      const uploadToS3 = async () => {
        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const percentComplete = (e.loaded / e.total) * 100;
            setUploadProgress(percentComplete);
          }
        });

        return new Promise((resolve, reject) => {
          xhr.addEventListener("load", () => {
            if (xhr.status === 200) resolve();
            else reject(new Error("Upload failed"));
          });
          xhr.addEventListener("error", () => reject(new Error("Upload error")));

          xhr.open("PUT", upload_url);
          xhr.setRequestHeader("Content-Type", file.type);
          xhr.send(file);
        });
      };

      await uploadToS3();
      setUploadProgress(100);

      // Step 3: Start transcoding
      const transRes = await base44.functions.invoke("startTranscodingJob", {
        video_id,
        upload_key,
      });

      // Step 4: Create Video entity record so it appears on the channel
      await base44.entities.Video.create({
        channel_id: channel?.id || "",
        title: videoTitle,
        description: videoDescription,
        status: "processing",
        visibility: "public",
        raw_upload_url: upload_key,
        transcoding_progress: 0,
      });

      setUploadedVideoId(video_id);
      toast.success("Video uploaded! Transcoding started.");
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (uploadedVideoId) {
    return (
      <div className="min-h-[420px] bg-[#03080f] flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#e8f4ff] mb-2">Upload Successful!</h2>
          <p className="text-blue-200/55 mb-6">Your video is now transcoding. Check back soon!</p>
          <Button onClick={() => setUploadedVideoId(null)}>Upload Another</Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[520px] bg-[#03080f] p-4">
      <div className="mx-auto grid max-w-6xl gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div>
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-[#e8f4ff] mb-2">Upload Video</h1>
          <p className="text-blue-200/55 mb-6">Upload and process your next video</p>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-[#06101f] rounded-2xl border-2 border-dashed border-[#1e78ff]/40 shadow-2xl shadow-black/20 p-8 text-center">
          <input
            type="file"
            id="video-input"
            accept="video/*"
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />

          {!file ? (
            <label htmlFor="video-input" className="cursor-pointer">
              <Upload className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#e8f4ff] mb-2">Drop your video here</h3>
              <p className="text-blue-200/55 mb-4">or click to browse (max 5GB)</p>
              <Button variant="outline">Select Video</Button>
            </label>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-[#03080f] border border-[#12305f] rounded-lg">
                <File className="w-6 h-6 text-indigo-500" />
                <div className="text-left flex-1">
                  <p className="font-medium text-[#e8f4ff]">{file.name}</p>
                  <p className="text-sm text-blue-200/45">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button
                  onClick={() => setFile(null)}
                  disabled={uploading}
                  className="text-blue-200/40 hover:text-blue-100"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-blue-100/70 block mb-2">Video Title</label>
                  <Input
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="My awesome video"
                    disabled={uploading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-blue-100/70 block mb-2">Description</label>
                  <textarea
                    value={videoDescription}
                    onChange={(e) => setVideoDescription(e.target.value)}
                    placeholder="Tell viewers what your video is about..."
                    rows={4}
                    disabled={uploading}
                    className="w-full px-3 py-2 border border-[#12305f] bg-[#06101f] text-[#e8f4ff] rounded-lg text-sm"
                  />
                </div>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <div className="w-full bg-[#12305f] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-blue-200/55">{Math.round(uploadProgress)}% uploaded</p>
                </div>
              )}

              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" /> Upload Video
                  </>
                )}
              </Button>
            </div>
          )}
        </motion.div>
        </div>
        <aside className="xl:sticky xl:top-20 xl:self-start">
          <VStreamAIAssistant
            surface="compact"
            contextType="upload"
            context={{
              title: videoTitle || file?.name || "New upload",
              description: videoDescription,
              fileName: file?.name,
              actions: ["Generate metadata", "Improve title", "Write description", "Suggest tags"],
            }}
            onApply={applyMetadataSuggestion}
          />
        </aside>
      </div>
    </div>
  );
}
