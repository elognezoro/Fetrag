import { NextResponse } from 'next/server'
import { guards } from '@/lib/auth'
import { getCalendarEvents } from '@/server/learner/queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function icsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

function icsText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

/** Replie les lignes à 75 octets (RFC 5545). */
function fold(line: string): string {
  const out: string[] = []
  let current = line
  while (current.length > 73) {
    out.push(current.slice(0, 73))
    current = ` ${current.slice(73)}`
  }
  out.push(current)
  return out.join('\r\n')
}

/** Export iCalendar des sessions (6 mois glissants) et des échéances de devoirs de l'apprenant. */
export async function GET(): Promise<Response> {
  let principal
  try {
    principal = await guards.api.requireUser()
  } catch {
    return NextResponse.json({ ok: false, error: 'unauthenticated' }, { status: 401 })
  }
  const from = new Date(Date.now() - 30 * 24 * 3600 * 1000)
  const to = new Date(Date.now() + 182 * 24 * 3600 * 1000)
  const events = await getCalendarEvents(principal, { from, to })
  const stamp = icsDate(new Date())

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FETRAG//Formation//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:FETRAG Formation',
    'X-WR-TIMEZONE:Africa/Libreville',
  ]
  for (const event of events) {
    const end = event.endsAt ?? new Date(event.startsAt.getTime() + 60 * 60 * 1000)
    const summary = event.kind === 'assignment' ? `Échéance : ${event.title}` : event.title
    const description = [event.courseTitle, event.mode ? `Modalité : ${event.mode}` : null, event.meetingUrl ? `Lien : ${event.meetingUrl}` : null].filter(Boolean).join('\n')
    lines.push(
      'BEGIN:VEVENT',
      fold(`UID:${event.kind}-${event.id}@formation.fetrag.ga`),
      `DTSTAMP:${stamp}`,
      `DTSTART:${icsDate(event.startsAt)}`,
      `DTEND:${icsDate(end)}`,
      fold(`SUMMARY:${icsText(summary)}`),
      fold(`DESCRIPTION:${icsText(description)}`),
      ...(event.location ? [fold(`LOCATION:${icsText(event.location)}`)] : []),
      ...(event.meetingUrl ? [fold(`URL:${event.meetingUrl}`)] : []),
      'END:VEVENT',
    )
  }
  lines.push('END:VCALENDAR')

  return new Response(lines.join('\r\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="fetrag-formation.ics"',
      'Cache-Control': 'private, no-store',
    },
  })
}
