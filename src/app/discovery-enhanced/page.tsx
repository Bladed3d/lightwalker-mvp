'use client'

import { useState } from 'react'
import GamifiedDiscoveryEnhanced from '@/components/lightwalker/GamifiedDiscoveryEnhanced'

export default function DiscoveryEnhancedPage() {
  const [lightwalker, setLightwalker] = useState<any>(null)

  const handleLightwalkerCreated = (createdLightwalker: any) => {
    setLightwalker(createdLightwalker)
    console.log('Lightwalker™ created:', createdLightwalker)
    // In a real app, this would redirect to the next step or save to database
    alert(`Lightwalker™ created with ${createdLightwalker.attributes.length} attributes!`)
  }

  return (
    <div className="min-h-screen">
      <GamifiedDiscoveryEnhanced onLightwalkerCreated={handleLightwalkerCreated} />
    </div>
  )
}