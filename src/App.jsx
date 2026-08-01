import { useEffect, useState } from 'react'
import './App.css'
import HeroOverlay from './components/HeroOverlay.jsx'
import HeroScene from './components/HeroScene.jsx'
import Loader from './components/Loader.jsx'
import PageSections from './components/PageSections.jsx'

function App() {
  // Read in the initializer, write in an effect. Writing here would be
  // double-invoked under StrictMode and the loader would never show in dev.
  const [showLoader, setShowLoader] = useState(
    () => !sessionStorage.getItem('hasLoaded'),
  )
  const [heroVisible, setHeroVisible] = useState(
    () => Boolean(sessionStorage.getItem('hasLoaded')),
  )

  useEffect(() => {
    sessionStorage.setItem('hasLoaded', 'true')
  }, [])

  return (
    <>
      {showLoader && (
        <Loader
          onReveal={() => setHeroVisible(true)}
          onComplete={() => setShowLoader(false)}
        />
      )}

      <main className="app-shell">
        <section className="hero-section" id="home">
          <HeroScene />
          <HeroOverlay visible={heroVisible} />
        </section>
        <PageSections />
      </main>
    </>
  )
}

export default App
