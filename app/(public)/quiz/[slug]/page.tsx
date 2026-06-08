import { notFound } from 'next/navigation'
import { getFunnelBySlug } from '@/lib/supabase/queries'
import { QuizRenderer } from '@/components/quiz/QuizRenderer'

export const revalidate = 3600 // ISR: revalidate every hour

interface QuizPageProps {
  params: {
    slug: string
  }
}

export default async function QuizPage({ params }: QuizPageProps) {
  const funnel = await getFunnelBySlug(params.slug)

  if (!funnel) {
    notFound()
  }

  return (
    <div className="w-full">
      <QuizRenderer funnel={funnel} />
    </div>
  )
}
