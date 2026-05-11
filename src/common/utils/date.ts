import moment from 'moment';

import 'moment/dist/locale/pt-br';

moment.locale('pt-br');

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatLongDate(date: Date | string | number): string {
  const m = moment(date).locale('pt-br');
  return capitalize(m.format('dddd, DD [de] MMMM [de] YYYY'));
}

export function formatMediumDate(date: Date | string | number): string {
  const m = moment(date).locale('pt-br');
  return capitalize(m.format('DD [de] MMMM [de] YYYY'));
}

export function formatShortDate(date: Date | string | number): string {
  return moment(date).locale('pt-br').format('DD/MM/YYYY');
}

export function formatDayMonth(date: Date | string | number): string {
  return moment(date).locale('pt-br').format('DD/MM');
}

export function formatMonthYear(date: Date | string | number): string {
  const m = moment(date).locale('pt-br');
  return capitalize(m.format('MMMM [de] YYYY'));
}

export function formatShortMonthYear(date: Date | string | number): string {
  const m = moment(date).locale('pt-br');
  return capitalize(m.format('MMM/YYYY'));
}

export function formatDateTime(date: Date | string | number): string {
  return moment(date).locale('pt-br').format('DD/MM/YYYY [às] HH:mm');
}

export function formatTime(date: Date | string | number): string {
  return moment(date).locale('pt-br').format('HH:mm');
}

export function formatRelativeDate(date: Date | string | number): string {
  const m = moment(date).locale('pt-br');
  const now = moment().locale('pt-br');
  const diffInDays = now.diff(m, 'days');

  if (diffInDays === 0) return 'hoje';
  if (diffInDays === 1) return 'ontem';
  if (diffInDays === -1) return 'amanhã';
  if (diffInDays > 1 && diffInDays < 7) return `há ${diffInDays} dias`;
  if (diffInDays < -1 && diffInDays > -7) return `em ${Math.abs(diffInDays)} dias`;

  return formatShortDate(date);
}

export function formatFromNow(date: Date | string | number): string {
  return moment(date).locale('pt-br').fromNow();
}

export function formatWeekday(date: Date | string | number): string {
  const m = moment(date).locale('pt-br');
  return capitalize(m.format('dddd'));
}

export function formatShortWeekday(date: Date | string | number): string {
  const m = moment(date).locale('pt-br');
  return capitalize(m.format('ddd'));
}

export function formatMonth(date: Date | string | number): string {
  const m = moment(date).locale('pt-br');
  return capitalize(m.format('MMMM'));
}

export function formatShortMonth(date: Date | string | number): string {
  const m = moment(date).locale('pt-br');
  return capitalize(m.format('MMM'));
}

export function formatInputDate(date: Date | string | number): string {
  return moment(date).format('YYYY-MM-DD');
}

export function formatISO(date: Date | string | number): string {
  return moment(date).toISOString();
}

export function isToday(date: Date | string | number): boolean {
  return moment(date).isSame(moment(), 'day');
}

export function isYesterday(date: Date | string | number): boolean {
  return moment(date).isSame(moment().subtract(1, 'day'), 'day');
}

export function isTomorrow(date: Date | string | number): boolean {
  return moment(date).isSame(moment().add(1, 'day'), 'day');
}

export function diffInDays(
  date1: Date | string | number,
  date2: Date | string | number = new Date(),
): number {
  return moment(date1).diff(moment(date2), 'days');
}

export function addDays(date: Date | string | number, days: number): Date {
  return moment(date).add(days, 'days').toDate();
}

export function subtractDays(date: Date | string | number, days: number): Date {
  return moment(date).subtract(days, 'days').toDate();
}

export function startOfDay(date: Date | string | number): Date {
  return moment(date).startOf('day').toDate();
}

export function endOfDay(date: Date | string | number): Date {
  return moment(date).endOf('day').toDate();
}
