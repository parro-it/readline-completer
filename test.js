import test from 'ava';
import harness from 'readline-testharness';
import completer from './main';
import {_setTestPosition} from './src/read-cursor-position';
import report from './ansi-reporter';

const completions = ['e2freefrag', 'editres', 'enhancer', 'eval'];
_setTestPosition(1, 1);

function tabCompleter(word, partial, line, cb) {
	var hits = completions.filter(c => c.indexOf(word) === 0);
	cb(null, [
		hits.length ? hits : completions,
		hits.length ? word : ''
	]);
}

test('exports a function', async t => {
	const hns = harness.create(completer);
	hns.rlw.tabCompleter = tabCompleter;
	hns.rlw.line = 'e';

	hns.key('tab');

	const promisedResult = report(hns.rlw.output);
	setTimeout(() => hns.rlw.output.end());
	const result = await promisedResult;
	// console.log(JSON.stringify(result, null, 4).replace(/"/g, '\''));
	t.deepEqual(result, [{
		LOW: {
			collected: '?',
			params: [25]
		}
	}, {
		SGR: [{SET_BG: 4}]
	}, {
		SGR: [{SET_FG: 0}]
	}, {
		CURSOR_POSITION: {row: 2, col: 0}
	}, {
		PRINT: 'e2freefrag '
	}, {
		SGR: ['DEFAULT_BG']
	}, {
		SGR: ['DEFAULT_FG']
	}, {
		CURSOR_POSITION: {row: 2, col: 21}
	}, {
		PRINT: 'editres '
	}, {
		SGR: ['DEFAULT_BG']
	}, {
		SGR: ['DEFAULT_FG']
	}, {
		CURSOR_POSITION: {row: 2, col: 42}
	}, {
		PRINT: 'enhancer '
	}, {
		SGR: ['DEFAULT_BG']
	}, {
		SGR: ['DEFAULT_FG']
	}, {
		CURSOR_POSITION: {row: 2, col: 63}
	}, {
		PRINT: 'eval '
	}]);
});
