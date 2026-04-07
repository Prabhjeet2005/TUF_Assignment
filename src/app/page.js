"use client";

import { useState, useEffect } from "react";
import CalendarWidget from "@/components/CalendarWidget";
import { format } from "date-fns";

export default function Home() {
	const [currentDate, setCurrentDate] = useState(new Date());
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!isMounted) return null; 

	return (
		<main className="min-h-screen bg-[#f8f9fa] flex items-center justify-center p-4 sm:p-8 font-sans">
			<div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-gray-100">

				<div className="w-full md:w-5/12 h-[300px] md:h-auto relative bg-blue-600 transition-colors duration-500">
					<img
						src="https://images.unsplash.com/photo-1522199670076-2852f80289c3?q=80&w=1000&auto=format&fit=crop"
						alt="Nature landscape"
						className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
					/>
					<div className="absolute top-0 left-0 p-6 text-white drop-shadow-md">
						<h1 className="text-5xl font-bold tracking-tight">
							{format(currentDate, "yyyy")}
						</h1>
						<h2 className="text-2xl font-light uppercase tracking-widest mt-1">
							{format(currentDate, "MMMM")}
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

				<div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col bg-white z-10 relative">
					<CalendarWidget
						currentDate={currentDate}
						setCurrentDate={setCurrentDate}
					/>
				</div>
			</div>
		</main>
	);
}
