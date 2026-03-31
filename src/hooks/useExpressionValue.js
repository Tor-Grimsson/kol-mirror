import { useState, useEffect, useRef, useCallback } from 'react'

function isExpression(str) {
  return /[a-df-zA-DF-Z]/.test(str)
}

const HELPERS = `
  var bus=typeof __bus!=='undefined'&&__bus?__bus:{},
      lfo1=bus.lfo1||0,lfo2=bus.lfo2||0,seq1=bus.seq1||0,gate1=bus.gate1||0,env1=bus.env1||0,sh1=bus.sh1||0,
      mult1_a=bus.mult1_a||0,mult1_b=bus.mult1_b||0,mult1_c=bus.mult1_c||0,
      sin=Math.sin,cos=Math.cos,abs=Math.abs,floor=Math.floor,ceil=Math.ceil,
      round=Math.round,sqrt=Math.sqrt,pow=Math.pow,PI=Math.PI,PHI=1.618033988749895,
      wave=function(x){return(sin(x)*0.5+0.5)*max},
      saw=function(x){return(x%1)*max},
      pulse=function(x,w){w=w||0.5;var p=((x%1)+1)%1;return p<w?max:0},
      rand=function(){return Math.random()*max},
      tri=function(x){var p=((x%1)+1)%1;return(p<0.5?p*2:(1-p)*2)*max},
      ease=function(x,c){c=c||2;var p=((x%1)+1)%1;var v=p<0.5?p*2:(1-p)*2;return pow(v,c)*max},
      bell=function(x){var p=((x%1)+1)%1;return Math.exp(-pow((p-0.5)*6,2))*max},
      exp=function(x){var p=((x%1)+1)%1;return(Math.exp(p*3)-1)/(Math.exp(3)-1)*max},
      log=function(x){var p=((x%1)+1)%1;return Math.log(1+p*9)/Math.log(10)*max},
      step=function(x,n){n=n||4;var p=((x%1)+1)%1;return floor(p*n)/n*max};
`

export function compile(expr) {
  try {
    return new Function('t', 'f', 'min', 'max', '__bus', `${HELPERS}return (${expr})`)
  } catch {
    return null
  }
}

export default function useExpressionValue({ onChange, min = 0, max = 100, busRef }) {
  const [expr, setExpr] = useState(null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange
  const rafRef = useRef(null)
  const startRef = useRef(null)
  const frameRef = useRef(0)

  useEffect(() => {
    if (!expr) { frameRef.current = 0; return }
    const fn = compile(expr)
    if (!fn) { setExpr(null); return }
    const start = startRef.current ?? performance.now() / 1000
    startRef.current = start
    frameRef.current = 0
    const tick = () => {
      const t = performance.now() / 1000 - start
      const f = frameRef.current++
      try {
        const raw = fn(t, f, min, max, busRef?.current)
        onChangeRef.current(Math.max(min, Math.min(max, Math.round(raw))))
      } catch { /* silent */ }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [expr, min, max])

  const commit = useCallback((draft, currentOnChange) => {
    const trimmed = draft.trim()
    if (!trimmed) {
      setExpr(null)
      return
    }
    const n = parseFloat(trimmed)
    if (!isNaN(n) && !isExpression(trimmed)) {
      setExpr(null)
      currentOnChange(Math.round(n))
    } else {
      startRef.current = performance.now() / 1000
      setExpr(trimmed)
    }
  }, [])

  return { expr, commit, isAnimating: expr !== null }
}
