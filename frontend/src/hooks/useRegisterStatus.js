import { useEffect, useState } from 'react'

import authService from '../services/authService'
import { getErrorMessage, getResponseData } from '../services/api'

const useRegisterStatus = () => {
  const [status, setStatus] = useState({ enabled: null, otp_enabled: false, otp_cooldown: 60 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    authService
      .getRegisterStatus()
      .then((response) => {
        const data = getResponseData(response) || {}
        setStatus({
          enabled: Boolean(data.enabled),
          otp_enabled: Boolean(data.otp_enabled),
          otp_cooldown: Number(data.otp_cooldown || 60),
        })
      })
      .catch((err) => {
        setStatus((current) => ({ ...current, enabled: false }))
        setError(getErrorMessage(err, 'Failed to check registration status'))
      })
      .finally(() => setLoading(false))
  }, [])

  return { ...status, loading, error }
}

export default useRegisterStatus
