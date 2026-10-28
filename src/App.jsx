// Root application component: manages plan state, ideas fetching, and renders all sections.
import { useState, useRef, useId } from 'react'
import { buildPlan } from './planner/plan'
import { todayISO } from './planner/timeline'
import { getIdeas } from './services/ideas'
import { PlanFormFields } from './components/PlanForm'
import BudgetTable from './components/BudgetTable'
import Timeline from './components/Timeline'
import Checklist from './components/Checklist'
import IdeasPanel from './components/IdeasPanel'
import ResultCard from './components/ResultCard'
import { formatINR } from './utils/formatCurrency'
import { formatDisplayDate } from './utils/formatDate'
import { capitalize } from './utils/text'
import './App.css'

const FIELD_ORDER = ['eventType', 'eventDate', 'guestCount', 'budget', 'theme']

export default function App() {
  const today = todayISO()
  const baseId = useId()

  const [formErrors, setFormErrors] = useState(null)
  const [plan, setPlan] = useState(null)
  // Changes with every new plan so per-plan state (like ticked checklist items) starts fresh
  const [planVersion, setPlanVersion] = useState(0)

  // Ideas state
  const [ideasStatus, setIdeasStatus] = useState('idle') // idle | loading | done | error
  const [ideasData, setIdeasData] = useState(null)
  const requestCounter = useRef(0)

  // Ref for moving focus to the results after a plan is created
  const resultsHeadingRef = useRef(null)

  function fetchIdeas(planInput) {
    const myCount = ++requestCounter.current
    setIdeasStatus('loading')
    setIdeasData(null)
    getIdeas(planInput)
      .then((result) => {
        if (myCount !== requestCounter.current) return
        setIdeasData(result)
        setIdeasStatus('done')
      })
      .catch(() => {
        if (myCount !== requestCounter.current) return
        setIdeasStatus('error')
      })
  }

  function handleSubmit(values) {
    const result = buildPlan(values)

    if (result.errors) {
      setFormErrors(result.errors)
      // Focus the first invalid field once the errors have rendered
      const firstBad = FIELD_ORDER.find((f) => result.errors[f])
      requestAnimationFrame(() => {
        document.getElementById(`${baseId}-${firstBad}`)?.focus()
      })
      return
    }

    setFormErrors(null)
    setPlan(result.plan)
    setPlanVersion((version) => version + 1)

    // Focus the results heading
    requestAnimationFrame(() => {
      resultsHeadingRef.current?.focus()
    })

    fetchIdeas(result.plan.input)
  }

  function handleRetryIdeas() {
    if (plan) fetchIdeas(plan.input)
  }

  const totalBudget = plan
    ? plan.budget.reduce((sum, row) => sum + row.amount, 0)
    : 0

  return (
    <>
      {/* Skip link — first focusable element on the page */}
      <a href="#main" className="skip-link">
        Skip to main content
      </a>

      <header className="site-header">
        <div className="site-header__inner">
          <span className="site-header__icon" aria-hidden="true">
            🎉
          </span>
          <h1 className="site-header__title">Celebration Planner</h1>
          <p className="site-header__tagline">
            Weddings · Birthdays · Community events
          </p>
        </div>
      </header>

      <main id="main" className="site-main">
        <section
          className="form-section"
          aria-labelledby="form-section-heading"
        >
          <h2 id="form-section-heading" className="section-heading">
            Plan your event
          </h2>
          <PlanFormFields
            baseId={baseId}
            today={today}
            errors={formErrors}
            onSubmit={handleSubmit}
          />
        </section>

        {plan && (
          <section
            className="results-section"
            aria-labelledby="results-heading"
          >
            {/* Results heading — focus target after successful plan creation */}
            <h2
              id="results-heading"
              className="section-heading results-section__heading"
              ref={resultsHeadingRef}
              tabIndex={-1}
            >
              Your plan is ready
            </h2>

            {/* Summary line */}
            <p className="results-section__summary">
              <strong>{capitalize(plan.input.eventType)}</strong> on{' '}
              <strong>{formatDisplayDate(plan.input.eventDate)}</strong> for{' '}
              <strong>{plan.input.guestCount}</strong> guests · Budget{' '}
              <strong>{formatINR(plan.input.budget)}</strong>
            </p>

            {/* Budget */}
            <ResultCard id="budget-section" title="Budget">
              <BudgetTable rows={plan.budget} total={totalBudget} />
            </ResultCard>

            {/* Timeline */}
            <ResultCard id="timeline-section" title="Timeline">
              <Timeline items={plan.timeline} />
            </ResultCard>

            {/* Vendor checklist */}
            <ResultCard id="checklist-section" title="Vendor checklist">
              <Checklist key={planVersion} vendors={plan.checklist} />
            </ResultCard>

            {/* Ideas */}
            <div className="result-card">
              <IdeasPanel
                status={ideasStatus}
                ideas={ideasData?.ideas ?? []}
                source={ideasData?.source}
                onRetry={handleRetryIdeas}
              />
            </div>

            {/* Print button */}
            <div className="results-section__actions">
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => window.print()}
              >
                Print plan
              </button>
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <p>© {new Date().getFullYear()} Celebration Planner</p>
      </footer>
    </>
  )
}
