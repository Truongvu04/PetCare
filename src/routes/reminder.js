const express = require('express');
const { v4: uuidv4 } = require('uuid');
const store = require('../storage/jsonStore');
const router = express.Router();

function nowISO() { return new Date().toISOString(); }

// GET /reminders
router.get('/', (req, res) => {
	const db = store.readStore();
	res.json(db.reminders);
});

// GET /reminders/:id
router.get('/:id', (req, res) => {
	const db = store.readStore();
	const r = db.reminders.find(x => x.id === req.params.id);
	if (!r) return res.status(404).json({ error: 'not found' });
	res.json(r);
});

// POST /reminders
router.post('/', (req, res) => {
	const { title, message, time } = req.body;
	if (!title || !time) return res.status(400).json({ error: 'title and time required' });
	const db = store.readStore();
	const reminder = {
		id: uuidv4(),
		title,
		message: message || '',
		time, // ISO expected
		createdAt: nowISO(),
		sent: false,
		sentAt: null
	};
	db.reminders.push(reminder);
	store.writeStore(db);
	res.status(201).json(reminder);
});

// PUT /reminders/:id
router.put('/:id', (req, res) => {
	const db = store.readStore();
	const idx = db.reminders.findIndex(x => x.id === req.params.id);
	if (idx === -1) return res.status(404).json({ error: 'not found' });
	const r = db.reminders[idx];
	const { title, message, time } = req.body;
	r.title = title ?? r.title;
	r.message = message ?? r.message;
	r.time = time ?? r.time;
	db.reminders[idx] = r;
	store.writeStore(db);
	res.json(r);
});

// DELETE /reminders/:id
router.delete('/:id', (req, res) => {
	const db = store.readStore();
	const idx = db.reminders.findIndex(x => x.id === req.params.id);
	if (idx === -1) return res.status(404).json({ error: 'not found' });
	const removed = db.reminders.splice(idx, 1)[0];
	store.writeStore(db);
	res.json(removed);
});

module.exports = router;
