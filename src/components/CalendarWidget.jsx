"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
	isSameDay,
	isAfter,
	isBefore,
	format,
	isWithinInterval,
	addMonths,
	subMonths,
	isSameMonth,
} from "date-fns";
import { getCalendarDays } from "@/utils/dateHelpers";
import { useNotes } from "@/hooks/useNotes";
import { HOLIDAYS } from "@/utils/calendarConfig";
import {
	ChevronLeft,
	ChevronRight,
	AlignLeft,
	List,
	Calendar as CalendarIcon,
	Star,
} from "lucide-react";

const parseLocalDate = (dateStr) => {
	const [y, m, d] = dateStr.split("-");
	return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
};

export default function CalendarWidget({
	currentDate,
	setCurrentDate,
	theme,
}) {
	const days = useMemo(() => getCalendarDays(currentDate), [currentDate]);

	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [hoverDate, setHoverDate] = useState(null);
	const [allMonthNotes, setAllMonthNotes] = useState([]);
	const [flipKey, setFlipKey] = useState(0); // Used to trigger flip animation

	const refreshMonthNotes = useCallback(() => {
		const notesList = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith("notes-")) {
				const value = localStorage.getItem(key);
				if (!value || !value.trim()) continue;

				if (key.startsWith("notes-general-")) {
					if (
						key.replace("notes-general-", "") ===
						format(currentDate, "yyyy-MM")
					) {
						notesList.push({ type: "general", key, text: value });
					}
				} else if (key.includes("-to-")) {
					const [startStr, endStr] = key
						.replace("notes-", "")
						.split("-to-");
					const sDate = parseLocalDate(startStr);
					const eDate = parseLocalDate(endStr);
					if (
						isSameMonth(sDate, currentDate) ||
						isSameMonth(eDate, currentDate)
					) {
						notesList.push({
							type: "range",
							key,
							start: sDate,
							end: eDate,
							text: value,
						});
					}
				} else {
					const dDate = parseLocalDate(key.replace("notes-", ""));
					if (isSameMonth(dDate, currentDate)) {
						notesList.push({
							type: "single",
							key,
							date: dDate,
							text: value,
						});
					}
				}
			}
		}

		// ADVANCED SORTING LOGIC: General -> Ascending Upcoming -> Passed dates at bottom
		notesList.sort((a, b) => {
			if (a.type === "general" && b.type !== "general") return -1;
			if (b.type === "general" && a.type !== "general") return 1;
			if (a.type === "general" && b.type === "general") return 0;

			const dateA = a.type === "range" ? a.start : a.date;
			const dateB = b.type === "range" ? b.start : b.date;

			const today = new Date();
			today.setHours(0, 0, 0, 0);

			const isAPassed = isBefore(dateA, today);
			const isBPassed = isBefore(dateB, today);

			if (isAPassed && !isBPassed) return 1; // A passed, push down
			if (!isAPassed && isBPassed) return -1; // B passed, push down

			return dateA.getTime() - dateB.getTime(); // Otherwise Ascending
		});

		setAllMonthNotes(notesList);
	}, [currentDate]);

	useEffect(() => {
		refreshMonthNotes();
		window.addEventListener("notes-updated", refreshMonthNotes);
		return () =>
			window.removeEventListener("notes-updated", refreshMonthNotes);
	}, [refreshMonthNotes]);

	// Handle Month Navigation with Flip Animation Trigger
	const handleNav = (dir) => {
		setCurrentDate(
			dir === "next"
				? addMonths(currentDate, 1)
				: subMonths(currentDate, 1),
		);
		setStartDate(null);
		setEndDate(null);
		setFlipKey((prev) => prev + 1);
	};

	const handleGoToToday = () => {
		setCurrentDate(new Date());
		setStartDate(null);
		setEndDate(null);
		setFlipKey((prev) => prev + 1);
	};

	const currentNotesKey = useMemo(() => {
		if (startDate && endDate)
			return `notes-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}`;
		if (startDate) return `notes-${format(startDate, "yyyy-MM-dd")}`;
		return `notes-general-${format(currentDate, "yyyy-MM")}`;
	}, [startDate, endDate, currentDate]);

	const { notes, saveNote, isLoaded } = useNotes(currentNotesKey);

	const handleDateClick = (clickedDate) => {
		// Parent range jump logic
		if (!startDate && !endDate) {
			const parentRangeNote = allMonthNotes.find(
				(n) =>
					n.type === "range" &&
					isWithinInterval(clickedDate, { start: n.start, end: n.end }),
			);
			if (parentRangeNote) {
				setStartDate(parentRangeNote.start);
				setEndDate(parentRangeNote.end);
				return;
			}
		}

		if (!startDate) {
			setStartDate(clickedDate);
			setEndDate(null);
		} else if (startDate && !endDate) {
			// BUG FIX: If user clicks the exact same start date again, deselect it.
			if (isSameDay(clickedDate, startDate)) {
				setStartDate(null);
				setEndDate(null);
			} else if (isBefore(clickedDate, startDate)) {
				setStartDate(clickedDate);
			} else {
				setEndDate(clickedDate);
			}
		} else {
			// If a range is already selected and they click again, start a new selection
			setStartDate(clickedDate);
			setEndDate(null);
		}
	};

	const jumpToNote = (note) => {
		if (note.type === "general") {
			setStartDate(null);
			setEndDate(null);
		} else if (note.type === "single") {
			setStartDate(note.date);
			setEndDate(null);
		} else if (note.type === "range") {
			setStartDate(note.start);
			setEndDate(note.end);
		}
	};

	return (
		<div className="flex flex-col h-full justify-between animate-slide-up">
			<div>
				<div className="flex justify-between items-center mb-6">
					<div className="flex items-center gap-4">
						<h2
							className={`text-xl font-medium ${theme.text} transition-colors duration-500`}>
							{format(currentDate, "MMMM yyyy")}
						</h2>
						{!isSameMonth(currentDate, new Date()) && (
							<button
								onClick={handleGoToToday}
								className={`text-xs font-bold px-3 py-1.5 rounded-full ${theme.light} ${theme.text} hover:opacity-80 transition-all transform hover:scale-105 active:scale-95`}>
								Today
							</button>
						)}
					</div>

					<div className="flex gap-1">
						<button
							onClick={() => handleNav("prev")}
							className={`p-2 hover:${theme.light} rounded-full transition-all hover:scale-110 active:scale-90 text-[#5f6368]`}>
							<ChevronLeft size={20} />
						</button>
						<button
							onClick={() => handleNav("next")}
							className={`p-2 hover:${theme.light} rounded-full transition-all hover:scale-110 active:scale-90 text-[#5f6368]`}>
							<ChevronRight size={20} />
						</button>
					</div>
				</div>

				{/* The Grid - Triggers Flip Animation on Key Change */}
				<div
					key={flipKey}
					className="grid grid-cols-7 gap-y-2 text-center mb-4 animate-flip-in">
					{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
						(day, index) => (
							<div
								key={index}
								className={`text-[10px] font-bold tracking-wider mb-2 ${index > 4 ? "text-red-400" : "text-[#70757a]"}`}>
								{day}
							</div>
						),
					)}

					{days.map((dayObj, i) => {
						const isStart = startDate && isSameDay(dayObj.date, startDate);
						const isEnd = endDate && isSameDay(dayObj.date, endDate);
						const isToday = isSameDay(dayObj.date, new Date());
						const isWeekend =
							dayObj.date.getDay() === 0 || dayObj.date.getDay() === 6;
						const holidayName = HOLIDAYS[format(dayObj.date, "MM-dd")];

						const hasSavedNote =
							dayObj.isCurrentMonth &&
							allMonthNotes.some((n) => {
								if (n.type === "single")
									return isSameDay(n.date, dayObj.date);
								if (n.type === "range")
									return isWithinInterval(dayObj.date, {
										start: n.start,
										end: n.end,
									});
								return false;
							});

						let isBetween = false;
						if (startDate && endDate)
							isBetween =
								isWithinInterval(dayObj.date, {
									start: startDate,
									end: endDate,
								}) &&
								!isStart &&
								!isEnd;
						else if (
							startDate &&
							hoverDate &&
							isAfter(hoverDate, startDate)
						)
							isBetween =
								isWithinInterval(dayObj.date, {
									start: startDate,
									end: hoverDate,
								}) && !isStart;

						const showHighlight =
							startDate &&
							(endDate || hoverDate) &&
							isWithinInterval(dayObj.date, {
								start: startDate,
								end: endDate || hoverDate,
							});

						return (
							<div
								key={i}
								className="flex justify-center relative py-1"
								title={holidayName || ""}>
								<div
									className={`absolute inset-0 top-1 bottom-1 z-0 transition-colors duration-300 ${theme.selection}`}
									style={{
										display:
											showHighlight && dayObj.isCurrentMonth
												? "block"
												: "none",
										left: isStart ? "50%" : "0",
										right:
											isEnd ||
											(isSameDay(dayObj.date, hoverDate) &&
												!endDate &&
												isAfter(hoverDate, startDate))
												? "50%"
												: "0",
										borderTopLeftRadius: isStart ? "9999px" : "0",
										borderBottomLeftRadius: isStart ? "9999px" : "0",
										borderTopRightRadius:
											isEnd || isSameDay(dayObj.date, hoverDate)
												? "9999px"
												: "0",
										borderBottomRightRadius:
											isEnd || isSameDay(dayObj.date, hoverDate)
												? "9999px"
												: "0",
									}}
								/>

								<button
									onClick={() => handleDateClick(dayObj.date)}
									onMouseEnter={() => setHoverDate(dayObj.date)}
									onMouseLeave={() => setHoverDate(null)}
									disabled={!dayObj.isCurrentMonth}
									className={`h-9 w-9 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all duration-200 relative z-10 font-medium transform hover:scale-110 active:scale-95
                    ${!dayObj.isCurrentMonth ? "text-gray-300 pointer-events-none" : ""}
                    ${(isStart || isEnd) && dayObj.isCurrentMonth ? `${theme.primary} text-white shadow-md font-bold scale-110` : ""}
                    ${isBetween && dayObj.isCurrentMonth ? `${theme.text} bg-transparent` : ""}
                    ${isToday && !isStart && !isEnd && dayObj.isCurrentMonth ? `border-2 border-dashed ${theme.text}` : ""}
                    ${!isStart && !isEnd && !isBetween && dayObj.isCurrentMonth ? (isWeekend || holidayName ? "text-red-500 hover:bg-red-50" : "text-[#3c4043] hover:bg-[#f1f3f4]") : ""}
                  `}>
									{format(dayObj.date, "d")}

									{/* Holiday / Note Indicators */}
									{holidayName &&
										dayObj.isCurrentMonth &&
										!isStart &&
										!isEnd && (
											<Star
												size={8}
												fill="currentColor"
												className="absolute top-0 right-0 text-yellow-400"
											/>
										)}
									{hasSavedNote && (
										<span
											className={`absolute -bottom-1 w-1.5 h-1.5 rounded-full shadow-sm transition-colors duration-300 ${isStart || isEnd ? "bg-white" : theme.primary}`}
										/>
									)}
								</button>
							</div>
						);
					})}
				</div>
			</div>

			<div
				className="mt-4 flex flex-col gap-4 animate-slide-up"
				style={{ animationDelay: "0.1s" }}>
				{allMonthNotes.length > 0 && (
					<div className="pt-4 border-t border-gray-100 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
						<div className={`flex items-center gap-2 mb-3 ${theme.text}`}>
							<List size={14} />
							<span className="text-[10px] font-bold uppercase tracking-wider">
								Month Overview
							</span>
						</div>
						<div className="flex flex-col gap-2">
							{allMonthNotes.map((n) => {
								const isPassed =
									n.type !== "general" &&
									isBefore(
										n.type === "range" ? n.start : n.date,
										new Date(new Date().setHours(0, 0, 0, 0)),
									);
								return (
									<div
										key={n.key}
										onClick={() => jumpToNote(n)}
										className={`flex items-center gap-3 text-xs p-2 rounded-md cursor-pointer transition-all duration-200 transform hover:translate-x-1 border-l-4 hover:shadow-sm
                      ${isPassed ? "opacity-50 grayscale hover:grayscale-0" : ""}
                    `}
										style={{
											borderLeftColor: theme.hex,
											backgroundColor: isPassed ? "#f8f9fa" : "white",
											boxShadow: !isPassed
												? "0 1px 2px rgba(0,0,0,0.05)"
												: "none",
										}}>
										<span
											className={`font-bold whitespace-nowrap w-24 ${theme.text}`}>
											{n.type === "general"
												? "General"
												: n.type === "single"
													? format(n.date, "MMM d")
													: `${format(n.start, "MMM d")} - ${format(n.end, "d")}`}
										</span>
										<span className="truncate text-[#5f6368] font-medium">
											{n.text}
										</span>
									</div>
								);
							})}
						</div>
					</div>
				)}

				<div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
					<div className="flex justify-between items-center text-[#3c4043]">
						<div
							className={`flex items-center gap-2 ${theme.text} transition-colors duration-500`}>
							<CalendarIcon size={16} />
							<h3 className="text-sm font-bold">
								{startDate && endDate
									? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")} Notes`
									: startDate
										? `${format(startDate, "MMMM d")} Notes`
										: `General ${format(currentDate, "MMMM")} Notes`}
							</h3>
						</div>
					</div>
					<textarea
						value={notes}
						onChange={(e) => saveNote(e.target.value)}
						disabled={!isLoaded}
						className={`w-full h-24 resize-none bg-[#f8f9fa] rounded-xl border-2 border-transparent p-4 text-sm text-[#3c4043] focus:bg-white focus:outline-none transition-all duration-300 placeholder:text-[#9aa0a6]`}
						style={{ focusBorderColor: theme.hex }}
						onFocus={(e) => (e.target.style.borderColor = theme.hex)}
						onBlur={(e) => (e.target.style.borderColor = "transparent")}
						placeholder="Type your beautifully styled notes here..."
					/>
				</div>
			</div>
		</div>
	);
}
