import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Download, Loader2, CheckCircle2, Wifi, WifiOff } from "lucide-react";

export default function OfflineDownload({ enrollment, moduleIndex, moduleTitle, content }) {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await base44.entities.OfflineLesson.create({
        user_email: (await base44.auth.me()).email,
        enrollment_id: enrollment.id,
        course_id: enrollment.course_id,
        module_index: moduleIndex,
        module_title: moduleTitle,
        content: content,
        downloaded_at: new Date().toISOString(),
        offline_progress: 0,
        is_synced: false
      });

      // Also save to localStorage as backup
      const offlineKey = `course_${enrollment.course_id}_module_${moduleIndex}`;
      localStorage.setItem(offlineKey, JSON.stringify({
        title: moduleTitle,
        content: content,
        downloadedAt: new Date().toISOString()
      }));

      setDownloaded(true);
    } catch (e) {
      console.error("Download failed", e);
    }
    setDownloading(false);
  };

  return (
    <div className="rounded-lg border border-[#12305f] bg-[#06101f] p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wifi className="h-4 w-4 text-[#00c8ff]" />
          <div>
            <p className="text-sm font-black text-white">Offline Access</p>
            <p className="text-xs text-blue-100/50">Download for offline learning</p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          disabled={downloading || downloaded}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-black transition ${
            downloaded
              ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-300'
              : 'bg-[#1e78ff]/20 border border-[#1e78ff]/50 text-[#00c8ff] hover:bg-[#1e78ff]/30'
          }`}
        >
          {downloading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Downloading...</>
          ) : downloaded ? (
            <><CheckCircle2 className="h-4 w-4" /> Downloaded</>
          ) : (
            <><Download className="h-4 w-4" /> Download</>
          )}
        </button>
      </div>
    </div>
  );
}