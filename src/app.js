const express = require('express');
const bodyParser = require('body-parser');
const reminderRouter = require('./routes/reminder');
const scheduler = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Reminders
app.use('/reminders', reminderRouter);

// start server
app.listen(PORT, () => {
	console.log(`Reminder API listening on port ${PORT}`);
	// start background scheduler
	scheduler.start();
});
