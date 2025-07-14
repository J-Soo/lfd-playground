import { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface MainLayoutProps {
  children: ReactNode
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-gray-900">
              LFD Playground
            </Link>
            <nav className="flex space-x-4">
              <Link to="/" className="text-gray-700 hover:text-gray-900">
                Home
              </Link>
              <Link to="/lobby" className="text-gray-700 hover:text-gray-900">
                Lobby
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}