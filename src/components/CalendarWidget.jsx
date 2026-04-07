'use client';

import React, { useState, useMemo } from 'react';
import { isSameDay, isAfter, isBefore, format, isWithinInterval } from 'date-fns';
import { getCalendarDays } from '@/utils/dateHelpers';
import { useNotes } from '@/hooks/useNotes';

export default function CalendarWidget() {
  const baseDate = new Date(2026, 0, 1); 
  const days = useMemo(() => getCalendarDays(baseDate), [baseDate]);

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [hoverDate, setHoverDate] = useState(null);

  const currentNotesKey = useMemo(() => {
		if (startDate && endDate) {
			return `notes-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}`;
		} else if (startDate) {
			return `notes-${format(startDate, "yyyy-MM-dd")}`;
		}
		return "notes-general";
	}, [startDate, endDate]);

	const { notes, saveNote, isLoaded } = useNotes(currentNotesKey);

  const handleDateClick = (clickedDate) => {
    if (!startDate) {
      setStartDate(clickedDate);
      setEndDate(null);
    } else if (startDate && !endDate) {
      if (isBefore(clickedDate, startDate)) {
        setStartDate(clickedDate);
      } else {
        setEndDate(clickedDate);
      }
    } else {
      setStartDate(clickedDate);
      setEndDate(null);
    }
  };

  const getDayClasses = (dayObj) => {
    const { date, isCurrentMonth, base} = dayObj;
    let classes = "h-10 w-10 flex items-center justify-center rounded-full text-sm cursor-pointer transition-colors ";

    // Fade out days from previous/next months
    if (!isCurrentMonth) {
      return classes + "text-gray-300 hover:bg-gray-50";
    }

    const isStart = startDate && isSameDay(date, startDate);
    const isEnd = endDate && isSameDay(date, endDate);
    
    let isBetween = false;
    if (startDate && endDate) {
      isBetween = isWithinInterval(date, { start: startDate, end: endDate }) && !isStart && !isEnd;
    } else if (startDate && hoverDate && isAfter(hoverDate, startDate)) {
      isBetween = isWithinInterval(date, { start: startDate, end: hoverDate }) && !isStart;
    }

    if (isStart || isEnd) {
      classes += "bg-blue-600 text-white font-bold shadow-md";
    } else if (isBetween) {
      classes += "bg-blue-100 text-blue-800 rounded-none";
    } else {
      classes += "text-gray-700 hover:bg-blue-50 font-medium";
    }

    return classes;
  };

  return (
		<div className="flex flex-col gap-6 h-full">
			<div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center border-b pb-4">
				{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
					<div
						key={day}
						className="text-xs font-bold text-gray-400 tracking-wider">
						{day}
					</div>
				))}

				{days.map((dayObj, i) => (
					<div key={i} className="flex justify-center relative py-1">
						{startDate && (
							<div
								className={`absolute inset-0 top-1 bottom-1 -z-10
                ${isSameDay(dayObj.date, startDate) && (endDate || hoverDate) ? "rounded-l-full bg-blue-100 w-1/2 right-0" : ""}
                ${endDate && isSameDay(dayObj.date, endDate) ? "rounded-r-full bg-blue-100 w-1/2 left-0" : ""}
              `}
							/>
						)}

						<button
							onClick={() => handleDateClick(dayObj.date)}
							onMouseEnter={() => setHoverDate(dayObj.date)}
							onMouseLeave={() => setHoverDate(null)}
							className={getDayClasses(dayObj)}
							disabled={!dayObj.isCurrentMonth}>
							{format(dayObj.date, "d")}
						</button>
					</div>
				))}
			</div>

			<div className="mt-auto pt-4 border-t border-gray-100">
				<div className="flex justify-between items-center mb-2">
					<h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
						{currentNotesKey === "notes-general"
							? "General Notes"
							: "Date Specific Notes"}
					</h3>
					<span className="text-[10px] text-gray-400 font-medium">
						{isLoaded ? "Autosaved" : "Loading..."}
					</span>
				</div>

				<textarea
					value={notes}
					onChange={(e) => saveNote(e.target.value)}
					disabled={!isLoaded}
					className="w-full h-24 resize-none rounded-md border border-gray-200 bg-gray-50 p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none text-sm text-gray-700 transition-all placeholder:text-gray-400"
					placeholder={
						startDate && endDate
							? `Write down plans for ${format(startDate, "MMM d")} to ${format(endDate, "MMM d")}...`
							: startDate
								? `Write down plans for ${format(startDate, "MMM d")}...`
								: "Jot down general memos for the month here..."
					}
				/>
			</div>
		</div>
	);
}