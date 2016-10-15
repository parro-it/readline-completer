export default function readCursorPosition(stdin, stdout, cb) {
	let result = '';
	let timeoutHandler = null;

	const fillBuffer = chunk => {
		result += chunk.toString('ascii');
		if (result[result.length - 1] === 'R') {
			stdin.removeListener('data', fillBuffer);
			clearTimeout(timeoutHandler);

			const info = result
				.slice(2, -1)
				.split(';')
				.map(Number);
			cb(null, {row: info[0], col: info[1]});
		}
	};

	stdin.on('data', fillBuffer);
	timeoutHandler = setTimeout(() => cb(new Error('Timeout reading cursor position data')), 1000);

	stdout.write('\u001b[6n');
}
