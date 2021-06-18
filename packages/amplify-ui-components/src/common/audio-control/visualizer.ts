import { browserOrNode } from '@aws-amplify/core';

export const visualize = (
	dataArray: Uint8Array,
	bufferLength: number,
	canvas: HTMLCanvasElement
) => {
	if (!canvas) return;
	if (!browserOrNode().isBrowser)
		throw new Error('Visualization is not supported on non-browsers.');
	const { width, height } = canvas.getBoundingClientRect();

	// need to update the default canvas width and height
	canvas.width = width;
	canvas.height = height;

	const canvasCtx = canvas.getContext('2d');

	canvasCtx.fillStyle = 'white';
	canvasCtx.clearRect(0, 0, width, height);

	const draw = () => {
		canvasCtx.fillRect(0, 0, width, height);
		canvasCtx.lineWidth = 1;
		const color = getComputedStyle(document.documentElement).getPropertyValue(
			'--amplify-primary-color'
		);
		canvasCtx.strokeStyle = !color || color === '' ? '#ff9900' : color; // TODO: try separate css variable
		canvasCtx.beginPath();

		const sliceWidth = (width * 1.0) / bufferLength;
		let x = 0;

		for (let i = 0; i < bufferLength || i % 3 === 0; i++) {
			const value = dataArray[i] / 128.0;
			const y = (value * height) / 2;
			if (i === 0) {
				canvasCtx.moveTo(x, y);
			} else {
				canvasCtx.lineTo(x, y);
			}
			x += sliceWidth;
		}

		canvasCtx.lineTo(canvas.width, canvas.height / 2);
		canvasCtx.stroke();
	};

	// Register our draw function with requestAnimationFrame.
	requestAnimationFrame(draw);
};
