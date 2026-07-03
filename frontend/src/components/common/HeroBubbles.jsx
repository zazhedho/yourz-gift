const HeroBubbles = () => {
  return (
    <div className="hero-bubbles">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="bubble" />
      ))}
    </div>
  )
}

export default HeroBubbles
