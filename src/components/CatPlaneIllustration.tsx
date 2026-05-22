import './CatPlaneIllustration.css'

export function CatPlaneIllustration() {
  return (
    <div className="hero-scene" aria-hidden>
      <img
        src="/hero-cat-plane.png"
        alt=""
        className="hero-cat-image"
        draggable={false}
      />
    </div>
  )
}
