import { Layers3 } from 'lucide-react'

export function Brand() {
  return (
    <a href="#top" className="brand" aria-label="Dummy-Down home">
      <span className="brand-mark">
        <Layers3 size={23} strokeWidth={1.8} aria-hidden="true" />
      </span>
      <span>
        Dummy<span className="brand-hyphen">-</span>Down
        <span className="brand-dot">.</span>
      </span>
    </a>
  )
}
