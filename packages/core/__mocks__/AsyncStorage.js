const AsyncStorage = jest.genMockFromModule(
	'@react-native-async-storage/async-storage'
);

var store = {};
var curSize = 0;
var maxSize = 5000;

function getByteLength(str) {
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

function clear() {
	store = {};
	curSize = 0;
}

function getItem(key) {
	return new Promise((res, rej) => {
		process.nextTick(() => {
			res(store[key] || null);
		});
	});
}

function setItem(key, value) {
	if (key in store) {
		curSize -= getByteLength(store[key]);
		delete store[key];
	}

	return new Promise((res, rej) => {
		process.nextTick(() => {
			if (curSize + getByteLength(value.toString()) > maxSize) {
				rej(new Error('asyncStorage is full'));
			} else {
				store[key] = value.toString();
				curSize += getByteLength(store[key]);
				res(key);
			}
		});
	});
}

function removeItem(key) {
	return new Promise((res, rej) => {
		process.nextTick(() => {
			curSize -= getByteLength(store[key]);
			delete store[key];
			res();
		});
	});
}

function getAllKeys() {
	return new Promise((res, rej) => {
		process.nextTick(() => {
			res(Object.keys(store));
		});
	});
}

function multiGet(keys) {
	return new Promise((res, rej) => {
		process.nextTick(() => {
			var ret = [];
			for (var i = 0; i < keys.length; i++) {
				var tmp = [];
				tmp.push(keys[i]);
				tmp.push(store[keys[i]]);
				ret.push(tmp);
			}
			res(ret);
		});
	});
}

function getSize() {
	return maxSize;
}

function setSize(size) {
	maxSize = size;
}

AsyncStorage.getItem = getItem;
AsyncStorage.setItem = setItem;
AsyncStorage.removeItem = removeItem;
AsyncStorage.getAllKeys = getAllKeys;
AsyncStorage.multiGet = multiGet;

AsyncStorage.getSize = getSize;
AsyncStorage.setSize = setSize;

module.exports = AsyncStorage;
