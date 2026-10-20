const CHECKLISTS = {
  wedding: [
    {
      vendor: 'Venue',
      items: [
        'Confirm date and capacity',
        'Ask about power, parking and a rain plan',
        'Get the contract and payment schedule in writing',
      ],
    },
    {
      vendor: 'Caterer',
      items: [
        'Finalise menu and dietary options',
        'Book a tasting',
        'Confirm the final headcount deadline',
      ],
    },
    {
      vendor: 'Photographer',
      items: [
        'Agree shot list and hours of coverage',
        'Confirm delivery date for photos',
        'Get the contract in writing',
      ],
    },
    {
      vendor: 'Decorator',
      items: [
        'Share theme and colour palette',
        'Confirm setup and teardown times',
        'Approve a final quote',
      ],
    },
    {
      vendor: 'Entertainment',
      items: [
        'Book music or DJ',
        'Confirm sound equipment and power needs',
        'Share the schedule of the day',
      ],
    },
  ],
  birthday: [
    {
      vendor: 'Venue',
      items: [
        'Confirm date, time and capacity',
        'Ask about decoration rules',
        'Confirm the cleanup arrangement',
      ],
    },
    {
      vendor: 'Caterer and cake',
      items: [
        'Finalise menu and allergy notes',
        'Order the cake with a pickup time',
        'Plan drinks and snacks',
      ],
    },
    {
      vendor: 'Decorator',
      items: [
        'Choose the theme',
        'Order balloons and banners',
        'Confirm setup time',
      ],
    },
    {
      vendor: 'Entertainment',
      items: [
        'Plan games or hire a performer',
        'Prepare a playlist',
        'Arrange party favours',
      ],
    },
  ],
  community: [
    {
      vendor: 'Venue and permits',
      items: [
        'Confirm the venue booking',
        'Apply for local permits',
        'Arrange insurance and safety cover',
      ],
    },
    {
      vendor: 'Equipment',
      items: [
        'Book sound system and microphones',
        'Arrange seating and shade',
        'Plan lighting and power backup',
      ],
    },
    {
      vendor: 'Catering',
      items: [
        'Confirm food and water supply',
        'Check food-safety rules',
        'Plan waste collection',
      ],
    },
    {
      vendor: 'Volunteers and safety',
      items: [
        'Assign roles and shifts',
        'Prepare a first-aid kit',
        'Share an emergency contact list',
      ],
    },
  ],
}

/**
 * Returns the vendor checklist for an event type. Larger guest counts add
 * capacity and crowd-flow items to the first (venue) group. Returns fresh
 * copies so callers can never modify the shared defaults.
 */
export function generateChecklist(eventType, guestCount) {
  if (!Object.hasOwn(CHECKLISTS, eventType)) {
    throw new RangeError(`Unknown event type: ${eventType}`)
  }
  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 10000) {
    throw new RangeError('Guest count must be a whole number from 1 to 10000')
  }

  const list = CHECKLISTS[eventType].map(({ vendor, items }) => ({
    vendor,
    items: [...items],
  }))

  if (guestCount >= 100) {
    list[0].items.push(`Confirm capacity for ${guestCount} guests`)
  }
  if (guestCount >= 300) {
    list[0].items.push('Plan crowd flow, parking and security')
  }
  return list
}
