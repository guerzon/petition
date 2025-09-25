import Navbar from './components/layout/Navbar'
import Hero from './components/Hero'
import PetitionsList from './components/PetitionsList'
import CreatePetition from './components/CreatePetition'
import AllPetitions from './components/AllPetitions'
import FeaturedPetitions from './components/FeaturedPetitions'
import PetitionDetail from './components/PetitionDetail'
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
            <Route path="/create" element={<CreatePetition />} />
            <Route path="/petition/:slug" element={<PetitionDetail />} />
            <Route path="/proposals/:slug" element={<PetitionDetail />} />
            <Route path="/petitions" element={<AllPetitions />} />
            <Route path="/featured" element={<FeaturedPetitions />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  )
}

export default App
