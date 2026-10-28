// Displays AI or offline event ideas with loading, error, and retry states.
export default function IdeasPanel({ status, ideas, source, onRetry }) {
  return (
    <section className="ideas-panel" aria-labelledby="ideas-heading">
      <h3 id="ideas-heading" className="section-heading">
        Ideas &amp; inspiration
      </h3>

      {status === 'loading' && (
        <p className="ideas-panel__loading" aria-live="polite" aria-busy="true">
          Finding ideas for you&hellip;
        </p>
      )}

      {status === 'error' && (
        <div className="ideas-panel__error" role="alert">
          <p>Could not load ideas. Please try again.</p>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={onRetry}
          >
            Try again
          </button>
        </div>
      )}

      {status === 'done' && ideas.length > 0 && (
        <>
          {source === 'offline' && (
            <p className="ideas-panel__source-note">Showing built-in ideas</p>
          )}
          {source === 'ai' && (
            <p className="ideas-panel__source-note">
              AI-generated ideas (Gemini). Please review before using them.
            </p>
          )}
          <ul className="ideas-panel__list">
            {ideas.map((idea) => (
              <li key={idea.title} className="ideas-panel__card">
                <p className="ideas-panel__card-title">
                  <strong>{idea.title}</strong>
                </p>
                <p className="ideas-panel__card-desc">{idea.description}</p>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
