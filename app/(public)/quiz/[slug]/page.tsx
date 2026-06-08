import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFunnelBySlug } from '@/lib/supabase/queries'
import { QuizRenderer } from '@/components/quiz/QuizRenderer'

export const revalidate = 0 // ISR: revalidate every request

interface QuizPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function QuizPage({ params }: QuizPageProps) {
  const resolvedParams = await params
  console.log(`[QuizPage] Loading quiz with slug: ${resolvedParams.slug}`)
  
  const funnel = await getFunnelBySlug(resolvedParams.slug)

  if (!funnel) {
    console.error(`[QuizPage] Funnel not found for slug: ${resolvedParams.slug}`)
    notFound()
  }

  console.log(`[QuizPage] Funnel loaded successfully:`, { 
    id: funnel.id, 
    name: funnel.name,
    steps: funnel.steps?.length || 0,
    startStepId: funnel.startStepId 
  })

  return (
    <div className="w-full">
      <div className="p-4">
        <Link href="/" className="text-orange-500 hover:underline text-sm font-bold">
          ← Back to Home
        </Link>
      </div>
      <QuizRenderer funnel={funnel} />
    </div>
  )
}
