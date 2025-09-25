import Navbar from './components/layout/Navbar'
import Hero from './components/Hero'
import PetitionsList from './components/PetitionsList'
import Footer from './components/layout/Footer'

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <PetitionsList />
                </>
              }
            />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
