import { guests } from "./guests"
import { guestPreferences } from "./guestPreferences"
import { guestHistory } from "./guestHistory"

export const guestsForUI = guests.map((g) => {
  const preferences = guestPreferences.find((p) => p.guest_id === g.guest_id) || null
  return { ...g, preferences }
})

export { guests, guestPreferences, guestHistory }
