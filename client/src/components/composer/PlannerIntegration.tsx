import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Zap, Brain, AlertTriangle } from 'lucide-react';
import { planToolSpec, getPlanningStatus, explainPlan } from '../../planner';
import { ToolSpecV1_1 } from '../../spec/schema';

interface PlannerIntegrationProps {
  onToolGenerated: (toolSpec: ToolSpecV1_1) => void;
  onError?: (error: string) => void;
  placeholder?: string;
}

export default function PlannerIntegration({ 
  onToolGenerated, 
  onError, 
  placeholder = "Describe the tool you want to create..."
}: PlannerIntegrationProps) {
  const [userInput, setUserInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const planningStatus = getPlanningStatus();

  const handleGenerate = async () => {
    if (!userInput.trim()) return;

    setIsGenerating(true);
    setLastError(null);

    try {
      // Generate tool spec using planner
      const toolSpec = await planToolSpec(userInput, [], {
        maxMB: 100,
        localOnly: true,
        uiModeHint: 'run' // Can be determined based on input analysis
      });

      // Pass the generated tool to parent
      onToolGenerated(toolSpec);
      
      // Clear input on success
      setUserInput('');
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate tool';
      setLastError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <Card className="border-primary/20">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Status indicator */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {planningStatus.llmAvailable ? (
              <div className="flex items-center gap-1">
                <Brain className="w-4 h-4 text-primary" />
                <span>AI Planner Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span>Fast Templates Only</span>
              </div>
            )}
          </div>

          {/* Input field */}
          <div className="relative">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              disabled={isGenerating}
              className="pr-20"
              data-testid="input-tool-description"
            />
            
            <Button
              onClick={handleGenerate}
              disabled={!userInput.trim() || isGenerating}
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-7"
              data-testid="button-generate-tool"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Generate'
              )}
            </Button>
          </div>

          {/* Error display */}
          {lastError && (
            <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{lastError}</span>
            </div>
          )}

          {/* Planning status info */}
          {!planningStatus.llmAvailable && (
            <div className="text-xs text-muted-foreground">
              Using built-in templates for common operations. Enable LLM planning for more sophisticated tools.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook for easy integration
export function usePlanner() {
  return {
    planToolSpec,
    getPlanningStatus,
    explainPlan
  };
}