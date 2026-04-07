
"use client";

import React from "react";

export default function CalendarWidget() {
	return (
		<div className="flex flex-col gap-8 h-full">
			<div className="grid grid-cols-7 gap-2 text-center border-b pb-4">
				{["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].map((day) => (
					<div
						key={day}
						className="text-xs font-semibold text-blue-600 tracking-wider">
						{day}
					</div>
				))}
			</div>

			<div className="h-64 flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg text-gray-400">
				Month Grid Placeholder
			</div>

			<div className="mt-auto pt-4 border-t border-gray-100">
				<h3 className="text-sm font-semibold text-gray-800 mb-2">Notes</h3>
				<textarea
					className="w-full h-24 resize-none border-0 bg-transparent p-0 focus:ring-0 text-sm text-gray-600"
					placeholder="Jot down your plans here..."
				/>
			</div>
		</div>
	);
}
