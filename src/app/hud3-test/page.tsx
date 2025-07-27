'use client'

import LightwalkerDashboard from '@/components/HUD/lightwalkerHUDtest'

export default function HUD3TestPage() {
  return (
    <div>
      {/* Navigation Header */}
      <div className="bg-yellow-100 border-b border-yellow-200 p-2">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <a 
              href="/" 
              className="text-sm text-yellow-800 hover:text-yellow-900 underline"
            >
              ← Back to Main
            </a>
            <span className="text-sm text-yellow-800 font-medium">
              🧪 Testing: lightwalkerHUDtest (Latest Version)
            </span>
            <div className="flex space-x-4">
              <a 
                href="/hud-test" 
                className="text-sm text-yellow-800 hover:text-yellow-900 underline"
              >
                ← HUD1 Test
              </a>
              <a 
                href="/hud2-test" 
                className="text-sm text-yellow-800 hover:text-yellow-900 underline"
              >
                ← HUD2 Test
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* HUD Component */}
      <LightwalkerDashboard />
    </div>
  )
}