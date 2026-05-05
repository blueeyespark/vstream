import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Image, Clapperboard, Music } from "lucide-react";
import VideoEditor from "@/pages/VideoEditor";
import ThumbnailMaker from "@/pages/ThumbnailMaker";
import IntroOutroMaker from "@/pages/IntroOutroMaker";
import MusicEditor from "@/pages/MusicEditor";

const subtabs = [
  { id: "video", label: "Video Editor", icon: Film, component: VideoEditor },
  { id: "thumbnail", label: "Thumbnail", icon: Image, component: ThumbnailMaker },
  { id: "intros", label: "Intros & Outros", icon: Clapperboard, component: IntroOutroMaker },
  { id: "music", label: "Music Editor", icon: Music, component: MusicEditor },
];

export default function ProductionHub() {
  const [active, setActive] = useState("video");
  const ActiveComponent = subtabs.find(t => t.id === active)?.component;

  return (
    <div>
      <Tabs value={active} onValueChange={setActive}>
        <TabsList className="mb-6 flex flex-wrap gap-1 h-auto">
          {subtabs.map(t => (
            <TabsTrigger key={t.id} value={t.id} className="gap-2">
              <t.icon className="w-4 h-4" /> {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <div>{ActiveComponent && <ActiveComponent />}</div>
      </Tabs>
    </div>
  );
}