export function str2hex(str: string) {
	return str
		.split('')
		.map(char =>
			char
				.charCodeAt(0)
				.toString(16)
				.padStart(2, '0')
		)
		.join('');
}

export function hex2str(hex: string) {
	return hex
		.match(/.{2}/g)
		.map(char => String.fromCharCode(parseInt(char, 16)))
		.join('');
}
