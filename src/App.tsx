import Navbar from './components/layout/Navbar'
import Hero from './components/Hero'
import PetitionsList from './components/PetitionsList'
import Footer from './components/layout/Footer'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <Navbar /> */}
      <main>
        <Hero />
        <PetitionsList />
      </main>
      <Footer />
    </div>
  )
}

export default App
