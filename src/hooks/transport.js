/**
 * The timeline — Mirror's one clock, the KOL's transport (`createTransport`, kol-hardware 0.8.0,
 * TransportAndTimeline, plan 19 W2). Knob expressions, the scope, the studio's animate, the strip
 * and the Transport panel all read this instance; Space is play/pause (bound in App's Shell). The
 * hand-written clock it replaced is in _tmp/2026-10-28-plan19/hooks/transport-local.js.
 */
import { createTransport, TRANSPORT_MODES } from '@kolkrabbi/kol-hardware/signal'
import { useTransport as useKolTransport, useTransportPlaying as useKolTransportPlaying } from '@kolkrabbi/kol-hardware/panel/useTransport.js'

export const MODES = TRANSPORT_MODES
export const transport = createTransport()
export const useTransport = () => useKolTransport(transport)
export const useTransportPlaying = () => useKolTransportPlaying(transport)
