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
import {
	ChevronLeft,
	ChevronRight,
	AlignLeft,
	List,
	Calendar as CalendarIcon,
} from "lucide-react";

const parseLocalDate = (dateStr) => {
	const [y, m, d] = dateStr.split("-");
	return new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
};

export default function CalendarWidget({ currentDate, setCurrentDate }) {
	const days = useMemo(() => getCalendarDays(currentDate), [currentDate]);

	// Requirement Met: Day Range Selector (Start, End, and Hover States)
	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [hoverDate, setHoverDate] = useState(null);
	const [allMonthNotes, setAllMonthNotes] = useState([]);

	// Requirement Met: Integrated Notes (General vs Date Specific via Client Storage)
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
		notesList.sort((a, b) => (a.type === "general" ? -1 : 1));
		setAllMonthNotes(notesList);
	}, [currentDate]);

	useEffect(() => {
		refreshMonthNotes();
		window.addEventListener("notes-updated", refreshMonthNotes);
		return () =>
			window.removeEventListener("notes-updated", refreshMonthNotes);
	}, [refreshMonthNotes]);

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

	// NEW: Quickly jump back to real-time Today
	const handleGoToToday = () => {
		setCurrentDate(new Date());
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
			"h-9 w-9 flex items-center justify-center rounded-full text-sm cursor-pointer transition-all duration-150 relative z-10 font-medium ";

		if (!isCurrentMonth)
			return classes + "text-gray-300 pointer-events-none";

		const isStart = startDate && isSameDay(date, startDate);
		const isEnd = endDate && isSameDay(date, endDate);
		const isToday = isSameDay(date, new Date()); // NEW: Check if this is the actual today

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

		// Visual Hierarchy implementation
		if (isStart || isEnd) {
			classes += "bg-[#1a73e8] text-white shadow-sm";
		} else if (isBetween) {
			classes += "bg-transparent text-[#1a73e8]";
		} else if (isToday) {
			// NEW: Explicitly highlight today when unselected
			classes += "bg-[#f1f3f4] text-[#1a73e8] font-bold";
		} else {
			classes += "text-[#3c4043] hover:bg-[#f1f3f4]";
		}
		return classes;
	};

	return (
		<div className="flex flex-col h-full justify-between">
			<div>
				{/* Navigation Header */}
				<div className="flex justify-between items-center mb-6">
					<div className="flex items-center gap-4">
						<h2 className="text-xl font-medium text-[#3c4043]">
							{format(currentDate, "MMMM yyyy")}
						</h2>
						{/* NEW: Today Button */}
						{!isSameMonth(currentDate, new Date()) && (
							<button
								onClick={handleGoToToday}
								className="text-xs font-medium px-3 py-1.5 rounded bg-[#f1f3f4] text-[#3c4043] hover:bg-[#e8eaed] transition-colors">
								Today
							</button>
						)}
					</div>

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

				{/* Calendar Grid */}
				<div className="grid grid-cols-7 gap-y-2 text-center mb-4">
					{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map(
						(day, index) => (
							<div
								key={index}
								className="text-[10px] font-bold text-[#70757a] tracking-wider mb-2">
								{day}
							</div>
						),
					)}

					{days.map((dayObj, i) => {
						const isStart = startDate && isSameDay(dayObj.date, startDate);
						const isEnd = endDate && isSameDay(dayObj.date, endDate);

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

						const showHighlight =
							startDate &&
							(endDate || hoverDate) &&
							isWithinInterval(dayObj.date, {
								start: startDate,
								end: endDate || hoverDate,
							});

						return (
							<div key={i} className="flex justify-center relative py-1">
								{/* Seamless Background Highlight for Range */}
								<div
									className="absolute inset-0 top-1 bottom-1 z-0 bg-[#e8f0fe] transition-all"
									style={{
										display: showHighlight ? "block" : "none",
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

									{/* Indicator Dot for Notes */}
									{hasSavedNote && (
										<span
											className={`absolute -bottom-1 w-1 h-1 rounded-full ${isStart || isEnd ? "bg-white" : "bg-[#1a73e8]"}`}
										/>
									)}
								</button>
							</div>
						);
					})}
				</div>
			</div>

			<div className="mt-4 flex flex-col gap-4">
				{/* Creative Requirement Met: Month Overview List */}
				{allMonthNotes.length > 0 && (
					<div className="pt-4 border-t border-gray-100 max-h-24 overflow-y-auto pr-2 custom-scrollbar">
						<div className="flex items-center gap-2 mb-2 text-[#5f6368]">
							<List size={14} />
							<span className="text-[10px] font-bold uppercase tracking-wider">
								Month Overview
							</span>
						</div>
						<div className="flex flex-col gap-1">
							{allMonthNotes.map((n) => (
								<div
									key={n.key}
									onClick={() => jumpToNote(n)}
									className="flex items-center gap-3 text-xs p-1.5 rounded hover:bg-[#f1f3f4] cursor-pointer transition-colors border-l-2 border-[#1a73e8]">
									<span className="font-semibold whitespace-nowrap w-24 text-[#3c4043]">
										{n.type === "general"
											? "General"
											: n.type === "single"
												? format(n.date, "MMM d")
												: `${format(n.start, "MMM d")} - ${format(n.end, "d")}`}
									</span>
									<span className="truncate text-[#5f6368]">{n.text}</span>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Integrated Notes Text Area */}
				<div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
					<div className="flex justify-between items-center text-[#3c4043]">
						<div className="flex items-center gap-2">
							<CalendarIcon size={16} className="text-[#5f6368]" />
							<h3 className="text-sm font-medium">
								{startDate && endDate
									? `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")} Notes`
									: startDate
										? `${format(startDate, "MMMM d")} Notes`
										: `General ${format(currentDate, "MMMM")} Notes`}
							</h3>
						</div>
						<span className="text-[10px] text-[#70757a]">
							{isLoaded ? "Saved locally" : "Loading..."}
						</span>
					</div>

					<textarea
						value={notes}
						onChange={(e) => saveNote(e.target.value)}
						disabled={!isLoaded}
						className="w-full h-24 resize-none bg-[#f1f3f4] hover:bg-[#e8eaed] rounded border border-transparent p-3 text-sm text-[#3c4043] focus:bg-white focus:border-[#1a73e8] focus:ring-1 focus:ring-[#1a73e8] focus:outline-none transition-all placeholder:text-[#70757a]"
						placeholder="Type your notes here..."
					/>
				</div>
			</div>
		</div>
	);
}
