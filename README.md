# Interactive Calendar Component

**Live Demo:** `https://tuf-assignment-bice.vercel.app/`
**Video Walkthrough:** `https://youtu.be/0E4US_Kx1pI`

This project is a highly interactive, fully responsive React/Next.js calendar component built to emulate a physical wall calendar. It was developed to fulfill a frontend engineering challenge, focusing on clean architecture, complex state management, and an exceptional user experience.

## ✨ Features

* **Dynamic Day Range Selection:** Users can select start and end dates with a seamless, gapless visual highlight trail connecting the days.
* **Persistent Local Storage Notes:** Integrated notes system that isolates data dynamically. Users can save "General Month" notes, or click specific dates/ranges to attach isolated memos. Data persists via a custom `localStorage` hook.
* **Monthly Overview Dashboard:** A scrollable dashboard dynamically compiles and sorts all notes for the current month (Passed dates are pushed to the bottom, upcoming dates float to the top).
* **Dynamic Theming & Imagery:** The calendar's primary colors, text hues, and hero image automatically change based on the current month to reflect the seasons.
* **Holiday & Weekend Indicators:** Built-in holiday tracking puts a visual star on significant dates, and weekends are visually separated from weekdays.
* **Fully Responsive:** Side-by-side layout on desktop that gracefully collapses to a stacked, touch-friendly UI on mobile devices.

## 🏗️ Architectural Choices

To demonstrate strong frontend fundamentals, I made specific architectural decisions regarding the tech stack and component structure:

1.  **Framework: Next.js (App Router)**
    * *Why:* While a standard Vite/React app would work, Next.js provides out-of-the-box optimizations, a strict and predictable folder structure (`src/app`), and seamless deployment via Vercel. 
2.  **Styling: Tailwind CSS**
    * *Why:* Chosen for rapid, utility-first UI development. It allowed me to build complex responsive layouts (like the side-by-side desktop view) and handle dynamic theming directly in the JSX without managing sprawling external stylesheets.
3.  **State Management: React Hooks (`useState`, `useMemo`, `useCallback`)**
    * *Why:* I deliberately avoided heavy global state managers like Redux or Zustand. The state of this component (start date, end date, current month) is highly localized. Lifting state to the parent `page.js` container was sufficient to keep the Hero Image and Calendar Widget perfectly synced.
4.  **Date Logic: `date-fns`**
    * *Why:* Handling date math manually (leap years, month rollovers, days of the week) is notoriously prone to bugs. `date-fns` is a lightweight, modular library that allowed me to cleanly generate the month grid and handle comparison logic (`isBefore`, `isWithinInterval`) without bloating the bundle size like Moment.js would.
5.  **Data Persistence: Custom `useNotes` Hook**
    * *Why:* Per the requirements, no backend was allowed. I built a custom hook to wrap `localStorage`. Crucially, this hook dispatches browser events upon saving, allowing disparate parts of the UI (like the calendar dots and the overview list) to instantly re-render without complex prop-drilling, while also implementing a hydration-safe loading state to prevent Next.js SSR mismatch errors.

## 🚀 Running the Project Locally

Follow these steps to run the component on your local machine.

**Prerequisites:**
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

**1. Clone the repository**
```bash
git clone [https://github.com/yourusername/your-repo-name.git](https://github.com/yourusername/your-repo-name.git)
cd your-repo-name
```

**2. Install dependencies**
```bash
npm install
```

**3. Run the development server**
```bash
npm run dev
```

**4. View the application**
Open your browser and navigate to `http://localhost:3000` to interact with the calendar.

## 🛠️ Tech Stack
* React 18
* Next.js 14
* Tailwind CSS
* date-fns
* lucide-react (Icons)
```
