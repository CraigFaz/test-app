import { useRef, useState } from 'react'
import './App.css'
import { StoreProvider, useStore } from './store'
import { GroupList } from './components/GroupList'
import type { AppState } from './types'

function AppInner() {
  const { state, dispatch } = useStore()
  const [search, setSearch] = useState('')
  const importRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    const json = JSON.stringify(state, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'list-organizer.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as AppState
        if (!Array.isArray(parsed?.groups)) throw new Error('Invalid format')
        dispatch({ type: 'IMPORT_STATE', state: parsed })
      } catch {
        alert('Invalid JSON file. Please export from this app and import the same format.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const totalItems = state.groups.reduce((sum, g) => sum + g.items.length, 0)
  const checkedItems = state.groups.reduce((sum, g) => sum + g.items.filter(i => i.checked).length, 0)

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          List Organizer
          <span style={{ fontSize: '0.7em', fontWeight: 400, color: 'var(--text-muted)', marginLeft: 8 }}>
            {checkedItems}/{totalItems}
          </span>
        </h1>
        <div className="header-actions">
          <button
            className="btn btn--secondary btn--sm"
            onClick={() => dispatch({ type: 'ADD_GROUP' })}
            title="Add new group"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Group
          </button>

          <button
            className="btn btn--secondary btn--sm"
            onClick={handleExport}
            title="Export as JSON"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export
          </button>

          <button
            className="btn btn--secondary btn--sm"
            onClick={() => importRef.current?.click()}
            title="Import JSON"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import
          </button>
          <input ref={importRef} type="file" accept=".json" onChange={handleImport} hidden />
        </div>
      </header>

      <div className="search-bar">
        <input
          className="search-input"
          type="search"
          placeholder="Search items…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <main className="app-main">
        <GroupList search={search} />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AppInner />
    </StoreProvider>
  )
}
