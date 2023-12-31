const {
	selectArticleById,
	selectArticles,
	selectCommentsByArticleId,
	InsertCommentByArticleId,
	updateArticleById,
	removeCommentById,
} = require('../models/articles.models');

exports.getArticleById = (req, res, next) => {
	const { article_id } = req.params;
	selectArticleById(article_id)
		.then((article) => {
			res.status(200).send({ article: article });
		})
		.catch((err) => {
			next(err);
		});
};

exports.getArticles = (req, res, next) => {
	const { sortby, order, topic } = req.query;
	selectArticles(sortby, order, topic)
		.then((articles) => {
			res.status(200).send({ articles: articles });
		})
		.catch((err) => {
			next(err);
		});
};

exports.getCommentsByArticleId = (req, res, next) => {
	const { article_id } = req.params;
	selectCommentsByArticleId(article_id)
		.then((comments) => {
			res.status(200).send({ comments: comments });
		})
		.catch((err) => {
			next(err);
		});
};

exports.postCommentsByArticleId = (req, res, next) => {
	const { article_id } = req.params;
	const newComment = req.body;
	InsertCommentByArticleId(article_id, newComment)
		.then((comment) => {
			res.status(201).send({ comment: comment });
		})
		.catch((err) => {
			next(err);
		});
};

exports.updateArticleById = (req, res, next) => {
	const { article_id } = req.params;
	const votes = req.body;
	updateArticleById(votes.inc_votes, article_id)
		.then((article) => {
			res.status(200).send({ article: article });
		})
		.catch((err) => {
			next(err);
		});
};

exports.deleteCommentById = (req, res, next) => {
	const { comment_id } = req.params;
	removeCommentById(comment_id)
		.then(() => {
			res.status(204).send();
		})
		.catch((err) => {
			next(err);
		});
};
