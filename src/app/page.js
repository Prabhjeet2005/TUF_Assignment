import CalendarWidget from "@/components/CalendarWidget";

export default function Home() {
	return (
		<main className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 sm:p-8">
			<div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

				<div className="w-full md:w-5/12 h-64 md:h-auto relative bg-blue-600">
					<img
						src="https://images.unsplash.com/photo-1522199670076-2852f80289c3?q=80&w=1000&auto=format&fit=crop"
						alt="Nature landscape"
						className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-80"
					/>
					<div className="absolute bottom-0 right-0 p-6 text-right text-white">
						<h1 className="text-4xl font-bold tracking-tight">2026</h1>
						<h2 className="text-2xl font-light uppercase tracking-widest">
							January
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
					<CalendarWidget />
				</div>
			</div>
		</main>
	);
}
