import { ArrowUp } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const ScrollUpButton = () => {
  const [visible, setVisible] = useState(() => (typeof window !== 'undefined' ? window.scrollY > 80 : false))

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = (event) => {
    event?.currentTarget?.blur?.()
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ? 'auto' : 'smooth',
    })
  }

  const buttonElement = (
    <button
      aria-hidden={!visible}
      aria-label="Scroll to top"
      className={`gift-detail-scroll-up ${visible ? 'is-visible' : ''}`}
      disabled={!visible}
      onClick={scrollToTop}
      tabIndex={visible ? 0 : -1}
      title="Scroll to top"
      type="button"
    >
      <ArrowUp size={22} strokeWidth={2.5} />
    </button>
  )

  if (typeof document === 'undefined') return null

  return createPortal(buttonElement, document.body)
}

export default ScrollUpButton
