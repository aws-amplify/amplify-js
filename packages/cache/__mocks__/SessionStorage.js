class SessionStorageMock {
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
