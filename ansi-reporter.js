import AnsiParser from 'node-ansiparser';
import concat from 'concat-stream';
/* eslint-disable camelcase */

const mkAnsiResultCollector = () => {
	const result = [];
	const visitor = {
		inst_p: function (s) {
			result.push({PRINT: s});
		},

		inst_o: function (s) {
			result.push({OSC: s});
		},
		inst_x: function (flag) {
			result.push({EXECUTE: flag.charCodeAt(0)});
		},
		inst_c: function (collected, params, flag) {
			switch (collected) {
				case '':
					switch (flag) {
						case '@':
							result.push({ICH: params});
							break;

						case 'E':
							result.push({CNL: params});
							break;

						case 'F':
							result.push({CPL: params});
							break;

						case 'G':
							result.push({CHA: params});
							break;

						case 'D':
							result.push({CUB: params});
							break;

						case 'B':
							result.push({CUD: params});
							break;

						case 'C':
							result.push({CUF: params});
							break;

						case 'A':
							result.push({CUU: params});
							break;

						case 'I':
							result.push({CHT: params});
							break;

						case 'Z':
							result.push({CBT: params});
							break;

						case 'f':
						case 'H':
							result.push({CURSOR_POSITION: {row: params[0], col: params[1]}});
							break;

						case 'P':
							result.push({DCH: params});
							break;

						case 'J':
							result.push({ED: params});
							break;

						case 'K':
							result.push({EL: params});
							break;

						case 'L':
							result.push({IL: params});
							break;

						case 'M':
							result.push({DL: params});
							break;

						case 'S':
							result.push({SU: params});
							break;

						case 'T':
							result.push({SD: params});
							break;

						case 'X':
							result.push({ECH: params});
							break;

						case 'a':
							result.push({HPR: params});
							break;

						case 'b':
							result.push({REP: params});
							break;

						case 'e':
							result.push({VPR: params});
							break;

						case 'd':
							result.push({VPA: params});
							break;

						case 'h':
							result.push({HIGH: {collected, params}});
							break;

						case 'l':
							result.push({LOW: {collected, params}});
							break;

						case 'm':
							const p = params.map(p1 => {
								switch (p1) {
									case 39:
										return 'DEFAULT_FG';
									case 49:
										return 'DEFAULT_BG';
									case 30:
									case 31:
									case 32:
									case 33:
									case 34:
									case 35:
									case 36:
									case 37:
										return {SET_FG: p1 % 10};
									case 40:
									case 41:
									case 42:
									case 43:
									case 44:
									case 45:
									case 46:
									case 47:
										return {SET_BG: p1 % 10};
									default:
										return p1;
								}
							});
							result.push({SGR: p});
							break;

						case 'n':
							result.push({DSR: {collected, params}});
							break;

						case 'r':
							result.push({DECSTBM: params});
							break;

						case 's':
							result.push({DECSC: null});
							break;

						case 'u':
							result.push({DECRC: null});
							break;

						case '`':
							result.push({HPA: params});
							break;

						default :
							result.push({INST_C_UNHANDLED: {collected, params, flag}});
					}
					break;
				case '?':
					switch (flag) {
						case 'J':
							result.push({ED: params});  // DECSED as normal ED
							break;

						case 'K':
							result.push({EL: params});  // DECSEL as normal EL
							break;

						case 'h':
							result.push({HIGH: {collected, params}});
							break;

						case 'l':
							result.push({LOW: {collected, params}});
							break;

						case 'n':
							result.push({DSR: {collected, params}});
							break;

						default :
							result.push({INST_C_UNHANDLED: {collected, params, flag}});
					}
					break;
				case '>':
					switch (flag) {
						default :
							result.push({INST_C_UNHANDLED: {collected, params, flag}});
					}
					break;
				case '!':
					switch (flag) {
						case 'p':
							result.push({DECSTR: null});
							break;
						default :
							result.push({INST_C_UNHANDLED: {collected, params, flag}});
					}
					break;
				default :
					result.push({INST_C_UNHANDLED: {collected, params, flag}});
			}
		},
		inst_e: function (collected, flag) {
			result.push({ESC: collected, flag});
		},
		inst_H: function (collected, params, flag) {
			result.push({'DCS-HOOK': {collected, params, flag}});
		},
		inst_P: function (dcs) {
			result.push({'DCS-PUT': dcs});
		},
		inst_U: function () {
			result.push({'DCS-UNHOOK': null});
		}
	};

	return {result, visitor};
};

export default function report(stdout) {
	return new Promise((resolve, reject) => {
		stdout
			// .pipe(ansi)
			.pipe(concat({encoding: 'string'}, data => {
				const collector = mkAnsiResultCollector();
				const parser = new AnsiParser(collector.visitor);
				parser.parse(data);

				resolve(collector.result);
			}));
	});
}

