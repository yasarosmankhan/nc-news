const { selectArticlesById } = require('../models/articles.models');

exports.getArticlesById = (req, res, next) => {
	const { article_id } = req.params;
	selectArticlesById(article_id)
		.then((articles) => {
			res.status(200).send({ articles: articles });
		})
		.catch((err) => {
			next(err);
		});
};
