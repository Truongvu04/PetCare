const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'reminders.json');

function ensureDataFile() {
	if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
	if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({ reminders: [] }, null, 2));
}

function readStore() {
	ensureDataFile();
	const raw = fs.readFileSync(DATA_FILE, 'utf8');
	return JSON.parse(raw);
}

function writeStore(obj) {
	fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
}

module.exports = {
	readStore,
	writeStore
};