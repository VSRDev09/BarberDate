export function SectionTitle({ eyebrow, title, description, align = 'left' }) {
  return (
    <div className={align === 'center' ? 'text-center' : 'text-left'}>
      {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
      <h2 className="font-display text-4xl text-[#f8f0d7] sm:text-5xl">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/60 sm:text-base">{description}</p>
      ) : null}
    </div>
  )
}
