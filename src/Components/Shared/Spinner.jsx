export function Spinner({ dark = false, className = "" }) {
  return (
    <span
      className={`orvix-spinner ${dark ? "orvix-spinner-on-dark" : ""} ${className}`}
      aria-hidden
    />
  );
}

export function LoadingText({ children = "Loading…", className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Spinner />
      {children}
    </span>
  );
}

export function PageLoading({ children = "Loading…" }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-400">
      <Spinner />
      {children}
    </div>
  );
}
