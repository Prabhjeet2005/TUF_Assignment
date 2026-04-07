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
import { ChevronLeft, ChevronRight, AlignLeft, List } from "lucide-react";

// Helper to reliably parse strings like "2026-01-15" into local dates without timezone shifts
const parseLocalDate = (dateStr) => {
	const [y, m, d] = dateStr.split("-");
	return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
};

export default function CalendarWidget({ currentDate, setCurrentDate }) {
	const days = useMemo(() => getCalendarDays(currentDate), [currentDate]);

	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [hoverDate, setHoverDate] = useState(null);
	const [allMonthNotes, setAllMonthNotes] = useState([]);

	// --- NEW: Gather all notes for the current month ---
	const refreshMonthNotes = useCallback(() => {
		const notesList = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith("notes-")) {
				const value = localStorage.getItem(key);
				if (!value || !value.trim()) continue; // Skip empty notes

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
		// Sort so general is first, then chronologically
		notesList.sort((a, b) => (a.type === "general" ? -1 : 1));
		setAllMonthNotes(notesList);
	}, [currentDate]);

	// Listen for note changes and refresh
	useEffect(() => {
		refreshMonthNotes();
		window.addEventListener("notes-updated", refreshMonthNotes);
		return () =>
			window.removeEventListener("notes-updated", refreshMonthNotes);
	}, [refreshMonthNotes]);

	// Month Navigation
	const handlePrevMonth = () => {
		setCurrentDate(subMonths(currentDate, 1));
		setStartDate(null);
		setEndDate(null);
	};

	const handleNextMonth = () => {
		setCurrentDate(addMonths(currentDate, 1));
		setStartDate(null);
		setEndDate(null);
	};

	const currentNotesKey = useMemo(() => {
		if (startDate && endDate)
			return `notes-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}`;
		if (startDate) return `notes-${format(startDate, "yyyy-MM-dd")}`;
		return `notes-general-${format(currentDate, "yyyy-MM")}`;
	}, [startDate, endDate, currentDate]);

	const { notes, saveNote, isLoaded } = useNotes(currentNotesKey);

	const handleDateClick = (clickedDate) => {
		// --- NEW: If clicking inside an existing saved range, jump to it ---
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

		// Standard selection logic
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

	const getDayClasses = (dayObj) => {
		const { date, isCurrentMonth } = dayObj;
		let classes =
			"h-9 w-9 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all duration-150 relative z-10 ";
		if (!isCurrentMonth)
			return classes + "text-gray-300 pointer-events-none";

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
			classes += "bg-[#1a73e8] text-white font-medium shadow-sm";
		} else if (isBetween) {
			classes += "bg-transparent text-[#1a73e8]";
		} else {
			classes += "text-[#3c4043] hover:bg-[#f1f3f4]";
		}
		return classes;
	};

	return (
		<div className="flex flex-col h-full justify-between">
			<div>
				<div className="flex justify-between items-center mb-6">
					<h2 className="text-[1.375rem] font-normal text-[#3c4043]">
						{format(currentDate, "MMMM yyyy")}
					</h2>
					<div className="flex gap-1">
						<button
							onClick={handlePrevMonth}
							className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors text-[#5f6368]">
							<ChevronLeft size={20} />
						</button>
						<button
							onClick={handleNextMonth}
							className="p-2 hover:bg-[#f1f3f4] rounded-full transition-colors text-[#5f6368]">
							<ChevronRight size={20} />
						</button>
					</div>
				</div>

				<div className="grid grid-cols-7 gap-y-2 text-center mb-4">
					{["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
						<div
							key={index}
							className="text-[11px] font-medium text-[#70757a] uppercase mb-2">
							{day}
						</div>
					))}

					{days.map((dayObj, i) => {
						const isStart = startDate && isSameDay(dayObj.date, startDate);
						const isEnd = endDate && isSameDay(dayObj.date, endDate);

						// --- NEW: Check if this day has a saved note to show the dot ---
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

						// Is it actively highlighted?
						const isHighlightedBetween =
							startDate &&
							(endDate || hoverDate) &&
							isWithinInterval(dayObj.date, {
								start: startDate,
								end: endDate || hoverDate,
							}) &&
							!isStart &&
							!isSameDay(dayObj.date, endDate || hoverDate);

						// Hide the highlight completely if there's only a start date and no hover/end
						const showHighlight =
							startDate &&
							(endDate || hoverDate) &&
							isWithinInterval(dayObj.date, {
								start: startDate,
								end: endDate || hoverDate,
							});

						return (
							<div key={i} className="flex justify-center relative py-1">
								{/* --- NEW: Flawless Edge-to-Edge Highlight Background --- */}
								<div
									className="absolute inset-0 top-1 bottom-1 z-0 bg-[#e8f0fe] transition-all"
									style={{
										display: showHighlight ? "block" : "none",
										// Shift the background to cover exactly from the center of start/end buttons
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
									className={getDayClasses(dayObj)}
									disabled={!dayObj.isCurrentMonth}>
									{format(dayObj.date, "d")}

									{/* --- NEW: The indicator dot --- */}
									{hasSavedNote && (
										<span
											className={`absolute bottom-0 w-1 h-1 rounded-full ${isStart || isEnd ? "bg-white" : "bg-[#1a73e8]"}`}
										/>
									)}
								</button>
							</div>
						);
					})}
				</div>
			</div>

			<div className="mt-6 flex flex-col gap-4">
				{allMonthNotes.length > 0 && (
					<div className="pt-4 border-t border-gray-100 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
						<div className="flex flex-col gap-2">
							{allMonthNotes.map((n) => (
								<div
									key={n.key}
									onClick={() => jumpToNote(n)}
									className="flex items-center gap-3 text-xs p-2 rounded-md hover:bg-[#f1f3f4] cursor-pointer transition-colors border-l-2 border-[#1a73e8]">
									<span className="font-semibold whitespace-nowrap w-24 text-[#3c4043]">
										{n.type === "general"
											? "General"
											: n.type === "single"
												? format(n.date, "MMM d")
												: `${format(n.start, "MMM d")} - ${format(n.end, "d")}`}
									</span>
									{/* Truncate ensures long text turns into ellipses (...) */}
									<span className="truncate text-[#5f6368]">{n.text}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Existing Notes Editor */}
				<div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
					<div className="flex justify-between items-center text-[#3c4043]">
						<div className="flex items-center gap-2">
							<AlignLeft size={16} className="text-[#5f6368]" />
							<h3 className="text-sm font-medium">
								{startDate && endDate
									? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`
									: startDate
										? format(startDate, "MMMM d")
										: `${format(currentDate, "MMMM")} General`}
							</h3>
						</div>
						<span className="text-xs text-[#70757a]">
							{isLoaded ? "Saved locally" : "Loading..."}
						</span>
					</div>

					<textarea
						value={notes}
						onChange={(e) => saveNote(e.target.value)}
						disabled={!isLoaded}
						className="w-full h-24 resize-none bg-[#f1f3f4] hover:bg-[#e8eaed] rounded-md p-3 text-sm text-[#3c4043] focus:bg-white focus:ring-2 focus:ring-[#1a73e8] focus:outline-none transition-all placeholder:text-[#70757a]"
						placeholder="Add description or notes..."
					/>
				</div>
			</div>
		</div>
	);
}
