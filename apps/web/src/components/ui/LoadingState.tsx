/** Skeleton loading state — never a blank screen while data arrives. */
export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div role="status" aria-label={label} className="flex flex-col gap-3 py-6">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-shimmer h-16 rounded-card bg-[linear-gradient(90deg,#e6eef5_25%,#f2f7fb_50%,#e6eef5_75%)] bg-[length:200%_100%]"
        />
      ))}
      <span className="sr-only">{label}</span>
    </div>
  );
}
