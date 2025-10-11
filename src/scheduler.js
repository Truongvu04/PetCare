const store = require('./storage/jsonStore');

function checkAndSend() {
	const db = store.readStore();
	const now = Date.now();
	let changed = false;
	db.reminders.forEach(r => {
		if (!r.sent) {
			const t = Date.parse(r.time);
			if (!isNaN(t) && t <= now) {
				// "Gửi" notification - hiện tại log, có thể tích hợp email/push
				console.log(`[Reminder] id=${r.id} title="${r.title}" message="${r.message}" time=${r.time}`);
				r.sent = true;
				r.sentAt = new Date().toISOString();
				changed = true;
			}
		}
	});
	if (changed) store.writeStore(db);
}

function start(intervalMs = 30_000) {
	// check immediately then interval
	checkAndSend();
	return setInterval(checkAndSend, intervalMs);
}

module.exports = { start };
