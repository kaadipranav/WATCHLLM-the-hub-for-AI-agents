export function StatusBadge({ status }: { status: string }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs text-amber-300">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
        running
      </span>
    );
  }

  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-xs text-emerald-300">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        completed
      </span>
    );
  }

  if (status === "failed") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-400/10 px-2 py-1 text-xs text-red-300">
        <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
        failed
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-gray-500/30 bg-gray-500/10 px-2 py-1 text-xs text-gray-300">
      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
      queued
    </span>
  );
}
