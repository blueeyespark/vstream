import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, ImageIcon, WandSparkles, Film, Image, Clapperboard, Music } from "lucide-react";
import VideoUpload from "@/pages/VideoUpload";
import VideoEditor from "@/pages/VideoEditor";
import ThumbnailMaker from "@/pages/ThumbnailMaker";
import IntroOutroMaker from "@/pages/IntroOutroMaker";
import MusicEditor from "@/pages/MusicEditor";
import ArtForgeStudio from "@/pages/ArtForgeStudio";

const subtabs = [
  { id: "upload", label: "Upload", icon: Upload, component: VideoUpload },
  { id: "editor", label: "Editor", icon: ImageIcon, component: null },
  { id: "artforge", label: "ArtForge AI", icon: WandSparkles, component: ArtForgeStudio },
];

const editorTabs = [
  { id: "video", label: "Video", icon: Film, component: VideoEditor },
  { id: "thumbnail", label: "Thumbnail", icon: Image, component: ThumbnailMaker },
  { id: "intros", label: "Intros & Outros", icon: Clapperboard, component: IntroOutroMaker },
  { id: "music", label: "Music", icon: Music, component: MusicEditor },
];

export default function ProductionHub() {
  const [active, setActive] = useState("upload");
  const [activeEditor, setActiveEditor] = useState("video");
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
        
        {active === "editor" ? (
          <Tabs value={activeEditor} onValueChange={setActiveEditor}>
            <TabsList className="mb-6 flex flex-wrap gap-1 h-auto">
              {editorTabs.map(t => (
                <TabsTrigger key={t.id} value={t.id} className="gap-2">
                  <t.icon className="w-4 h-4" /> {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {editorTabs.map(t => {
              const Comp = t.component;
              return (
                <TabsContent key={t.id} value={t.id}>
                  {Comp && <Comp />}
                </TabsContent>
              );
            })}
          </Tabs>
        ) : (
          <div>{ActiveComponent && <ActiveComponent />}</div>
        )}
      </Tabs>
    </div>
  );
}