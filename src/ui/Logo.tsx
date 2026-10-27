/** EON WORLD wordmark: serif capitals, a four-point star inside the O, script tagline. */
export function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <radialGradient id="eon-star-glow"><stop offset="0" stopColor="#fff7ec" stopOpacity=".9" /><stop offset="1" stopColor="#fff7ec" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="20" cy="20" r="14" fill="url(#eon-star-glow)" />
      <path d="M20 2 C21.2 14 26 18.8 38 20 C26 21.2 21.2 26 20 38 C18.8 26 14 21.2 2 20 C14 18.8 18.8 14 20 2Z" fill="#fffaf2" />
    </svg>
  );
}
export function Logo({ size = 'large', tagline = true }: { size?: 'large' | 'small'; tagline?: boolean }) {
  return (
    <div className={'eon-logo eon-logo--' + size} role="img" aria-label={'EON WORLD' + (tagline ? '. Tu historia deja huella' : '')}>
      <div className="eon-word" aria-hidden="true">
        <span>E</span><span className="eon-o">O<Star className="eon-star" /></span><span>N</span>
      </div>
      <div className="eon-world" aria-hidden="true"><i /><span>WORLD</span><i /></div>
      {tagline && <div className="eon-tag" aria-hidden="true">Tu historia deja huella</div>}
    </div>
  );
}
