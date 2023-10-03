const {
	selectArticleById,
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
