import { cn } from "@/lib/utils";

export const Skeleton = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/5", className)}
      {...props}
    />
  );
};

export const SectionSkeleton = () => (
  <div className="space-y-8 p-10 md:p-24 rounded-[40px] border border-white/5 bg-[#0d0d0d] animate-pulse opacity-50">
    <div className="space-y-6 pt-8">
      <div className="h-4 w-1/3 bg-white/10 rounded mb-8"></div>

      <div className="space-y-3">
        <div className="h-3 w-full bg-white/5 rounded"></div>
        <div className="h-3 w-full bg-white/5 rounded"></div>
        <div className="h-3 w-11/12 bg-white/5 rounded"></div>
        <div className="h-3 w-full bg-white/5 rounded"></div>
      </div>

      <div className="space-y-3 pt-4">
        <div className="h-3 w-10/12 bg-white/5 rounded"></div>
        <div className="h-3 w-full bg-white/5 rounded"></div>
        <div className="h-3 w-full bg-white/5 rounded"></div>
        <div className="h-3 w-4/5 bg-white/5 rounded"></div>
      </div>
    </div>
  </div>
);
