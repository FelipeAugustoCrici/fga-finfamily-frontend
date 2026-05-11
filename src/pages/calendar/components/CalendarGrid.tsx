import React from 'react';
import { CalendarDayCell } from './CalendarDayCell';
import type { CalendarDaySummary } from '../types/calendar.types';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

interface Props {
  month: number;
  year: number;
  days: CalendarDaySummary[];
  onDayClick: (date: string) => void;
}

export function CalendarGrid({ month, year, days, onDayClick }: Props) {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const dayMap = new Map(days.map((d) => [d.date, d]));

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(year, month - 1, 0).getDate();

  const cells: { day: number; month: number; year: number; current: boolean }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const m = month === 1 ? 12 : month - 1;
    const y = month === 1 ? year - 1 : year;
    cells.push({ day: d, month: m, year: y, current: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, month, year, current: true });
  }

  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    const m = month === 12 ? 1 : month + 1;
    const y = month === 12 ? year + 1 : year;
    cells.push({ day: d, month: m, year: y, current: false });
  }

  return (
    <div>
      {}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-xs font-bold text-primary-400 uppercase py-2">
            {w}
          </div>
        ))}
      </div>

      {}
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell, idx) => {
          const dateKey = `${cell.year}-${String(cell.month).padStart(2, '0')}-${String(cell.day).padStart(2, '0')}`;
          return (
            <CalendarDayCell
              key={idx}
              day={cell.day}
              month={cell.month}
              year={cell.year}
              summary={cell.current ? dayMap.get(dateKey) : undefined}
              isToday={dateKey === todayKey}
              isCurrentMonth={cell.current}
              onClick={() => cell.current && onDayClick(dateKey)}
            />
          );
        })}
      </div>
    </div>
  );
}
