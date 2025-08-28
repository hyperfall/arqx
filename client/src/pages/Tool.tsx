import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { Heart, Share, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BottomDock from "@/components/layout/BottomDock";
import ToolRunner from "@/components/tool/ToolRunner";
import { generateToolFromText, ToolSpec } from "@/lib/fastlane";
import { galleryTools } from "@/lib/seeds";
import { useUIStore } from "@/store/useUIStore";
import { useRecentStore } from "@/store/useRecentStore";

const mockToolSpecs: Record<string, ToolSpec> = {
  "png-to-jpeg": {
    id: "png-to-jpeg",
    name: "PNG to JPEG Converter",
    description: "Convert PNG images to JPEG format with customizable quality settings",
    category: "Image",
    icon: "image",
    settings: {
      quality: {
        type: "slider",
        label: "JPEG Quality",
        default: 85,
        min: 1,
        max: 100,
      },
      stripExif: {
        type: "checkbox",
        label: "Strip EXIF Data",
        default: true,
      },
      resize: {
        type: "checkbox",
        label: "Resize Images",
        default: false,
      },
      width: {
        type: "input",
        label: "Width",
        default: 1920,
      },
      height: {
        type: "input",
        label: "Height",
        default: 1080,
      },
    },
    inputs: {
      accept: ["image/png"],
      maxSize: 10 * 1024 * 1024,
      multiple: true,
    },
  },
};

const featureChips = ["Batch", "Resize", "Rename", "Strip EXIF"];

export default function Tool() {
  const params = useParams();
  const toolId = params.id;
  const { setComposerDocked } = useUIStore();
  const { addRecentTool } = useRecentStore();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["Batch"]);
  const [toolSpec, setToolSpec] = useState<ToolSpec | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (toolId) {
      // Show bottom dock when on tool page
      setComposerDocked(true);
      
      // Get tool spec
      let spec = mockToolSpecs[toolId];
      if (!spec) {
        // Check if it's a gallery tool first
        const galleryTool = galleryTools.find(t => t.id === toolId);
        if (galleryTool) {
          spec = generateToolFromText(galleryTool.name);
          spec.name = galleryTool.name;
          spec.description = galleryTool.description;
          spec.category = galleryTool.category;
        } else {
          // For dynamically generated tools, we need a better strategy
          // For now, let's create a fallback tool
          spec = {
            id: toolId || 'fallback',
            name: 'Generated Tool',
            description: 'This is a dynamically generated tool',
            category: 'Text',
            icon: 'type',
            settings: {
              operation: {
                type: 'select',
                label: 'Operation',
                default: 'lowercase',
                options: ['lowercase', 'uppercase', 'capitalize', 'trim'],
              },
            },
            inputs: {
              accept: ['text/plain'],
              maxSize: 5 * 1024 * 1024,
              multiple: true,
            },
          };
        }
      }
      
      setToolSpec(spec);
      
      // Add to recent tools
      if (spec) {
        addRecentTool({
          id: spec.id,
          name: spec.name,
          description: spec.description,
          category: spec.category,
          icon: spec.icon,
        });
      }
    }

    return () => {
      // Hide dock when leaving tool page
      setComposerDocked(false);
    };
  }, [toolId, setComposerDocked, addRecentTool]);

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // In real app, this would save to Supabase
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    // Show toast notification
  };

  if (!toolSpec) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-muted-foreground">Loading tool...</p>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: "Home" },
    { label: "Gallery" },
    { label: toolSpec.name },
  ];

  return (
    <div data-testid="tool-page">
      {/* Breadcrumbs */}
      <Breadcrumbs items={breadcrumbItems} />

      {/* Tool Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{toolSpec.name}</h1>
          <p className="text-muted-foreground">{toolSpec.description}</p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            onClick={handleSave}
            className={`hover:bg-secondary/80 transition-colors focus-ring ${
              isSaved ? "bg-primary/10 text-primary" : ""
            }`}
            data-testid="save-tool-button"
          >
            <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </Button>
          <Button
            variant="secondary"
            onClick={handleShare}
            className="hover:bg-secondary/80 transition-colors focus-ring"
            data-testid="share-tool-button"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Feature Chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {featureChips.map((feature) => (
          <Button
            key={feature}
            variant={selectedFeatures.includes(feature) ? "default" : "secondary"}
            size="sm"
            onClick={() => handleFeatureToggle(feature)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedFeatures.includes(feature)
                ? "bg-primary text-primary-foreground"
                : "hover:bg-secondary/80"
            }`}
            data-testid={`feature-${feature.toLowerCase()}`}
          >
            {feature}
          </Button>
        ))}
      </div>

      {/* Tool Runner */}
      <ToolRunner toolSpec={toolSpec} />

      {/* Bottom Dock */}
      <BottomDock />
    </div>
  );
}
