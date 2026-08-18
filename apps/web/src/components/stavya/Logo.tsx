import { cn } from "@/lib/cn";

export function Logo({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/brand/stavya-logo.png"
      alt="Stavya Spine Hospital"
      className={cn("h-16 w-auto object-contain drop-shadow-sm", className)}
      loading="eager"
      decoding="async"
    />
  );
}
