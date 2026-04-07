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

export default function CalendarWidget({ currentDate, theme }) {
	const days = useMemo(() => getCalendarDays(currentDate), [currentDate]);

	const [startDate, setStartDate] = useState(null);
	const [endDate, setEndDate] = useState(null);
	const [hoverDate, setHoverDate] = useState(null);
	const [animateKey, setAnimateKey] = useState(0);
	const [allSavedNotes, setAllSavedNotes] = useState([]);

	const fetchAllNotes = () => {
		const notesArray = [];
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key && key.startsWith("notes-")) {
				const content = localStorage.getItem(key);
				if (content && content.trim() !== "") {
					notesArray.push({ key, content });
				}
			}
		}
		setAllSavedNotes(notesArray);
	};

	useEffect(() => {
		setAnimateKey((prev) => prev + 1);
		fetchAllNotes();

		const handleNotesUpdate = () => fetchAllNotes();
		window.addEventListener("notesUpdated", handleNotesUpdate);
		return () =>
			window.removeEventListener("notesUpdated", handleNotesUpdate);
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
		if (!startDate || (startDate && endDate)) {
			setStartDate(clickedDate);
			setEndDate(null);
		} else if (isBefore(clickedDate, startDate)) {
			setStartDate(clickedDate);
		} else {
			setEndDate(clickedDate);
		}
	};

	const getNoteLabel = (key) => {
		if (key.includes("general")) return "General Memo";
		const parts = key.replace("notes-", "").split("-to-");
		if (parts.length === 1)
			return format(new Date(parts[0]), "MMM d, yyyy");
		return `${format(new Date(parts[0]), "MMM d")} - ${format(new Date(parts[1]), "MMM d")}`;
	};

	return (
		<div className="flex flex-col md:flex-row gap-8 h-full w-full">
			{/* LEFT: Calendar Grid */}
			<div className="flex-1 flex flex-col gap-6">
				<div className="grid grid-cols-7 text-center border-b pb-4">
					{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
						<div
							key={day}
							className={`text-xs font-bold ${theme.text} tracking-wider opacity-70`}>
							{day}
						</div>
					))}
				</div>

				{/* Note the absence of gap-x here to allow continuous highlighting */}
				<div className="grid grid-cols-7 gap-y-2 text-center">
					{days.map((dayObj, i) => {
						const dateKey = format(dayObj.date, "MM-dd");
						const fullDateStr = format(dayObj.date, "yyyy-MM-dd");
						const holiday = HOLIDAYS[dateKey];
						const hasNote = allSavedNotes.some((n) =>
							n.key.includes(fullDateStr),
						);

						const isStart = startDate && isSameDay(dayObj.date, startDate);
						const isEnd = endDate && isSameDay(dayObj.date, endDate);

						let isBetween = false;
						if (startDate && endDate) {
							isBetween =
								isWithinInterval(dayObj.date, {
									start: startDate,
									end: endDate,
								}) &&
								!isStart &&
								!isEnd;
						} else if (
							startDate &&
							hoverDate &&
							isAfter(hoverDate, startDate)
						) {
							isBetween =
								isWithinInterval(dayObj.date, {
									start: startDate,
									end: hoverDate,
								}) && !isStart;
						}

						return (
							<div
								key={`${animateKey}-${i}`}
								className="relative py-1 animate-fade-in"
								style={{ animationDelay: `${i * 10}ms` }}>
								{/* The Continuous Background Layer (Absolute positioning creates the seamless link) */}
								{isBetween && dayObj.isCurrentMonth && (
									<div
										className={`absolute inset-y-1 left-0 right-0 ${theme.lightBg}`}
									/>
								)}
								{isStart &&
									(endDate || hoverDate) &&
									dayObj.isCurrentMonth && (
										<div
											className={`absolute inset-y-1 right-0 w-1/2 ${theme.lightBg}`}
										/>
									)}
								{isEnd && dayObj.isCurrentMonth && (
									<div
										className={`absolute inset-y-1 left-0 w-1/2 ${theme.lightBg}`}
									/>
								)}

								{/* The Interactive Button Layer */}
								<button
									onClick={() => handleDateClick(dayObj.date)}
									onMouseEnter={() => setHoverDate(dayObj.date)}
									onMouseLeave={() => setHoverDate(null)}
									disabled={!dayObj.isCurrentMonth}
									className={`relative z-10 w-10 h-10 mx-auto flex items-center justify-center rounded-full text-sm transition-all duration-200
                    ${!dayObj.isCurrentMonth ? "text-gray-300 hover:bg-gray-50" : ""}
                    ${isStart || isEnd ? `${theme.color} text-white font-bold shadow-md transform scale-105` : ""}
                    ${isBetween && dayObj.isCurrentMonth ? `${theme.text} font-medium` : ""}
                    ${!isStart && !isEnd && !isBetween && dayObj.isCurrentMonth ? `text-gray-700 hover:${theme.lightBg} font-medium` : ""}
                  `}
									title={holiday || ""}>
									{format(dayObj.date, "d")}
								</button>

								{/* The Note & Holiday Dots */}
								{dayObj.isCurrentMonth && (
									<div className="absolute bottom-0 left-0 right-0 flex justify-center gap-1 z-10">
										{holiday && (
											<span
												className={`w-1 h-1 rounded-full ${isStart || isEnd ? "bg-white" : theme.color}`}
											/>
										)}
										{hasNote && (
											<span
												className={`w-1 h-1 rounded-full ${isStart || isEnd ? "bg-white" : "bg-gray-800"}`}
											/>
										)}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>

			{/* RIGHT: Notes & Saved List Sidebar */}
			<div className="w-full md:w-64 flex flex-col gap-6 md:border-l border-gray-100 md:pl-8 mt-6 md:mt-0 pt-6 md:pt-0">
				{/* Active Editor */}
				<div className="flex flex-col flex-shrink-0">
					<div className="flex justify-between items-center mb-2">
						<h3
							className={`text-sm font-bold uppercase tracking-wide ${theme.text}`}>
							{currentNotesKey.includes("general")
								? `${theme.month} Memo`
								: "Date Notes"}
						</h3>
						<span className="text-[10px] text-gray-400 font-medium">
							{isLoaded ? "Autosaved" : "..."}
						</span>
					</div>
					<textarea
						value={notes}
						onChange={(e) => saveNote(e.target.value)}
						disabled={!isLoaded}
						className={`w-full h-28 resize-none rounded-xl border border-gray-200 p-3 text-sm text-gray-700 transition-all placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:border-transparent ${theme.color.replace("bg-", "focus:ring-")}`}
						placeholder={
							startDate && endDate
								? `Plans for ${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}...`
								: startDate
									? `Plans for ${format(startDate, "MMM d")}...`
									: `General memos for ${theme.month}...`
						}
					/>
				</div>

				{/* Saved Notes Feed */}
				<div className="flex flex-col flex-1 overflow-hidden">
					<h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">
						Saved Notes
					</h3>
					<div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
						{allSavedNotes.length === 0 ? (
							<p className="text-xs text-gray-400 italic">
								No notes saved yet.
							</p>
						) : (
							allSavedNotes.map((noteObj, idx) => (
								<div
									key={idx}
									className="bg-gray-50 border border-gray-100 p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-default">
									<div
										className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${theme.text}`}>
										{getNoteLabel(noteObj.key)}
									</div>
									<p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
										{noteObj.content}
									</p>
								</div>
							))
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
