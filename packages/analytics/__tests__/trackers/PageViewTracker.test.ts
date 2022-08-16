import { PageViewTracker } from '../../src/trackers/PageViewTracker';
import { MethodEmbed } from '../../src/utils/MethodEmbed';

const tracker = jest.fn().mockImplementation(() => {
	return Promise.resolve();
});

class SessionStorageMock {
	private store;
	private maxSize;
	private curSize;
	private length;

	constructor() {
		this.store = {};
		this.maxSize = 5000;
		this.curSize = 0;
		this.length = 0;
	}

	getByteLength(str) {
		var ret = str.length;

		for (var i = str.length; i >= 0; i--) {
			var charCode = str.charCodeAt(i);
			if (charCode > 0x7f && charCode <= 0x7ff) {
				++ret;
			} else if (charCode > 0x7ff && charCode <= 0xffff) {
				ret += 2;
			}
			if (charCode >= 0xdc00 && charCode <= 0xdfff) {
				i--; //trail surrogate
			}
		}
		return ret;
	}

	clear() {
		this.store = {};
		this.curSize = 0;
	}

	getItem(key) {
		return this.store[key] || null;
	}

	setItem(key, value) {
		if (key in this.store) {
			this.removeItem(key);
		}
		if (this.curSize + this.getByteLength(value.toString()) > this.maxSize) {
			throw new Error('session storage is full!');
		} else {
			this.store[key] = value.toString();
			this.curSize += this.getByteLength(this.store[key]);
			++this.length;
			//console.log('current size in session storage: ' + this.curSize);
		}
	}

	removeItem(key) {
		this.curSize -= this.getByteLength(this.store[key]);
		delete this.store[key];
		--this.length;
	}

	showItems() {
		var str = '';
		for (var key in this.store) {
			str += key + '\n';
		}
		str = 'show items in mock cache: \n' + str;
		console.log(str);
	}

	setSize(size) {
		this.maxSize = size;
	}

	getSize() {
		return this.maxSize;
	}

	key(i) {
		var keys = Object.keys(this.store);
		return keys[i];
	}
}

window.sessionStorage = new SessionStorageMock();

describe('PageViewTracker test', () => {
	describe('constructor test', () => {
		test('happy case with type SPA', () => {
			const spyon = jest.spyOn(MethodEmbed, 'add').mockImplementation(() => {
				return;
			});
			const spyon2 = jest
				.spyOn(window, 'addEventListener')
				.mockImplementation(() => {
					return;
				});
			const pageViewTracer = new PageViewTracker(tracker, {
				enable: true,
				type: 'SPA',
			});

			expect(spyon).toBeCalled();
			expect(spyon2).toBeCalled();

			spyon.mockClear();
			spyon2.mockClear();
		});

		test('type SPA, in unsupported env', () => {
			let tmp = window.addEventListener;
			window.addEventListener = undefined;

			const spyon = jest.spyOn(MethodEmbed, 'add').mockImplementation(() => {
				return;
			});

			const pageViewTracer = new PageViewTracker(tracker, {
				enable: true,
				type: 'SPA',
			});

			expect(spyon).not.toBeCalled();

			spyon.mockClear();

			window.addEventListener = tmp;
		});

		test.skip('happy case with type default', () => {
			tracker.mockClear();

			const spyon = jest
				.spyOn(sessionStorage, 'getItem')
				.mockImplementation(() => {
					return 'url1';
				});

			const spyon2 = jest
				.spyOn(sessionStorage, 'setItem')
				.mockImplementation(() => {
					return;
				});

			const pageViewTracer = new PageViewTracker(tracker, {
				enable: true,
			});

			expect(tracker).toBeCalled();
			spyon.mockClear();
			spyon2.mockClear();
		});

		test('type default, in unsupported env', () => {
			tracker.mockClear();

			let tmp = window.addEventListener;
			window.addEventListener = undefined;

			const pageViewTracer = new PageViewTracker(tracker, {
				enable: true,
			});

			expect(tracker).not.toBeCalled();
			window.addEventListener = tmp;
		});
	});

	describe('configure test', () => {
		test('happy case', () => {
			const pageViewTracer = new PageViewTracker(tracker, {
				enable: true,
			});

			const getUrlMock = jest.fn();
			expect(
				pageViewTracer.configure({
					enable: true,
					attributes: {
						attr: 'attr',
					},
					provider: 'myProvider',
					getUrl: getUrlMock,
				})
			).toEqual({
				enable: true,
				attributes: {
					attr: 'attr',
				},
				provider: 'myProvider',
				getUrl: getUrlMock,
			});
		});

		test('turn off autoTrack', () => {
			const spyon = jest.spyOn(MethodEmbed, 'remove').mockImplementation(() => {
				return;
			});
			const spyon2 = jest
				.spyOn(window, 'removeEventListener')
				.mockImplementation(() => {
					return;
				});
			const pageViewTracer = new PageViewTracker(tracker, {
				enable: true,
				type: 'SPA',
			});

			pageViewTracer.configure({
				enable: false,
			});

			expect(spyon).toBeCalled();
			expect(spyon2).toBeCalled();

			spyon.mockClear();
			spyon2.mockClear();
		});
	});
});
