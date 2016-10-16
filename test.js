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

test('exports a function', t => {
	const hns = harness.create(completer);
	hns.rlw.tabCompleter = tabCompleter;
	hns.rlw.line = 'e';

	hns.key('tab');

	report(hns.rlw.output).then(result => {
		console.log(result);
	});
	setTimeout(() => hns.rlw.output.end());
});
