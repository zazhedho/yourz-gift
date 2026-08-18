import { useEffect, useRef } from 'react'

import { getTurnstileSiteKey } from '../../utils/runtimeConfig'

const turnstileScriptId = 'cloudflare-turnstile-script'
let turnstileScriptPromise

const loadTurnstileScript = () => {
  if (window.turnstile) return Promise.resolve()
  if (turnstileScriptPromise) return turnstileScriptPromise

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(turnstileScriptId)
    const script = existing || document.createElement('script')
    script.id = turnstileScriptId
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.onload = resolve
    script.onerror = () => reject(new Error('Turnstile failed to load'))
    if (!existing) document.head.appendChild(script)
  })

  return turnstileScriptPromise
}

const TurnstileWidget = ({ action = 'auth', onError, onToken, resetKey = 0 }) => {
  const containerRef = useRef(null)
  const onErrorRef = useRef(onError)
  const onTokenRef = useRef(onToken)
  const siteKey = getTurnstileSiteKey()

  useEffect(() => {
    onErrorRef.current = onError
    onTokenRef.current = onToken
  }, [onError, onToken])

  useEffect(() => {
    if (!siteKey) return undefined

    let cancelled = false
    let widgetId

    loadTurnstileScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.turnstile) return

        widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme: 'light',
          callback: (token) => onTokenRef.current?.(token),
          'expired-callback': () => onTokenRef.current?.(''),
          'error-callback': () => {
            onTokenRef.current?.('')
            onErrorRef.current?.('Captcha verification is unavailable. Please try again.')
          },
        })
      })
      .catch((error) => onErrorRef.current?.(error.message))

    return () => {
      cancelled = true
      if (widgetId !== undefined && window.turnstile?.remove) window.turnstile.remove(widgetId)
    }
  }, [action, resetKey, siteKey])

  return siteKey ? <div className="turnstile-widget" ref={containerRef} /> : null
}

export default TurnstileWidget
