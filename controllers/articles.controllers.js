const {
	selectArticleById,
	selectArticles,
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
	const { sortby, order } = req.query;
	selectArticles(sortby, order)
		.then((articles) => {
			res.status(200).send({ articles: articles });
		})
		.catch((err) => {
			next(err);
		});
};
