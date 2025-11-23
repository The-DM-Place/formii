const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	dim: '\x1b[2m',
	red: '\x1b[31m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	magenta: '\x1b[35m',
	cyan: '\x1b[36m',
	white: '\x1b[37m',
};

function formatTime() {
	return new Date().toLocaleString();
}

function log(level, color, ...args) {
	const timestamp = formatTime();
	console.log(`${color}[${timestamp}] [${level}]${colors.reset}`, ...args);
}

module.exports = {
	info: (...args) => log('INFO', colors.blue, ...args),
	warn: (...args) => log('WARN', colors.yellow, ...args),
	error: (...args) => log('ERROR', colors.red, ...args),
	success: (...args) => log('SUCCESS', colors.green, ...args),
	debug: (...args) => log('DEBUG', colors.magenta, ...args),
};
