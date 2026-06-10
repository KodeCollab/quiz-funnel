import { NextRequest, NextResponse } from 'next/server'
import { createSubmission, updateSubmission, getSubmissionBySessionId } from '@/lib/supabase/queries'
import { appendToGoogleSheet } from '@/lib/integrations/google-sheets'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      funnelId,
      sessionId,
      answers,
      email,
      phone,
      name,
      address,
      leadScore,
      googleSheetsId,
    } = body

    // Check if submission already exists for this session
    const existingSubmission = await getSubmissionBySessionId(funnelId, sessionId)

    let submissionId: string | null = null

    if (existingSubmission) {
      // Update existing submission instead of creating a new one
      const updated = await updateSubmission(
        existingSubmission.id,
        answers,
        leadScore,
        email,
        phone,
        name,
        address
      )

      if (updated) {
        submissionId = existingSubmission.id
      }
    } else {
      // Create new submission if it doesn't exist
      submissionId = await createSubmission(
        funnelId,
        sessionId,
        answers,
        leadScore,
        email,
        phone,
        name,
        address
      )
    }

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      )
    }

    // Push to Google Sheets if configured (only on first submission or completion)
    if (googleSheetsId && !existingSubmission) {
      const success = await appendToGoogleSheet(googleSheetsId, {
        id: submissionId,
        funnelId,
        sessionId,
        answers,
        leadScore,
        email,
        phone,
        name,
        address,
        completed: true,
        submittedAt: new Date().toISOString(),
      })

      if (!success) {
        console.warn('Failed to push to Google Sheets')
      }
    }

    return NextResponse.json({
      success: true,
      submissionId,
    })
  } catch (error) {
    console.error('Submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
