// import { exec } from 'child_process';
// export function getMD5(object): string {
// 	let contentMd5 = '';
// 	exec(`openssl md5 -binary ${object} | base64 `, (error, stdout, stderr) => {
// 		if (error) {
// 			console.log(`error: ${error.message}`);
// 			return;
// 		}
// 		if (stderr) {
// 			console.log(`stderr: ${stderr}`);
// 			return;
// 		}
// 		console.log(`stdout: ${stdout}`);
// 		contentMd5 = stdout;
// 	});
// 	return contentMd5;
// }
