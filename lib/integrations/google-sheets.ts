import { Submission } from '../quiz-engine/types'

export async function appendToGoogleSheet(
  sheetId: string,
  submission: Submission
): Promise<boolean> {
  if (!sheetId) return false

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

    const response = await fetch('/api/sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sheetId,
        values: [row],
      }),
    })

    return response.ok
  } catch (error) {
    console.error('Failed to append to Google Sheet:', error)
    return false
  }
}
