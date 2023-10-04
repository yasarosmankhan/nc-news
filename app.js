const express = require('express');
const app = express();
const { getTopics } = require('./controllers/topics.controllers');
const { getEndPoints } = require('./controllers/endpoints.controllers');
const {
	getArticleById,
	getArticles,
	getCommentsByArticleId,
	postCommentsByArticleId,
} = require('./controllers/articles.controllers');
const {
	handleCustomErrors,
	handle500Errors,
	handleWrongPathErrors,
} = require('./controllers/errors.controllers');

app.use(express.json());

app.get('/api/topics', getTopics);
app.get('/api', getEndPoints);
app.get('/api/articles/:article_id', getArticleById);
app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id/comments', getCommentsByArticleId);

app.post('/api/articles/:article_id/comments', postCommentsByArticleId);

app.all('/*', handleWrongPathErrors);
app.use(handleCustomErrors);
app.use(handle500Errors);

module.exports = app;
