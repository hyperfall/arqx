import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToolSpecV1_1 } from "../../spec/schema";
import Dropzone from "./Dropzone";
import ProgressBar from "./ProgressBar";
import OutputList from "./OutputList";
import WidgetHost from "../../widgets/WidgetHost";

interface ToolRunnerProps {
  toolSpec: ToolSpecV1_1;
}

export default function ToolRunnerV1_1({ toolSpec }: ToolRunnerProps) {
  // Initialize settings from v1.1 inputs that aren't file inputs
  const [settings, setSettings] = useState(() => {
    const initialSettings: Record<string, any> = {};
    toolSpec.inputs.forEach(input => {
      if (input.type !== 'file' && input.type !== 'file[]' && input.default !== undefined) {
        initialSettings[input.id] = input.default;
      }
    });
    return initialSettings;
  });
  
  const [files, setFiles] = useState<File[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputFiles, setOutputFiles] = useState<Array<{ name: string; size: number; url: string }>>([]);
  const [sessionState, setSessionState] = useState<Record<string, any>>({});

  // Determine UI mode
  const uiMode = toolSpec.ui?.mode || 'run';
  const isLiveMode = uiMode === 'live';

  // Get file inputs
  const fileInputs = toolSpec.inputs.filter(input => input.type === 'file' || input.type === 'file[]');
  const settingInputs = toolSpec.inputs.filter(input => input.type !== 'file' && input.type !== 'file[]');

  // Create input mapping for widgets
  const inputMapping = useMemo(() => {
    const mapping: Record<string, File | undefined> = {};
    
    // Map files to input IDs based on file inputs
    fileInputs.forEach(input => {
      if (input.accept) {
        const matchingFile = files.find(file => 
          input.accept?.some(accept => 
            file.type === accept || 
            file.type.startsWith(accept.replace('*', '')) ||
            accept === '*/*'
          )
        );
        mapping[input.id] = matchingFile;
      }
    });
    
    return mapping;
  }, [files, fileInputs]);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSessionStateChange = (key: string, value: any) => {
    setSessionState(prev => ({ ...prev, [key]: value }));
  };

  const handleWidgetEvent = (event: string, payload?: any) => {
    console.log('Widget event:', event, payload);
  };

  // Get accepted file types from file inputs
  const acceptedTypes = useMemo(() => {
    const types = new Set<string>();
    fileInputs.forEach(input => {
      input.accept?.forEach(type => types.add(type));
    });
    return Array.from(types);
  }, [fileInputs]);

  const maxFileSize = useMemo(() => {
    const maxMB = Math.max(...fileInputs.map(input => input.maxMB || 50));
    return maxMB * 1024 * 1024; // Convert MB to bytes
  }, [fileInputs]);

  const allowMultiple = fileInputs.some(input => input.type === 'file[]');

  const handleRun = async () => {
    if (files.length === 0 && fileInputs.length > 0) return;
    
    setIsRunning(true);
    setProgress(0);
    setOutputFiles([]);

    try {
      // Simulate processing based on pipeline operations
      const totalSteps = Math.max(toolSpec.pipeline.length, 1);
      
      for (let i = 0; i < totalSteps; i++) {
        const stepProgress = ((i + 1) / totalSteps) * 100;
        setProgress(stepProgress);
        
        // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
      }

      // Generate mock output based on output spec
      if (toolSpec.output.type !== 'none') {
        const outputs = files.map((file, index) => {
          const baseName = file.name.replace(/\.[^/.]+$/, '');
          const outputName = toolSpec.output.naming 
            ? toolSpec.output.naming.replace('{name}', baseName).replace('{ext}', getOutputExtension(toolSpec))
            : `${baseName}_processed.txt`;
          
          return {
            name: outputName,
            size: Math.floor(file.size * 0.8), // Simulate compression
            url: URL.createObjectURL(file), // Mock URL
          };
        });

        setOutputFiles(outputs);
      }

      setIsRunning(false);
      setProgress(100);
    } catch (error) {
      setIsRunning(false);
      console.error('Processing failed:', error);
    }
  };

  const getOutputExtension = (spec: ToolSpecV1_1): string => {
    // Try to infer output extension from pipeline operations
    const hasImageOps = spec.pipeline.some(op => op.op.startsWith('image.to_'));
    if (hasImageOps) return '.jpg';
    
    const hasPdfOps = spec.pipeline.some(op => op.op.startsWith('pdf.'));
    if (hasPdfOps) return '.pdf';
    
    const hasTextOps = spec.pipeline.some(op => op.op.startsWith('text.'));
    if (hasTextOps) return '.txt';
    
    return '.out';
  };

  const renderSettingInput = (input: any) => {
    const value = settings[input.id];
    
    switch (input.type) {
      case 'number':
        if (input.min !== undefined && input.max !== undefined) {
          // Render as slider if has min/max
          return (
            <div key={input.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="font-medium">{input.label || input.id}</Label>
                <span className="text-sm text-muted-foreground tabular-nums">{value}</span>
              </div>
              <Slider
                value={[value || input.default || input.min]}
                onValueChange={(vals) => handleSettingChange(input.id, vals[0])}
                min={input.min}
                max={input.max}
                step={input.step || 1}
                className="w-full"
              />
            </div>
          );
        } else {
          // Render as number input
          return (
            <div key={input.id} className="space-y-2">
              <Label className="font-medium">{input.label || input.id}</Label>
              <Input
                type="number"
                value={value || input.default || ''}
                onChange={(e) => handleSettingChange(input.id, Number(e.target.value))}
                min={input.min}
                max={input.max}
                step={input.step}
                placeholder={input.placeholder}
              />
            </div>
          );
        }

      case 'boolean':
        return (
          <div key={input.id} className="flex items-center justify-between">
            <Label className="font-medium">{input.label || input.id}</Label>
            <Switch
              checked={value !== undefined ? value : (input.default || false)}
              onCheckedChange={(checked) => handleSettingChange(input.id, checked)}
            />
          </div>
        );

      case 'select':
        return (
          <div key={input.id} className="space-y-2">
            <Label className="font-medium">{input.label || input.id}</Label>
            <Select
              value={value || input.default || ''}
              onValueChange={(val) => handleSettingChange(input.id, val)}
            >
              <SelectTrigger>
                <SelectValue placeholder={input.placeholder || "Select an option"} />
              </SelectTrigger>
              <SelectContent>
                {input.options?.map((option: {value: string, label: string}) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'text':
      default:
        return (
          <div key={input.id} className="space-y-2">
            <Label className="font-medium">{input.label || input.id}</Label>
            <Input
              value={value || input.default || ''}
              onChange={(e) => handleSettingChange(input.id, e.target.value)}
              placeholder={input.placeholder}
            />
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Always show file inputs if needed */}
      {fileInputs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Input Files</CardTitle>
          </CardHeader>
          <CardContent>
            <Dropzone 
              onFilesSelected={setFiles}
              accept={acceptedTypes}
              maxSize={maxFileSize}
              multiple={allowMultiple}
            />
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Live Mode: Render Widgets */}
      {isLiveMode && toolSpec.ui?.widgets && (
        <div className="space-y-4">
          {/* Main Layout Widgets */}
          {toolSpec.ui.layout?.main?.map((widgetId) => {
            const widget = toolSpec.ui?.widgets?.find(w => w.id === widgetId);
            if (!widget) return null;
            
            return (
              <Card key={widgetId} className="overflow-hidden">
                {widget.title && (
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{widget.title}</CardTitle>
                  </CardHeader>
                )}
                <CardContent className="p-0">
                  <WidgetHost
                    widget={widget}
                    inputMapping={inputMapping}
                    sessionState={sessionState}
                    onStateChange={handleSessionStateChange}
                    onEvent={handleWidgetEvent}
                  />
                </CardContent>
              </Card>
            );
          })}

          {/* Inspector Layout Widgets */}
          {toolSpec.ui.layout?.inspector && toolSpec.ui.layout.inspector.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                {/* Main content already rendered above */}
              </div>
              <div className="space-y-4">
                {toolSpec.ui.layout.inspector.map((widgetId) => {
                  const widget = toolSpec.ui?.widgets?.find(w => w.id === widgetId);
                  if (!widget) return null;
                  
                  return (
                    <Card key={widgetId} className="overflow-hidden">
                      {widget.title && (
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
                        </CardHeader>
                      )}
                      <CardContent className="p-2">
                        <WidgetHost
                          widget={widget}
                          inputMapping={inputMapping}
                          sessionState={sessionState}
                          onStateChange={handleSessionStateChange}
                          onEvent={handleWidgetEvent}
                        />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Run Mode: Show Settings and Run Controls */}
      {!isLiveMode && (
        <>
          {/* Settings */}
          {settingInputs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settingInputs.map(renderSettingInput)}
              </CardContent>
            </Card>
          )}

          {/* Run Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <Button 
                  onClick={handleRun} 
                  disabled={isRunning || (fileInputs.length > 0 && files.length === 0)}
                  className="px-8"
                  data-testid="button-run"
                >
                  {isRunning ? 'Processing...' : 'Run Tool'}
                </Button>
                
                {isRunning && (
                  <div className="flex-1 ml-4">
                    <ProgressBar progress={progress} isVisible={true} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Output */}
          {outputFiles.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold">Output Files</CardTitle>
              </CardHeader>
              <CardContent>
                <OutputList files={outputFiles} />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Notes/Explanation */}
      {toolSpec.notes && toolSpec.notes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm text-muted-foreground space-y-1">
              {toolSpec.notes.map((note, index) => (
                <li key={index}>• {note}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}