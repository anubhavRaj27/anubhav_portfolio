import './App.css'
import HeroOverlay from './components/HeroOverlay.jsx'
import HeroScene from './components/HeroScene.jsx'
import PageSections from './components/PageSections.jsx'

function App() {
  return (
    <main className="app-shell">
      <section className="hero-section" id="home">
        <HeroScene />
        <HeroOverlay />
      </section>
      <PageSections />
    </main>
  )
}

export default App
