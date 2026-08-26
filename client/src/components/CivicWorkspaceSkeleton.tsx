export function CivicFeedSkeleton() {
  return (
    <div className="mt-4 grid gap-3" aria-label="Loading civic records" aria-busy="true">
      {[0, 1, 2].map((item) => (
        <article key={item} className="civic-skeleton rounded-[20px] border border-[#e1e6eb] bg-[#fbfcfd] p-4">
          <div className="h-5 w-24 rounded-full bg-[#e8edf2]" />
          <div className="mt-4 h-5 w-4/5 rounded-lg bg-[#e8edf2]" />
          <div className="mt-3 h-3 w-full rounded-lg bg-[#e8edf2]" />
          <div className="mt-2 h-3 w-3/4 rounded-lg bg-[#e8edf2]" />
          <div className="mt-4 flex gap-2"><span className="h-9 w-24 rounded-full bg-[#e8edf2]" /><span className="h-9 w-20 rounded-full bg-[#e8edf2]" /></div>
        </article>
      ))}
    </div>
  );
}

export function CivicWorkspaceSkeleton() {
  return (
    <main className="min-h-[100dvh] bg-[#f7f8fa] p-3 sm:p-6" aria-label="Loading JanaNiti workspace" aria-busy="true">
      <div className="mx-auto max-w-6xl">
        <div className="civic-skeleton h-44 rounded-[28px] bg-[#0a1317]" />
        <div className="mt-4 grid gap-4 lg:grid-cols-2"><div className="civic-skeleton h-[460px] rounded-[28px] bg-white" /><div className="civic-skeleton h-[460px] rounded-[28px] bg-white" /></div>
      </div>
    </main>
  );
}
