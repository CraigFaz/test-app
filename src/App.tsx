import { useState } from 'react'

function randomColor() {
  const h = Math.floor(Math.random() * 360)
  return `hsl(${h}, 70%, 55%)`
}

function App() {
  const [color, setColor] = useState('#6366f1')

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0f0f0f',
      gap: '1.5rem',
    }}>
      <h1 style={{ color: '#fff', fontFamily: 'sans-serif', margin: 0 }}>Color Changer</h1>
      <button
        onClick={() => setColor(randomColor())}
        style={{
          backgroundColor: color,
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          padding: '1rem 2.5rem',
          fontSize: '1.25rem',
          fontFamily: 'sans-serif',
          cursor: 'pointer',
          transition: 'background-color 0.3s ease',
          boxShadow: `0 0 24px ${color}88`,
        }}
      >
        Click me!
      </button>
      <p style={{ color: '#888', fontFamily: 'monospace', margin: 0 }}>{color}</p>
    </div>
  )
}

export default App
