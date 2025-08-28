import { cn } from "@/lib/utils";

interface ProgressBarProps {
  isVisible: boolean;
  progress: number;
}

export default function ProgressBar({ isVisible, progress }: ProgressBarProps) {
  if (!isVisible) return null;

  return (
    <div className="absolute top-0 left-0 right-0 h-0.5 bg-muted rounded-full overflow-hidden mb-4">
      <div 
        className="h-full bg-primary transition-all duration-300"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-live="polite"
        aria-label={`Processing ${Math.round(progress)}% complete`}
      />
    </div>
  );
}
