// Renders vendor fieldsets with native checkboxes and a live completion counter.
import { useState, useId } from 'react'

// Flattens all checklist items into a single count for the status message.
function countTotals(vendors) {
  return vendors.reduce((sum, v) => sum + v.items.length, 0)
}

export default function Checklist({ vendors }) {
  const baseId = useId()
  const total = countTotals(vendors)

  // checked[vendorIndex][itemIndex] = boolean
  const [checked, setChecked] = useState(() =>
    vendors.map((v) => v.items.map(() => false)),
  )

  const done = checked.reduce(
    (sum, group) => sum + group.filter(Boolean).length,
    0,
  )

  function toggle(vi, ii) {
    setChecked((prev) =>
      prev.map((group, gi) =>
        gi === vi ? group.map((val, idx) => (idx === ii ? !val : val)) : group,
      ),
    )
  }

  return (
    <div className="checklist">
      <p className="checklist__status" role="status" aria-live="polite">
        {done} of {total} tasks done
      </p>
      {vendors.map((vendor, vi) => (
        <fieldset key={vendor.vendor} className="checklist__fieldset">
          <legend className="checklist__legend">{vendor.vendor}</legend>
          <ul className="checklist__list">
            {vendor.items.map((item, ii) => {
              const inputId = `${baseId}-v${vi}-i${ii}`
              return (
                <li key={item} className="checklist__item">
                  <input
                    type="checkbox"
                    id={inputId}
                    className="checklist__checkbox"
                    checked={checked[vi][ii]}
                    onChange={() => toggle(vi, ii)}
                  />
                  <label htmlFor={inputId} className="checklist__label">
                    {item}
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>
      ))}
    </div>
  )
}
