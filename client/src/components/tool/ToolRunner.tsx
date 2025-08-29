// Wrapper for backward compatibility - delegates to v1.1 implementation
import ToolRunnerV1_1 from './ToolRunnerV1_1';
import { ToolSpecV1_1, upgradeToV1_1 } from "../../spec/schema";

interface ToolRunnerProps {
  toolSpec: any; // Accept both old and new formats
}

export default function ToolRunner({ toolSpec }: ToolRunnerProps) {
  // Convert legacy toolSpec to v1.1 format if needed
  const toolSpecV1_1: ToolSpecV1_1 = toolSpec.version === '1' ? toolSpec : upgradeToV1_1(toolSpec);
  
  // Use the new v1.1 ToolRunner
  return <ToolRunnerV1_1 toolSpec={toolSpecV1_1} />;
}