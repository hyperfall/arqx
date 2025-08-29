import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolSpec } from "@/lib/fastlane";
import Dropzone from "./Dropzone";
import ProgressBar from "./ProgressBar";
import OutputList from "./OutputList";
import WidgetHost from "../../widgets/WidgetHost";
import { WidgetContextProvider } from "../../widgets/WidgetContext";

interface ToolRunnerProps {
  toolSpec: ToolSpec;
}

export default function ToolRunner({ toolSpec }: ToolRunnerProps) {
  const [settings, setSettings] = useState(() => {
    const initialSettings: Record<string, any> = {};
    Object.entries(toolSpec.settings).forEach(([key, setting]) => {
      initialSettings[key] = setting.default;
    });
    return initialSettings;
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputFiles, setOutputFiles] = useState<Array<{ name: string; size: number; url: string }>>([]);
  const [previewFiles, setPreviewFiles] = useState<Array<{ file: File; preview: string; dimensions?: { width: number; height: number } }>>([]);

  // Check if this is a widget-based tool with live mode
  const isLiveMode = toolSpec.ui?.mode === "live";
  const hasWidgets = toolSpec.ui?.widgets && toolSpec.ui.widgets.length > 0;

  // Create input mapping for widget context
  const inputMapping = useMemo(() => {
    const mapping: Record<string, File | undefined> = {};
    
    // Map files to input IDs - for simple tools, use primary input
    if (files.length > 0) {
      mapping['pdf'] = files.find(f => f.type === 'application/pdf');
      mapping['image'] = files.find(f => f.type.startsWith('image/'));
      mapping['video'] = files.find(f => f.type.startsWith('video/'));
      mapping['audio'] = files.find(f => f.type.startsWith('audio/'));
      mapping['text'] = files.find(f => f.type.startsWith('text/'));
      mapping['csv'] = files.find(f => f.type === 'text/csv' || f.name.endsWith('.csv'));
      mapping['json'] = files.find(f => f.type === 'application/json' || f.name.endsWith('.json'));
      
      // Generic file mapping
      mapping['file'] = files[0];
    }
    
    return mapping;
  }, [files]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Check if this is a tool that accepts images/videos
  const isMediaTool = toolSpec.inputs.accept.some(type => 
    type.includes('image') || type.includes('video') || type === '.gif' || type === '.png' || type === '.jpg' || type === '.jpeg'
  );

  // Generate previews for image/gif files
  useEffect(() => {
    const generatePreviews = async () => {
      if (!isMediaTool) {
        setPreviewFiles([]);
        return;
      }

      const previews = await Promise.all(
        files.map(async (file) => {
          if (file.type.startsWith('image/') || file.name.toLowerCase().endsWith('.gif')) {
            try {
              const preview = URL.createObjectURL(file);
              const dimensions = await getImageDimensions(preview);
              return { file, preview, dimensions };
            } catch (error) {
              return null;
            }
          }
          return null;
        })
      );
      
      setPreviewFiles(previews.filter(Boolean) as Array<{ file: File; preview: string; dimensions?: { width: number; height: number } }>);
    };

    generatePreviews();

    // Cleanup object URLs when component unmounts or files change
    return () => {
      previewFiles.forEach(({ preview }) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [files, isMediaTool]);

  const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = src;
    });
  };

  const handleRun = async () => {
    if (files.length === 0) return;
    
    setIsRunning(true);
    setProgress(0);
    setOutputFiles([]);

    // Simulate processing
    for (let i = 0; i <= 100; i += Math.random() * 15) {
      setProgress(Math.min(i, 100));
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Simulate output files
    const outputs = files.map(file => ({
      name: file.name.replace(/\.[^/.]+$/, '') + '_converted.' + getOutputExtension(toolSpec.category),
      size: Math.floor(file.size * 0.8), // Simulate compression
      url: URL.createObjectURL(file), // Mock URL
    }));

    setOutputFiles(outputs);
    setIsRunning(false);
    setProgress(100);
  };

  const getOutputExtension = (category: string): string => {
    switch (category) {
      case 'Image': return 'jpg';
      case 'Audio': return 'mp3';
      case 'Video': return 'mp4';
      case 'Document': return 'pdf';
      default: return 'txt';
    }
  };

  const renderSetting = (key: string, setting: any) => {
    switch (setting.type) {
      case 'slider':
        return (
          <div key={key} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="font-medium text-foreground">{setting.label}</Label>
              <span className="text-sm text-muted-foreground tabular-nums">
                {settings[key]}{setting.label.includes('Quality') ? '%' : ''}
              </span>
            </div>
            <Slider
              value={[settings[key]]}
              onValueChange={(value) => handleSettingChange(key, value[0])}
              min={setting.min || 0}
              max={setting.max || 100}
              step={1}
              className="w-full"
            />
          </div>
        );

      case 'checkbox':
        return (
          <div key={key} className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-foreground">{setting.label}</Label>
              {setting.description && (
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              )}
            </div>
            <Switch
              checked={settings[key]}
              onCheckedChange={(checked) => handleSettingChange(key, checked)}
            />
          </div>
        );

      case 'select':
        return (
          <div key={key} className="space-y-2">
            <Label className="font-medium text-foreground">{setting.label}</Label>
            <Select value={settings[key]} onValueChange={(value) => handleSettingChange(key, value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setting.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'input':
        return (
          <div key={key} className="space-y-2">
            <Label className="font-medium text-foreground">{setting.label}</Label>
            <Input
              type="number"
              value={settings[key]}
              onChange={(e) => handleSettingChange(key, parseInt(e.target.value) || 0)}
              placeholder={setting.default.toString()}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Widget-based layout for live mode
  if (isLiveMode && hasWidgets) {
    return (
      <WidgetContextProvider inputs={inputMapping}>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Input Files Card - Always show for live mode */}
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Input Files</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Dropzone
                accept={toolSpec.inputs.accept}
                maxSize={toolSpec.inputs.maxSize}
                multiple={toolSpec.inputs.multiple}
                files={files}
                onFilesChange={setFiles}
              />
            </CardContent>
          </Card>

          {/* Main Widget Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main widgets */}
            <div className="lg:col-span-2 space-y-6">
              {toolSpec.ui?.layout?.main?.map((widgetId) => {
                const widget = toolSpec.ui?.widgets?.find(w => w.id === widgetId);
                if (!widget) return null;
                return (
                  <WidgetHost
                    key={widgetId}
                    widget={widget}
                    context={{} as any} // Context will be provided by provider
                  />
                );
              })}
            </div>

            {/* Inspector widgets */}
            {toolSpec.ui?.layout?.inspector && toolSpec.ui.layout.inspector.length > 0 && (
              <div className="space-y-6">
                {toolSpec.ui?.layout.inspector.map((widgetId) => {
                  const widget = toolSpec.ui?.widgets?.find(w => w.id === widgetId);
                  if (!widget) return null;
                  return (
                    <WidgetHost
                      key={widgetId}
                      widget={widget}
                      context={{} as any} // Context will be provided by provider
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </WidgetContextProvider>
    );
  }

  // Classic run mode layout
  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Input Files and Settings */}
        <div className="space-y-5">
          {/* Input Files Card */}
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Input Files</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <Dropzone
                accept={toolSpec.inputs.accept}
                maxSize={toolSpec.inputs.maxSize}
                multiple={toolSpec.inputs.multiple}
                files={files}
                onFilesChange={setFiles}
              />
            </CardContent>
          </Card>

          {/* Settings Card - Only show if has settings */}
          {Object.keys(toolSpec.settings).length > 0 && (
            <Card className="w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Settings</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {Object.entries(toolSpec.settings).map(([key, setting]) => 
                  renderSetting(key, setting)
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Preview, Ready to Process and Output Files */}
        <div className="space-y-5">
          {/* Preview Card - Shows when there are image/gif previews */}
          {previewFiles.length > 0 && (
            <Card className="w-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Preview</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {previewFiles.map(({ file, preview, dimensions }, index) => (
                    <div key={`preview-${file.name}-${index}`} className="relative group">
                      <div className="aspect-video rounded-lg overflow-hidden border-2 border-border hover:border-primary/50 transition-colors bg-muted/20">
                        <img
                          src={preview}
                          alt={file.name}
                          className="w-full h-full object-cover cursor-pointer"
                          title={`${file.name}${dimensions ? ` • ${dimensions.width} × ${dimensions.height}px` : ''}`}
                        />
                      </div>
                      {file.name.toLowerCase().endsWith('.gif') && (
                        <div className="absolute top-3 right-3">
                          <span className="text-xs font-bold text-white bg-black/70 px-2 py-1 rounded-md">GIF</span>
                        </div>
                      )}
                      <div className="mt-3 space-y-1">
                        <p className="text-sm font-medium text-foreground truncate" title={file.name}>
                          {file.name}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          <span>•</span>
                          <span>{file.type || 'Unknown'}</span>
                          {dimensions && (
                            <>
                              <span>•</span>
                              <span>{dimensions.width} × {dimensions.height}px</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Run Card */}
          <Card className="w-full">
            <CardContent className="p-5">
              <ProgressBar isVisible={isRunning} progress={progress} />
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">
                    {isRunning ? `Processing... ${Math.round(progress)}%` : "Ready to Process"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {isRunning 
                      ? "Please wait while we process your files" 
                      : "Click run to start processing your files"
                    }
                  </p>
                </div>
                <Button
                  onClick={handleRun}
                  disabled={files.length === 0 || isRunning}
                  className={`px-6 py-2.5 rounded-lg font-medium transition-colors focus-ring flex items-center space-x-2 ${
                    progress === 100 
                      ? "bg-green-500 hover:bg-green-600 text-white" 
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  }`}
                  data-testid="run-tool-button"
                >
                  {isRunning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Running...</span>
                    </>
                  ) : progress === 100 ? (
                    <>
                      <span>✓</span>
                      <span>Complete</span>
                    </>
                  ) : (
                    <>
                      <span>▶</span>
                      <span>Run Tool</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Files Card */}
          <Card className="w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Output Files</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <OutputList files={outputFiles} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
