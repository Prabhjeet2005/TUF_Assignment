import {
	startOfMonth,
	endOfMonth,
	startOfWeek,
	endOfWeek,
	eachDayOfInterval,
	isSameMonth,
} from "date-fns";

export function getCalendarDays(currentDate) {
	const monthStart = startOfMonth(currentDate);
	const monthEnd = endOfMonth(monthStart);

	const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
	const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

	const days = eachDayOfInterval({
		start: startDate,
		end: endDate,
	});

	return days.map((day) => ({
		date: day,
		isCurrentMonth: isSameMonth(day, monthStart),
	}));
}
