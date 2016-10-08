import 'babel-register';
import test from 'ava';
import readlineCompleter from './main';

test('exports a function', t => {
	t.is(typeof readlineCompleter, 'function');
});
