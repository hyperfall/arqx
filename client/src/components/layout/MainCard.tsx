import { useDockPadding } from "@/lib/useDockPadding";
import { cn } from "@/lib/utils";

interface MainCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function MainCard({ children, className }: MainCardProps) {
  const { paddingBottom } = useDockPadding();

  return (
    <main className={cn(
      "relative rounded-3xl bg-[color:var(--card)] shadow-[0_12px_40px_rgba(0,0,0,0.08)] ring-1 ring-black/5 overflow-hidden h-full z-0 dark:ring-white/10 flex flex-col",
      className
    )} style={{ paddingBottom: paddingBottom ? `${paddingBottom + 24}px` : undefined }}>
      <div className="px-10 py-8 flex-1 overflow-y-auto">
        {children}
      </div>
    </main>
  );
}
