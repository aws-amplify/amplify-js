window.alert = msg => {
	console.log(msg);
};

function noOp() {}

if (typeof window.URL.createObjectURL === 'undefined') {
	Object.defineProperty(window.URL, 'createObjectURL', { value: noOp });
}

class Worker {
	constructor(stringUrl) {
		this.url = stringUrl;
		this.onmessage = () => {};
	}

	postMessage(msg) {
		this.onmessage(msg);
	}
}

window.Worker = Worker;
