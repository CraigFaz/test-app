import { useState, useRef } from 'react'
import './App.css'

function randomColor() {
  const h = Math.floor(Math.random() * 360)
  return `hsl(${h}, 70%, 58%)`
}

interface Ripple {
  id: number
  x: number
  y: number
}

function ColorButton({ label, color, onColorChange, onCount }: {
  label: string
  color: string
  onColorChange: (color: string) => void
  onCount: () => void
}) {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const nextId = useRef(0)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = nextId.current++
    setRipples(prev => [...prev, { id, x, y }])
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700)
    onColorChange(randomColor())
    onCount()
  }

  return (
    <div className="button-wrap">
      <button
        className="color-btn"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 28px ${color}99, 0 0 60px ${color}44`,
        }}
        onClick={handleClick}
      >
        {ripples.map(r => (
          <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
        ))}
        {label}
      </button>
      <span className="color-code" style={{ color }}>{color}</span>
    </div>
  )
}

function App() {
  const [colors, setColors] = useState(['#f43f5e', '#6366f1', '#10b981'])
  const [total, setTotal] = useState(0)

  const handleColorChange = (index: number, color: string) => {
    setColors(prev => {
      const next = [...prev]
      next[index] = color
      return next
    })
  }

  const labels = ['Button A', 'Button B', 'Button C']

  return (
    <div className="app">
      <div className="blob blob-0" style={{ background: colors[0] }} />
      <div className="blob blob-1" style={{ background: colors[1] }} />
      <div className="blob blob-2" style={{ background: colors[2] }} />

      <div className="content">
        <h1 className="title">Color Changer</h1>

        <div className="counter-display">
          <span className="counter-label">Total Clicks</span>
          <span className="counter-number" key={total}>{total}</span>
        </div>

        <div className="buttons">
          {colors.map((color, i) => (
            <ColorButton
              key={i}
              label={labels[i]}
              color={color}
              onColorChange={(c) => handleColorChange(i, c)}
              onCount={() => setTotal(t => t + 1)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
