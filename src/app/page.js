"use client";

import { useState } from "react";
import CalendarWidget from "@/components/CalendarWidget";
import { addMonths, subMonths, format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MONTH_THEMES } from "@/utils/calendarConfig";

export default function Home() {
	const [currentDate, setCurrentDate] = useState(new Date(2026, 0, 1));
	const monthIndex = currentDate.getMonth();
	const theme = MONTH_THEMES[monthIndex];

	const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
	const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

	return (
		<main className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 sm:p-8 transition-colors duration-500">
			<div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
				<div
					className={`w-full md:w-5/12 h-64 md:h-auto relative ${theme.color} transition-colors duration-500`}>
					<img
						key={theme.image}
						src={theme.image}
						alt={`${theme.month} landscape`}
						className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80 animate-fade-in"
					/>

					<div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center text-white z-10">
						<button
							onClick={handlePrevMonth}
							className="p-2 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all">
							<ChevronLeft size={24} />
						</button>
						<button
							onClick={handleNextMonth}
							className="p-2 hover:bg-white/20 rounded-full backdrop-blur-sm transition-all">
							<ChevronRight size={24} />
						</button>
					</div>

					<div className="absolute bottom-0 right-0 p-6 text-right text-white drop-shadow-md">
						<h1 className="text-4xl font-bold tracking-tight">
							{format(currentDate, "yyyy")}
						</h1>
						<h2 className="text-2xl font-light uppercase tracking-widest">
							{theme.month}
						</h2>
					</div>

					<div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none transform translate-y-[99%]">
						<svg
							data-name="Layer 1"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 1200 120"
							preserveAspectRatio="none"
							className="relative block w-full h-[40px] md:h-[60px]">
							<path
								d="M1200 120L0 16.48 0 0 1200 0 1200 120z"
								className="fill-white"></path>
						</svg>
					</div>
				</div>

				<div className="w-full md:w-7/12 p-6 md:p-10 flex flex-col gap-8 bg-white z-10 relative">
					<CalendarWidget currentDate={currentDate} theme={theme} />
				</div>
			</div>
		</main>
	);
}
