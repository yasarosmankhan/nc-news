const express = require('express');
const app = express();
const { getTopics } = require('./controllers/topics.controllers');
const { getEndPoints } = require('./controllers/endpoints.controllers');
const {
	getArticleById,
	getArticles,
	getCommentsByArticleId,
	postCommentsByArticleId,
	updateArticleById,
	deleteCommentById,
} = require('./controllers/articles.controllers');
const {
	handleCustomErrors,
	handle500Errors,
	handleWrongPathErrors,
} = require('./controllers/errors.controllers');
const { getUsers } = require('./controllers/users.controllers');

app.use(express.json());

app.get('/api/topics', getTopics);
app.get('/api', getEndPoints);
app.get('/api/articles/:article_id', getArticleById);
app.get('/api/articles', getArticles);
app.get('/api/articles/:article_id/comments', getCommentsByArticleId);
app.get('/api/users', getUsers);

app.post('/api/articles/:article_id/comments', postCommentsByArticleId);

app.patch('/api/articles/:article_id', updateArticleById);

app.delete('/api/comments/:comment_id', deleteCommentById);

app.all('/*', handleWrongPathErrors);
app.use(handleCustomErrors);
app.use(handle500Errors);

module.exports = app;
