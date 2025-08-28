import { useState } from "react";
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

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
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

          {/* Settings Card */}
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
        </div>

        {/* Right Column: Ready to Process and Output Files */}
        <div className="space-y-5">
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
