// A titled card used for each result section; the heading labels the section for screen readers.
export default function ResultCard({ id, title, children }) {
  const headingId = `${id}-heading`
  return (
    <section className="result-card" aria-labelledby={headingId}>
      <h3 id={headingId} className="section-heading">
        {title}
      </h3>
      {children}
    </section>
  )
}
