import { RegistrationRecord } from '../types';

function escapeCsvCell(value: string | number | null | undefined): string {
  const str = value === null || value === undefined ? '' : String(value);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function buildRegistrationsCsv(records: RegistrationRecord[]): string {
  const headers = [
    'Registration ID',
    'Event ID',
    'Event Name',
    'Event Date',
    'Event Venue',
    'Full Name',
    'Email Address',
    'Phone Number',
    'University / College',
    'Branch / Course',
    'Year of Study',
    'Fee Type',
    'Fee Amount (INR)',
    'Registration Timestamp (ISO)',
    'Registration Status',
    'Payment Status',
  ];

  const rows = records.map((r) => [
    r.registrationId,
    r.eventId,
    r.eventName,
    r.eventDate,
    r.eventVenue,
    r.fullName,
    r.normalizedEmail,
    r.phoneNumber,
    r.university,
    r.branch,
    r.yearOfStudy,
    r.feeType,
    r.feeAmount,
    r.registrationTimestamp,
    r.registrationStatus,
    r.paymentStatus,
  ]);

  const csvLines = [
    headers.map(escapeCsvCell).join(','),
    ...rows.map((row) => row.map(escapeCsvCell).join(',')),
  ];

  // Include UTF-8 BOM for clean Excel compatibility alongside Google Sheets
  return `\uFEFF${csvLines.join('\r\n')}`;
}

export function downloadRegistrationsCsv(records: RegistrationRecord[], filename?: string): void {
  const csvContent = buildRegistrationsCsv(records);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const dateSlug = new Date().toISOString().slice(0, 10);
  const targetName = filename ?? `gdg-upes-registrations-${dateSlug}.csv`;

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', targetName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
