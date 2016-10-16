import events from 'events';
import split from 'split-array';
import csi from 'ansi-escape';
import Canvas from 'term-canvas';
import keypress from 'keypress';
import readCursorPosition from './read-cursor-position';

const EventEmitter = events.EventEmitter;

const onKeypress = list => (ch, key) => {
	if (!key) {
		return;
	}

	switch (key.name) {
		case 'return':
			list.emit('select');
			break;
		case 'escape':
			list.emit('cancel');
			break;

		case 'up':
		case 'down':
		case 'left':
		case 'right':
			list[key.name]();
			break;

		default:
	}
};

const checkPositionAndDraw = list => () => {
	return readCursorPosition(
		list.input,
		list.output,
		(err, position) => {
			if (err) {
				return console.error(err);
			}
			list.position = position || {row: 0, col: 0};
			list.draw();
		}
	);
};

const draw = list => () => {
	list.ctx.save();

	let columnWidth = 20;

	if (list.output.columns < 20) {
		columnWidth = list.output.columns;
	}
	// setTerminalTitle(JSON.stringify(list.position))
	list.columnCount = Math.floor(list.output.columns / columnWidth);

	const rows = split(list.items, list.columnCount);
	if (list.position.row + rows.length > list.size.row) {
		const howToScroll = list.position.row + rows.length - list.size.row;
		list.position.row -= howToScroll;
		list.output.write(
			csi.scrollUp(howToScroll).escape('')
		);
	}

	list.ctx.translate(0, list.position.row + 1);
	// list.ctx.clearRect(list.position.row + 1, 0, list.position.row + 1 + rows.length, list.output.columns);

	rows.forEach((row, rowIdx) => {
		row.forEach((item, colIdx) => {
			const label = item.value.length > columnWidth ?
				item.value.slice(0, columnWidth - 1) + '…' :
				item.value;

			if (list.selectedIdx === item.idx) {
				list.ctx.fillStyle = 'blue';
				list.ctx.fillRect(colIdx * (columnWidth + 1), rowIdx);
				list.ctx.fillStyle = 'black';
				list.ctx.fillText(label + ' ', colIdx * (columnWidth + 1), rowIdx);
			} else {
				list.ctx.fillStyle = 'normal';
				list.ctx.fillRect(colIdx * (columnWidth + 1), rowIdx);
				list.ctx.fillText(label + ' ', colIdx * (columnWidth + 1), rowIdx);
			}
		});
	});

	list.ctx.restore();
};

export default class List extends EventEmitter {

	constructor(opts) {
		super();
		opts = opts || {};
		this.items = opts.items.map((value, idx) => ({value, idx}));
		this.selectedIdx = 0;
		this.map = {};
		this.onkeypress = onKeypress(this);
		this.draw = draw(this);
		this.checkPositionAndDraw = checkPositionAndDraw(this);
		this.cancel = () => this.emit('cancel');

		this.input = opts.input;
		this.output = opts.output;

		const size = this.output.getWindowSize();
		this.size = {row: size[1], col: size[0]};
		const canvas = new Canvas(size[1], size[0]);
		canvas.stream = opts.output;
		this.ctx = canvas.getContext('2d');
	}

	get selected() {
		return this.items[this.selectedIdx].value;
	}

	select(idx) {
		this.selectedIdx = idx;
		this.draw();
	}

	up() {
		const idx = this.selectedIdx - this.columnCount;
		if (idx >= 0) {
			this.select(idx);
		}
	}

	down() {
		const idx = this.selectedIdx + this.columnCount;
		if (idx < this.items.length) {
			this.select(idx);
		}
	}

	left() {
		const idx = this.selectedIdx - 1;
		if (idx >= 0) {
			this.select(idx);
		}
	}

	right() {
		const idx = this.selectedIdx + 1;
		if (idx < this.items.length) {
			this.select(idx);
		}
	}

	stop() {
		this.input.removeListener('keypress', this.onkeypress);
		this.output.removeListener('resize', this.cancel);
		this.ctx.clearRect(0, this.position.row + 1, this.size.col, this.size.row);
		this.ctx.moveTo(this.position.col, this.position.row);
		this.ctx.showCursor();
	}

	start() {
		keypress(this.input);
		this.input.on('keypress', this.onkeypress);
		this.output.on('resize', this.cancel);
		this.ctx.hideCursor();
		this.input.setRawMode(true);
		this.checkPositionAndDraw();
	}
}
