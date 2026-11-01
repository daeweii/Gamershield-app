export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="sx-loading" role="status" aria-live="polite">
      <span className="sx-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
