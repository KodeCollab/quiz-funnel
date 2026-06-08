import { NextRequest, NextResponse } from 'next/server'
import { createSubmission } from '@/lib/supabase/queries'
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

    // Create submission in Supabase
    const submissionId = await createSubmission(
      funnelId,
      sessionId,
      answers,
      leadScore,
      email,
      phone,
      name,
      address
    )

    if (!submissionId) {
      return NextResponse.json(
        { error: 'Failed to create submission' },
        { status: 500 }
      )
    }

    // Push to Google Sheets if configured
    if (googleSheetsId) {
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
