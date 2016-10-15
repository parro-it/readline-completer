import test from 'ava';
import completer from './main';

test('exports a function', t => {
	t.is(typeof completer, 'function');
});
