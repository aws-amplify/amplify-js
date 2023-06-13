export const getDateFromHeaderString = (header: string) => {
	const [, year, month, day, hour, minute, second] = header.match(
		/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2}).+/
	);

	return new Date(
		Date.UTC(
			Number(year),
			Number(month) - 1,
			Number(day),
			Number(hour),
			Number(minute),
			Number(second)
		)
	);
};
