const db = require('../db/connection');

exports.selectArticlesById = (article_id) => {
	if (isNaN(article_id)) {
		return Promise.reject({
			status: 400,
			message: 'Bad request',
		});
	}
	let queryStr = 'SELECT * FROM articles WHERE article_id = $1;';

	return db.query(queryStr, [article_id]).then(({ rows }) => {
		if (rows.length === 0) {
			return Promise.reject({
				status: 404,
				message: 'Article does not exist',
			});
		} else {
			return rows[0];
		}
	});
};
