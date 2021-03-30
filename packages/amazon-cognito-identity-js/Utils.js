//promisify is a utility function to clean up the repetition 
// in jest's asynchronous done() pattern
// More information here:  https://jestjs.io/docs/asynchronous#callbacks

async function promisify(obj, fn, ...args) {
	return new Promise((resolve, reject) => {
		obj[fn].apply(obj, [...args, (err, data) => {
			if (err) {
				reject(err);
			}
			else {
				resolve(data);
			}
		}]);
	});
}

exports.promisify = promisify



// instance.k = new BigInteger('deadbeef', 16)
// 		instance.UValue = instance.calculateU(instance.largeAValue, xValue)
// 		const xValue = new BigInteger('deadbeef', 16)
// 		const serverValue = new BigInteger('deadbeef', 16)
// 		const result = await promisify(instance, 'calculateS', xValue, serverValue)
//		typeof result === Error ? expect(result).toMatchObject(new Error()) : expect(result).toBe(null)

