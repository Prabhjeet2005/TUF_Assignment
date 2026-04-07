"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
	isSameDay,
	isAfter,
	isBefore,
	format,
	isWithinInterval,
} from "date-fns";
import { getCalendarDays } from "@/utils/dateHelpers";
import { useNotes } from "@/hooks/useNotes";
import { HOLIDAYS } from "@/utils/calendarConfig";

// Receive currentDate and theme as props now
export default function CalendarWidget({ currentDate, theme }) {
	const days = useMemo(() => getCalendarDays(currentDate), [currentDate]);

	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [hoverDate, setHoverDate] = useState(null);
	const [animateKey, setAnimateKey] = useState(0);

	// Trigger grid animation when month changes
	useEffect(() => {
		setAnimateKey((prev) => prev + 1);
	}, [currentDate]);

	const currentNotesKey = useMemo(() => {
		if (startDate && endDate) {
			return `notes-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}`;
		} else if (startDate) {
			return `notes-${format(startDate, "yyyy-MM-dd")}`;
		}
		return `notes-general-${format(currentDate, "yyyy-MM")}`;
	}, [startDate, endDate, currentDate]);

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
		const { date, isCurrentMonth } = dayObj;
		let classes =
			"h-10 w-10 flex flex-col items-center justify-center rounded-full text-sm cursor-pointer transition-all duration-200 relative ";

		if (!isCurrentMonth) return classes + "text-gray-300 hover:bg-gray-50";

		const isStart = startDate && isSameDay(date, startDate);
		const isEnd = endDate && isSameDay(date, endDate);

		let isBetween = false;
		if (startDate && endDate) {
			isBetween =
				isWithinInterval(date, { start: startDate, end: endDate }) &&
				!isStart &&
				!isEnd;
		} else if (startDate && hoverDate && isAfter(hoverDate, startDate)) {
			isBetween =
				isWithinInterval(date, { start: startDate, end: hoverDate }) &&
				!isStart;
		}

		if (isStart || isEnd) {
			// Use dynamic theme color
			classes += `${theme.color} text-white font-bold shadow-md transform scale-105`;
		} else if (isBetween) {
			classes += `${theme.lightBg} ${theme.text} rounded-none`;
		} else {
			classes += `text-gray-700 hover:${theme.lightBg} font-medium`;
		}

		return classes;
	};

	return (
		<div className="flex flex-col gap-6 h-full">
			<div className="grid grid-cols-7 gap-y-4 gap-x-1 text-center border-b pb-4">
				{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
					<div
						key={day}
						className={`text-xs font-bold ${theme.text} tracking-wider opacity-70`}>
						{day}
					</div>
				))}

				{/* Add a key to force re-animation on month change */}
				{days.map((dayObj, i) => {
					const dateKey = format(dayObj.date, "MM-dd");
					const holiday = HOLIDAYS[dateKey];

					return (
						<div
							key={`${animateKey}-${i}`}
							className="flex justify-center relative py-1 animate-fade-in"
							style={{ animationDelay: `${i * 10}ms` }}>
							{startDate && (
								<div
									className={`absolute inset-0 top-1 bottom-1 -z-10 transition-colors
                  ${isSameDay(dayObj.date, startDate) && (endDate || hoverDate) ? `rounded-l-full ${theme.lightBg} w-1/2 right-0` : ""}
                  ${endDate && isSameDay(dayObj.date, endDate) ? `rounded-r-full ${theme.lightBg} w-1/2 left-0` : ""}
                `}
								/>
							)}

							<button
								onClick={() => handleDateClick(dayObj.date)}
								onMouseEnter={() => setHoverDate(dayObj.date)}
								onMouseLeave={() => setHoverDate(null)}
								className={getDayClasses(dayObj)}
								disabled={!dayObj.isCurrentMonth}
								title={holiday || ""}>
								{format(dayObj.date, "d")}

								{/* Holiday Marker Indicator */}
								{holiday && dayObj.isCurrentMonth && (
									<span
										className={`absolute bottom-1 w-1 h-1 rounded-full ${isSameDay(dayObj.date, startDate) || isSameDay(dayObj.date, endDate) ? "bg-white" : theme.color}`}
									/>
								)}
							</button>
						</div>
					);
				})}
			</div>

			<div className="mt-auto pt-4 border-t border-gray-100">
				<div className="flex justify-between items-center mb-2">
					<h3
						className={`text-sm font-bold uppercase tracking-wide ${theme.text}`}>
						{currentNotesKey.includes("general")
							? `${theme.month} Notes`
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
							? `Plans for ${format(startDate, "MMM d")} to ${format(endDate, "MMM d")}...`
							: startDate
								? `Plans for ${format(startDate, "MMM d")}...`
								: `Jot down general memos for ${theme.month} here...`
					}
				/>
			</div>
		</div>
	);
}
