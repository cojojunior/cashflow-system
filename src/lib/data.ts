import { format, formatDistanceToNow } from "date-fns";

// Ghana uses GMT (Africa/Accra = UTC+0, no DST). We store timestamps in UTC
// and display using the browser's local time; for accuracy, this app assumes
// the user's device is set to Africa/Accra.

export function formatDate(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy");
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), "dd MMM yyyy, HH:mm");
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}
