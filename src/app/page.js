"use client";

import { useState, useEffect } from "react";
import CalendarWidget from "@/components/CalendarWidget";
import { format } from "date-fns";
import { MONTH_THEMES } from "@/utils/calendarConfig";

export default function Home() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => setIsMounted(true), []);
	if (!isMounted) return null;

	// Retrieve the theme dynamically based on the current month index (0-11)
	const currentTheme = MONTH_THEMES[currentDate.getMonth()];

	return (
		<main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 sm:p-8 font-sans transition-colors duration-700">
			<div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 hover:shadow-3xl transition-shadow duration-500">
				<div
					className={`w-full md:w-5/12 h-[300px] md:h-auto relative ${currentTheme.primary} transition-colors duration-700 overflow-hidden`}>
					<img
						key={currentTheme.image} // Forces animation to re-trigger on image change
						src={currentTheme.image}
						alt={`${currentTheme.month} landscape`}
						className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-75 animate-flip-in"
					/>
					<div className="absolute top-0 left-0 p-6 text-white drop-shadow-lg z-10 animate-slide-up">
						<h1 className="text-5xl font-bold tracking-tight">
							{format(currentDate, "yyyy")}
						</h1>
						<h2 className="text-2xl font-light uppercase tracking-widest mt-1">
							{currentTheme.month}
						</h2>
					</div>

					<div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none transform translate-y-[99%] z-10">
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

				<div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col bg-white z-10 relative">
					{/* Passing the theme colors to the widget */}
					<CalendarWidget
						currentDate={currentDate}
						setCurrentDate={setCurrentDate}
						theme={currentTheme}
					/>
				</div>
			</div>
		</main>
	);
}
