import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getFunnelBySlug } from '@/lib/supabase/queries'
import { QuizRenderer } from '@/components/quiz/QuizRenderer'

export const revalidate = 0 // ISR: revalidate every hour

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
      <div className="p-4">
        <Link href="/" className="text-orange-500 hover:underline text-sm font-bold">
          ← Back to Home
        </Link>
      </div>
      <QuizRenderer funnel={funnel} />
    </div>
  )
}
