import commonPrefix from 'common-prefix';
import List from './list';

export default function completer(rl) {
	const original = rl._ttyWrite;
	rl._ttyWrite = function _ttyWrite(s, key) {
		if (!key) {
			return original.call(this, s, key);
		}

		if (key.ctrl || key.shift || key.meta) {
			return original.call(this, s, key);
		}

		if (typeof this.tabCompleter !== 'function') {
			return original.call(this, s, key);
		}

		if (key.name !== 'tab') {
			return original.call(this, s, key);
		}

		tabComplete.call(this);
	};
}

function tabComplete() {
	const partialLine = this.line.slice(0, this.cursor);
	const lineWords = partialLine.split(/\s/);
	const word = lineWords[lineWords.length - 1];

	// console.log({partialLine, lineWords, word})

	this.pause();
	this.input.removeAllListeners('keypress');
	this.tabCompleter(word, partialLine, this.line, (err, rv) => {
		if (err) {
			console.error('tab completion error %j', err);
			return;
		}

		const completions = rv[0];
		const completeOn = rv[1];	// the text that was completed
		// console.log({completions, completeOn});
		if (completions && completions.length) {
			// If there is a common prefix to all matches, then apply that portion.
			const f = completions.filter(e => Boolean(e));
			const prefix = commonPrefix(f);
			if (prefix.length > completeOn.length) {
				this._insertString(prefix.slice(completeOn.length));
			}

			this._refreshLine();

			this.input.resume();
			if (completions.length > 1) {
				drawList.call(this, completions, prefix || completeOn);
			} else {
				this.resume();
			}
		}
	});
}

function drawList(items, completeOn) {
	var list = new List({
		items,
		input: this.input,
		output: this.output
	});

	list.on('select', () => {
		list.stop();
		this.resume();

		this._insertString(list.selected.slice(completeOn.length));
		this.input.on('keypress', (s, key) => {
			this._ttyWrite(s, key);
		});
	});

	list.on('cancel', () => {
		list.stop();
		this.resume();

		this.input.on('keypress', (s, key) => {
			this._ttyWrite(s, key);
		});
	});

	list.start();
}
