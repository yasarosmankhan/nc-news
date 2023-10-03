const express = require('express');
const app = express();
const { getTopics } = require('./controllers/topics.controllers');
const { getEndPoints } = require('./controllers/endpoints.controllers');

app.get('/api/topics', getTopics);

app.get('/api', getEndPoints);

app.all('/*', (req, res, next) => {
	res.status(404).send({ message: 'Wrong Path!' });
});

app.use((err, req, res, next) => {
	res.status(500).send({ message: 'Server Error!' });
});

module.exports = app;
