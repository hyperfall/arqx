import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import PlannerIntegration from '../components/composer/PlannerIntegration';
import ToolRunnerV1_1 from '../components/tool/ToolRunnerV1_1';
import { ToolSpecV1_1 } from '../spec/schema';
import { initializeCache } from '../cache/storage';

// Demo examples that should work with fast-lane templates
const DEMO_EXAMPLES = [
  'Create a PDF viewer with thumbnails',
  'View images with zoom controls', 
  'Convert PNG to JPG with quality 80',
  'Resize images to 1920x1080',
  'MP4 to MP3 at 192 kbps',
  'Merge PDF files',
  'CSV to JSON converter',
  'JSON to CSV format'
];

export default function PlannerDemo() {
  const [currentToolSpec, setCurrentToolSpec] = useState<ToolSpecV1_1 | null>(null);
  const [generationHistory, setGenerationHistory] = useState<Array<{
    input: string;
    spec: ToolSpecV1_1;
    timestamp: Date;
  }>>([]);

  // Initialize cache on component mount
  React.useEffect(() => {
    initializeCache().catch(console.warn);
  }, []);

  const handleToolGenerated = (toolSpec: ToolSpecV1_1) => {
    setCurrentToolSpec(toolSpec);
    // Add to history (keep only last 5)
    setGenerationHistory(prev => [
      { input: 'Generated tool', spec: toolSpec, timestamp: new Date() },
      ...prev.slice(0, 4)
    ]);
  };

  const tryExample = async (example: string) => {
    const { planToolSpec } = await import('../planner');
    
    try {
      const toolSpec = await planToolSpec(example, [], {
        maxMB: 100,
        localOnly: true,
        uiModeHint: example.includes('viewer') || example.includes('view') ? 'live' : 'run'
      });
      
      setCurrentToolSpec(toolSpec);
      setGenerationHistory(prev => [
        { input: example, spec: toolSpec, timestamp: new Date() },
        ...prev.slice(0, 4)
      ]);
    } catch (error) {
      console.error('Failed to generate example:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">LLM-Powered Planner Demo</h1>
        <p className="text-muted-foreground">
          Test the ToolSpec v1.1 generation system with fast-lane templates and live/run modes.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Panel - Planner Interface */}
        <div className="xl:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate Tool</CardTitle>
            </CardHeader>
            <CardContent>
              <PlannerIntegration 
                onToolGenerated={handleToolGenerated}
                placeholder="Describe the tool you want..."
              />
            </CardContent>
          </Card>

          {/* Quick Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {DEMO_EXAMPLES.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => tryExample(example)}
                  >
                    <div>
                      <div className="font-medium">{example}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {example.includes('viewer') || example.includes('view') ? 'Live Mode' : 'Run Mode'}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Generation History */}
          {generationHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Tools</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {generationHistory.map((entry, index) => (
                    <div 
                      key={index}
                      className="p-2 rounded border cursor-pointer hover:bg-muted/50"
                      onClick={() => setCurrentToolSpec(entry.spec)}
                    >
                      <div className="text-sm font-medium truncate">{entry.spec.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={entry.spec.ui?.mode === 'live' ? 'default' : 'secondary'} className="text-xs">
                          {entry.spec.ui?.mode || 'run'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {entry.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Tool Preview */}
        <div className="xl:col-span-2">
          {currentToolSpec ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">{currentToolSpec.name}</CardTitle>
                    <p className="text-muted-foreground mt-1">{currentToolSpec.summary}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={currentToolSpec.ui?.mode === 'live' ? 'default' : 'secondary'}>
                      {currentToolSpec.ui?.mode || 'run'} mode
                    </Badge>
                    <Badge variant="outline">v{currentToolSpec.version}</Badge>
                  </div>
                </div>
              </CardHeader>
              
              <Separator />

              {/* Tool Spec Details */}
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h4 className="font-medium mb-2">Inputs ({currentToolSpec.inputs.length})</h4>
                    <div className="space-y-1">
                      {currentToolSpec.inputs.map(input => (
                        <div key={input.id} className="text-sm">
                          <Badge variant="outline" className="mr-2">{input.type}</Badge>
                          {input.label || input.id}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Pipeline ({currentToolSpec.pipeline.length})</h4>
                    <div className="space-y-1">
                      {currentToolSpec.pipeline.length > 0 ? (
                        currentToolSpec.pipeline.map((op, idx) => (
                          <div key={idx} className="text-sm">
                            <code className="bg-muted px-1 rounded text-xs">{op.op}</code>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-muted-foreground">No processing steps (live preview)</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Widgets Info */}
                {currentToolSpec.ui?.widgets && currentToolSpec.ui.widgets.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-2">Widgets ({currentToolSpec.ui.widgets.length})</h4>
                    <div className="space-y-1">
                      {currentToolSpec.ui.widgets.map(widget => (
                        <div key={widget.id} className="text-sm">
                          <Badge variant="outline" className="mr-2">{widget.type}</Badge>
                          {widget.title || widget.id}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-6" />

                {/* Live Tool Preview */}
                <div>
                  <h4 className="font-medium mb-4">Live Preview</h4>
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <ToolRunnerV1_1 toolSpec={currentToolSpec} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <CardContent>
                <div className="text-center text-muted-foreground">
                  <div className="text-6xl mb-4">🛠️</div>
                  <h3 className="text-xl font-medium mb-2">No Tool Selected</h3>
                  <p>Generate a tool or try one of the quick examples to get started.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}