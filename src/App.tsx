import { Header } from './components/Header'
import { Calculator } from './components/Calculator'
import { SidePanel } from './components/SidePanel'
import { Footer } from './components/Footer'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col justify-between p-2 md:p-6">
      <Header />

      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow">
        <section className="lg:col-span-5 flex flex-col items-center">
          <Calculator />
        </section>
        <SidePanel />
      </main>

      <Footer />
    </div>
  )
}