// Renders the event planning form with full validation feedback and accessibility.
import { useId } from 'react'
import { EVENT_TYPES } from '../planner/budget'
import { capitalize } from '../utils/text'

const FIELD_ORDER = ['eventType', 'eventDate', 'guestCount', 'budget', 'theme']

// Named export used by App; receives its state and handlers as props.
export function PlanFormFields({ baseId, today, errors, onSubmit }) {
  const fallbackId = useId()
  const id = (field) => `${baseId ?? fallbackId}-${field}`
  const errId = (field) => `${baseId ?? fallbackId}-err-${field}`
  const hintId = (field) => `${baseId ?? fallbackId}-hint-${field}`

  const hasErrors = errors && Object.keys(errors).length > 0

  function handleSubmit(e) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    onSubmit({
      eventType: fd.get('eventType') ?? '',
      eventDate: fd.get('eventDate') ?? '',
      guestCount: fd.get('guestCount') ?? '',
      budget: fd.get('budget') ?? '',
      theme: fd.get('theme') ?? '',
    })
  }

  function describedBy(field, hasHint = false) {
    const parts = []
    if (hasHint) parts.push(hintId(field))
    if (errors?.[field]) parts.push(errId(field))
    return parts.length ? parts.join(' ') : undefined
  }

  return (
    <form
      className="plan-form"
      noValidate
      onSubmit={handleSubmit}
      aria-label="Event planner"
    >
      {/* Error summary — shown above fields when validation fails */}
      {hasErrors && (
        <div role="alert" className="plan-form__error-summary">
          <h3 className="plan-form__error-summary-heading">
            There are problems with your submission
          </h3>
          <ul className="plan-form__error-list">
            {FIELD_ORDER.filter((f) => errors[f]).map((f) => (
              <li key={f}>
                <a href={`#${id(f)}`}>{errors[f]}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Event type */}
      <div className="plan-form__group">
        <label className="plan-form__label" htmlFor={id('eventType')}>
          Event type
        </label>
        <select
          id={id('eventType')}
          name="eventType"
          className="plan-form__select"
          aria-invalid={errors?.eventType ? 'true' : undefined}
          aria-describedby={describedBy('eventType')}
          defaultValue=""
        >
          <option value="">Choose an event type</option>
          {EVENT_TYPES.map((t) => (
            <option key={t} value={t}>
              {capitalize(t)}
            </option>
          ))}
        </select>
        {errors?.eventType && (
          <p id={errId('eventType')} className="plan-form__error">
            {errors.eventType}
          </p>
        )}
      </div>

      {/* Event date */}
      <div className="plan-form__group">
        <label className="plan-form__label" htmlFor={id('eventDate')}>
          Event date
        </label>
        <input
          type="date"
          id={id('eventDate')}
          name="eventDate"
          className="plan-form__input"
          min={today}
          aria-invalid={errors?.eventDate ? 'true' : undefined}
          aria-describedby={describedBy('eventDate')}
        />
        {errors?.eventDate && (
          <p id={errId('eventDate')} className="plan-form__error">
            {errors.eventDate}
          </p>
        )}
      </div>

      {/* Guest count */}
      <div className="plan-form__group">
        <label className="plan-form__label" htmlFor={id('guestCount')}>
          Number of guests
        </label>
        <input
          type="text"
          inputMode="numeric"
          id={id('guestCount')}
          name="guestCount"
          className="plan-form__input"
          aria-invalid={errors?.guestCount ? 'true' : undefined}
          aria-describedby={describedBy('guestCount')}
        />
        {errors?.guestCount && (
          <p id={errId('guestCount')} className="plan-form__error">
            {errors.guestCount}
          </p>
        )}
      </div>

      {/* Budget */}
      <div className="plan-form__group">
        <label className="plan-form__label" htmlFor={id('budget')}>
          Total budget in rupees
        </label>
        <p id={hintId('budget')} className="plan-form__hint">
          Whole rupees, for example 500000
        </p>
        <input
          type="text"
          inputMode="numeric"
          id={id('budget')}
          name="budget"
          className="plan-form__input"
          aria-invalid={errors?.budget ? 'true' : undefined}
          aria-describedby={describedBy('budget', true)}
        />
        {errors?.budget && (
          <p id={errId('budget')} className="plan-form__error">
            {errors.budget}
          </p>
        )}
      </div>

      {/* Theme (optional) */}
      <div className="plan-form__group">
        <label className="plan-form__label" htmlFor={id('theme')}>
          Theme <span className="plan-form__optional">(optional)</span>
        </label>
        <input
          type="text"
          id={id('theme')}
          name="theme"
          className="plan-form__input"
          maxLength={60}
          aria-invalid={errors?.theme ? 'true' : undefined}
          aria-describedby={describedBy('theme')}
        />
        {errors?.theme && (
          <p id={errId('theme')} className="plan-form__error">
            {errors.theme}
          </p>
        )}
      </div>

      <button type="submit" className="btn btn--primary plan-form__submit">
        Create my plan
      </button>
    </form>
  )
}
