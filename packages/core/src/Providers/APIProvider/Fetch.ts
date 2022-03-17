export const postOptions = (body: object) => ({
	method: 'POST',
	mode: 'no-cors',
	cache: 'no-cache',
	credentials: 'same-origin',
	headers: {
		'Content-Type': 'application/json',
	},
	body: JSON.stringify(body),
});
