import { useParams } from "wouter";
import { useState, useEffect } from "react";
import { Heart, Share, Save, Download, Upload, Copy, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import BottomDock from "@/components/layout/BottomDock";
import ToolRunner from "@/components/tool/ToolRunner";
import { SyncStatusComponent } from "@/components/sync/SyncStatus";
import { generateToolFromText, ToolSpec as FastlaneToolSpec } from "@/lib/fastlane";
import { galleryTools } from "@/lib/seeds";
import { useUIStore } from "@/store/useUIStore";
import { useRecentStore } from "@/store/useRecentStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toolRepo } from "../../../src/repositories";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { ToolSpec as RepoToolSpec } from "../../../shared/types";

const mockToolSpecs: Record<string, FastlaneToolSpec> = {
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

// Conversion functions between ToolSpec formats
function convertToRepoFormat(fastlaneSpec: FastlaneToolSpec): RepoToolSpec {
  return {
    version: "1",
    name: fastlaneSpec.name,
    summary: fastlaneSpec.description,
    inputs: Object.entries(fastlaneSpec.settings).map(([key, setting]) => ({
      id: key,
      type: setting.type,
      label: setting.label,
      default: setting.default,
      options: setting.options,
      min: setting.min,
      max: setting.max,
    })),
    pipeline: [
      {
        op: "process",
        args: {
          category: fastlaneSpec.category,
          accept: fastlaneSpec.inputs.accept,
          maxSize: fastlaneSpec.inputs.maxSize,
          multiple: fastlaneSpec.inputs.multiple,
        },
      },
    ],
    output: {
      type: "file[]",
      naming: "processed_{name}",
      zip: true,
    },
  };
}

function convertFromRepoFormat(repoSpec: RepoToolSpec): FastlaneToolSpec {
  // Convert repository format back to fastlane format
  const settings: FastlaneToolSpec['settings'] = {};
  
  repoSpec.inputs.forEach((input: any) => {
    if (input.id) {
      settings[input.id] = {
        type: input.type || 'input',
        label: input.label || input.id,
        default: input.default,
        options: input.options,
        min: input.min,
        max: input.max,
      };
    }
  });

  const processOp = repoSpec.pipeline.find((op: any) => op.op === "process");
  
  return {
    id: 'converted-tool',
    name: repoSpec.name,
    description: repoSpec.summary,
    category: processOp?.args?.category || 'General',
    icon: 'tool',
    settings,
    inputs: {
      accept: processOp?.args?.accept || ['*/*'],
      maxSize: processOp?.args?.maxSize || 10 * 1024 * 1024,
      multiple: processOp?.args?.multiple || true,
    },
  };
}

export default function Tool() {
  const params = useParams();
  const toolId = params.id;
  const { setComposerDocked } = useUIStore();
  const { addRecentTool } = useRecentStore();
  const { isAuthenticated } = useAuthStore();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["Batch"]);
  const [toolSpec, setToolSpec] = useState<FastlaneToolSpec | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveAsName, setSaveAsName] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  // Load tool from repository
  const { data: toolData, isLoading, error } = useQuery({
    queryKey: ['tool', toolId],
    queryFn: async () => {
      if (!toolId) return null;
      
      // Try to load from repository first
      const repoData = await toolRepo.get(toolId);
      if (repoData) {
        // Convert repository format to fastlane format for the UI
        const fastlaneSpec = convertFromRepoFormat(repoData.spec);
        fastlaneSpec.id = toolId;
        return { spec: fastlaneSpec, meta: repoData.meta };
      }
      
      // Fallback to mock tools and gallery
      let spec = mockToolSpecs[toolId];
      if (!spec) {
        const galleryTool = galleryTools.find(t => t.id === toolId);
        if (galleryTool) {
          spec = generateToolFromText(galleryTool.name);
          spec.name = galleryTool.name;
          spec.description = galleryTool.description;
          spec.category = galleryTool.category;
        } else {
          // Generate fallback tool
          spec = {
            id: toolId,
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
      
      return { spec, meta: null };
    },
    enabled: !!toolId,
  });

  // Check if tool is favorited
  const { data: isFavorite } = useQuery({
    queryKey: ['favorite', toolId],
    queryFn: () => toolId ? toolRepo.isFavorite(toolId) : false,
    enabled: !!toolId && isAuthenticated,
  });

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async ({ name, isPublic: publicFlag }: { name: string; isPublic: boolean }) => {
      if (!toolData?.spec) throw new Error('No tool to save');
      
      // Convert FastlaneToolSpec to repository ToolSpec format
      const repoSpec = convertToRepoFormat(toolData.spec);
      const meta = {
        name: name || toolData.spec.name,
        isPublic: publicFlag,
      };
      
      return await toolRepo.save(repoSpec, meta);
    },
    onSuccess: (savedMeta) => {
      toast({
        title: "Tool saved successfully",
        description: `${savedMeta.name} has been saved to your collection.`,
      });
      queryClient.invalidateQueries({ queryKey: ['tool', toolId] });
      queryClient.invalidateQueries({ queryKey: ['tools'] });
      setSaveDialogOpen(false);
      setSaveAsName("");
    },
    onError: (error) => {
      toast({
        title: "Failed to save tool",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async (favorite: boolean) => {
      if (!toolId) throw new Error('No tool ID');
      await toolRepo.favorite(toolId, favorite);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite', toolId] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update favorite",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (toolId) {
      setComposerDocked(true);
    }

    return () => {
      setComposerDocked(false);
    };
  }, [toolId, setComposerDocked]);

  useEffect(() => {
    if (toolData?.spec) {
      setToolSpec(toolData.spec);
      setSaveAsName(toolData.spec.name);
      
      // Add to recent tools
      addRecentTool({
        id: toolData.spec.id,
        name: toolData.spec.name,
        description: toolData.spec.description,
        category: toolData.spec.category,
        icon: toolData.spec.icon,
      });
    }
  }, [toolData, addRecentTool]);

  useEffect(() => {
    setIsSaved(!!isFavorite);
  }, [isFavorite]);

  const handleFeatureToggle = (feature: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feature) 
        ? prev.filter(f => f !== feature)
        : [...prev, feature]
    );
  };

  const handleSave = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save tools to your collection.",
        variant: "destructive",
      });
      return;
    }
    favoriteMutation.mutate(!isSaved);
  };

  const handleSaveAs = () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save tools to your collection.",
        variant: "destructive",
      });
      return;
    }
    setSaveDialogOpen(true);
  };

  const handleSaveAsSubmit = () => {
    if (!saveAsName.trim()) return;
    saveMutation.mutate({
      name: saveAsName.trim(),
      isPublic: isPublic,
    });
  };

  const handleExport = () => {
    if (!toolSpec) return;
    
    const exportData = {
      toolspec: toolSpec,
      exported_at: new Date().toISOString(),
      version: "1.0",
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${toolSpec.name.toLowerCase().replace(/\s+/g, '-')}.toolforge.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Tool exported",
      description: "Tool has been downloaded as a JSON file.",
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.toolforge.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.toolspec) {
            setToolSpec(data.toolspec);
            toast({
              title: "Tool imported",
              description: "Tool has been loaded from file.",
            });
          } else {
            throw new Error('Invalid tool file format');
          }
        } catch (error) {
          toast({
            title: "Import failed",
            description: "Unable to read tool file. Please check the file format.",
            variant: "destructive",
          });
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Tool link has been copied to clipboard.",
    });
  };

  if (isLoading) {
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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            Failed to load tool. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!toolSpec) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertDescription>
            Tool not found.
          </AlertDescription>
        </Alert>
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
        <div className="flex items-center space-x-2">
          {/* Sync Status for authenticated users */}
          {isAuthenticated && (
            <SyncStatusComponent compact />
          )}
          
          {/* Save/Favorite Button */}
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={favoriteMutation.isPending}
            className={`hover:bg-secondary/80 transition-colors focus-ring ${
              isSaved ? "bg-primary/10 text-primary" : ""
            }`}
            data-testid="save-tool-button"
          >
            <Heart className={`w-4 h-4 mr-2 ${isSaved ? "fill-current" : ""}`} />
            {isSaved ? "Saved" : "Save"}
          </Button>

          {/* Save As / Export / Import Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="hover:bg-secondary/80 transition-colors focus-ring"
                data-testid="tool-actions-menu"
              >
                <Save className="w-4 h-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthenticated && (
                <>
                  <DropdownMenuItem onClick={handleSaveAs} data-testid="save-as-button">
                    <Copy className="w-4 h-4 mr-2" />
                    Save As...
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleExport} data-testid="export-button">
                <Download className="w-4 h-4 mr-2" />
                Export Tool
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleImport} data-testid="import-button">
                <Upload className="w-4 h-4 mr-2" />
                Import Tool
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleShare} data-testid="share-button">
                <Share className="w-4 h-4 mr-2" />
                Share Link
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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

      {/* Save As Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Tool As</DialogTitle>
            <DialogDescription>
              Save this tool to your collection with a custom name.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tool-name">Tool Name</Label>
              <Input
                id="tool-name"
                value={saveAsName}
                onChange={(e) => setSaveAsName(e.target.value)}
                placeholder="Enter tool name..."
                data-testid="save-as-name-input"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="public-tool"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="rounded border border-input"
                data-testid="save-as-public-checkbox"
              />
              <Label htmlFor="public-tool" className="text-sm">
                Make this tool public (visible in gallery)
              </Label>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSaveDialogOpen(false)}
                data-testid="save-as-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAsSubmit}
                disabled={!saveAsName.trim() || saveMutation.isPending}
                data-testid="save-as-confirm"
              >
                {saveMutation.isPending ? "Saving..." : "Save Tool"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bottom Dock */}
      <BottomDock />
    </div>
  );
}
