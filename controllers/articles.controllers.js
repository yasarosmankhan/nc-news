const { selectArticlesById } = require('../models/articles.models');

exports.getArticlesById = (req, res, next) => {
	const { article_id } = req.params;
	selectArticlesById(article_id)
		.then((article) => {
			res.status(200).send({ article: article });
		})
		.catch((err) => {
			next(err);
		});
};
