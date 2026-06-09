import { Submission } from '../quiz-engine/types'

export async function appendToGoogleSheet(
  sheetId: string,
  submission: Submission
): Promise<boolean> {
  console.log('[appendToGoogleSheet] Starting append', {
    sheetId,
    submissionId: submission.id,
    email: submission.email,
    hasSheetId: !!sheetId,
  })

  if (!sheetId) {
    console.warn('[appendToGoogleSheet] No sheetId provided, skipping')
    return false
  }

  try {
    const row = [
      new Date(submission.submittedAt).toLocaleString(),
      submission.name || '',
      submission.email || '',
      submission.phone || '',
      submission.address ? JSON.stringify(submission.address) : '',
      JSON.stringify(submission.answers),
      submission.leadScore,
    ]

    console.log('[appendToGoogleSheet] Prepared row data:', {
      rowLength: row.length,
      timestamp: row[0],
      name: row[1],
      email: row[2],
      phone: row[3],
    })

    const requestPayload = {
      sheetId,
      values: [row],
    }

    console.log('[appendToGoogleSheet] Sending to /api/sheets...')
    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload),
    })

    console.log('[appendToGoogleSheet] Response status:', {
      ok: response.ok,
      status: response.statusText,
    })

    if (!response.ok) {
      const responseText = await response.text()
      console.error('[appendToGoogleSheet] API error response:', responseText)
    }

    return response.ok
  } catch (error) {
    console.error('[appendToGoogleSheet] Fetch error:', error)
    return false
  }
}
