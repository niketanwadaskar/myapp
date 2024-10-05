import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="text-center">
      <div className="mb-8 w-full flex mr-2 justify-center">
        <Image src="/logo.svg" alt="Logo" width={250} height={250} />
      </div>
      <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
      <p className="text-2xl text-gray-600 mb-8">Oops! Page not found</p>
      <p className="text-lg text-gray-500 mb-8">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <Link href="/" className="px-6 py-3 bg-[#ff748d] text-white rounded-lg text-lg hover:bg-[#ff5c7a] transition-colors duration-300">
        Go to Homepage
      </Link>
    </div>
  </div>
  )
}
