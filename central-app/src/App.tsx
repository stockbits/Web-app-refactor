import './App.css'
import openreachLogo from '@central-logos/Openreach-Logo.jpeg'

function App() {
  return (
    <main className="app-shell">
      <img src={openreachLogo} alt="Openreach logo" className="brand-logo" />
      <h1>Central Library Sandbox</h1>
      <p className="app-copy">
        This workspace runs on Vite + React with Material UI. Replace this section with real modules as
        the design system matures.
      </p>
    </main>
  )
}

export default App
