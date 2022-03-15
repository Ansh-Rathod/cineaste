export default function getWeek(date, dowOffset = 0) {
	const newYear = new Date(date.getFullYear(), 0, 1)
	let day = newYear.getDay() - dowOffset
	day = day >= 0 ? day : day + 7
	const daynum =
		Math.floor(
			(date.getTime() -
				newYear.getTime() -
				(date.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) /
				86400000
		) + 1
	if (day < 4) {
		const weeknum = Math.floor((daynum + day - 1) / 7) + 1
		if (weeknum > 52) {
			const nYear = new Date(date.getFullYear() + 1, 0, 1)
			let nday = nYear.getDay() - dowOffset
			nday = nday >= 0 ? nday : nday + 7
			return nday < 4 ? 1 : 53
		}
		return weeknum
	} else {
		return Math.floor((daynum + day - 1) / 7)
	}
}
