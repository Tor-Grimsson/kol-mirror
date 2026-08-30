import { Studio, Blackface, Portable, Cassette, Skeleton, Broadcast, Copper, Loop, Meterbridge, Ghost } from './decks'

/* the set, listed apart from the components so `decks.jsx` exports components
   only (react-refresh) */
export const DECKS = [
  { id: 'studio', name: 'Studio', note: 'Aluminium flanges, three windows, copper spindle', Deck: Studio },
  { id: 'blackface', name: 'Blackface', note: 'Matte body, dark reels, one red hub', Deck: Blackface },
  { id: 'portable', name: 'Portable', note: 'Small reels, carry handle, field proportions', Deck: Portable },
  { id: 'cassette', name: 'Cassette', note: 'Not reels - two hubs behind a window', Deck: Cassette },
  { id: 'skeleton', name: 'Skeleton', note: 'Line art only, no fills', Deck: Skeleton },
  { id: 'broadcast', name: 'Broadcast', note: 'A rack unit, reels at the ends', Deck: Broadcast },
  { id: 'copper', name: 'Copper', note: 'Dark plate, copper everything', Deck: Copper },
  { id: 'loop', name: 'Loop', note: 'One reel, the tape a closed loop', Deck: Loop },
  { id: 'meterbridge', name: 'Meterbridge', note: 'Reels small, the meters are the subject', Deck: Meterbridge },
  { id: 'ghost', name: 'Ghost', note: 'The machine as a photocopy', Deck: Ghost },
]
