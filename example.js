const readline = require('readline');
const readlineCompleter = require('.');

const completions = `e2freefrag editres enhancer eval
e2fsck efibootmgr env ex
e2image egrep env_default exec
e2label eject envsubst exfatfsck
e2undo elfedit eom exfatlabel
e4defrag elif eps2eps exit
echo else eqn expand
echotc emulate erb expand-or-complete-with-dots
echoti enable erb2.3 expiry
ed enc2xs esac explode
edit encguess esc-m export
edit-command-line end espeak expr
editor engrampa ethtool eyuvtoppm`
	.replace(/\n/g, ' ')
	.split(' ')
	.sort();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	prompt: '$ '
});

readlineCompleter(rl);

rl.tabCompleter = function tabCompleter(word, partial, line, cb) {
	var hits = completions.filter(c => c.indexOf(word) === 0);
	cb(null, [
		hits.length ? hits : completions,
		hits.length ? word : ''
	]);
};

rl.prompt();

rl.on('line', function (line) {
	console.log(line.toUpperCase());
	rl.prompt();
}).on('close', () => {
	rl.close();
});
