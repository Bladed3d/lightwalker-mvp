// Test page for Daily-Do Enhancement System
// URL: /test-enhancements
// Purpose: Verify the enhancement system works before production deployment

import EnhancementTestPage from '@/components/lightwalker/EnhancementTestPage'

export default function TestEnhancementsPage() {
  return <EnhancementTestPage />
}

export const metadata = {
  title: 'Daily-Do Enhancement Test | Lightwalker™',
  description: 'Testing the Claude-powered activity enhancement system'
}