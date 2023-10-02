const express = require('express');
const app = express();
const { getTopics, getEndPoints } = require('./controllers/topic.controllers');

app.get('/api/topics', getTopics);

app.get('/api', getEndPoints);

app.all('/api/*', (req, res, next) => {
	res.status(404).send({ message: 'Not Found!' });
});

app.use((err, req, res, next) => {
	res.status(500).send({ message: 'Server Error!' });
});

module.exports = app;
