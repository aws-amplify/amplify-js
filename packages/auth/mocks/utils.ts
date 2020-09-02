// To trick cognito into accepting the automated test requests
export function randomDelay(): Promise<void> {
	const n = ((Math.random() * Math.random()) / Math.random()) * 1000;
	return new Promise(resolve => {
		setTimeout(resolve, n);
	});
}
