const fs = require('fs');
const path = require('path');

/**
 * get an array of the files under the give path
 */
function iterateFiles(source) {
	let fileList = [];
	return new Promise((res, rej) => {
		fs.readdir(source, function(err, files) {
			if (err) {
				console.error('Could not list the directory.', err);
				return rej(err);
			}

			Promise.all(
				files.map(file => {
					const filePath = path.join(source, file);
					return new Promise((res, rej) => {
						fs.stat(filePath, (error, stat) => {
							if (error) {
								console.error('Error stating file.', error);
								return rej(error);
							}

							if (stat.isFile()) {
								fileList.push(filePath);
								return res();
							} else if (stat.isDirectory()) {
								iterateFiles(filePath).then(list => {
									fileList = fileList.concat(list);
									return res();
								});
							} else {
								return res();
							}
						});
					});
				})
			).then(() => {
				return res(fileList);
			});
		});
	});
}

const utility = {};
utility.iterateFiles = iterateFiles;
module.exports = utility;
