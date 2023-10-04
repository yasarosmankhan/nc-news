const db = require('../db/connection');

exports.selectArticleById = (article_id) => {
	if (isNaN(article_id)) {
		return Promise.reject({
			status: 400,
			message: 'Bad Request',
		});
	}
	let queryStr = 'SELECT * FROM articles WHERE article_id = $1;';

	return db.query(queryStr, [article_id]).then(({ rows }) => {
		if (rows.length === 0) {
			return Promise.reject({
				status: 404,
				message: 'Not Found',
			});
		} else {
			return rows[0];
		}
	});
};

exports.selectArticles = (sortby, order) => {
	const validSortBy = { created_at: 'created_at' };
	const validOrder = { asc: 'ASC', desc: 'DESC' };

	if (sortby !== undefined && !(sortby in validSortBy)) {
		return Promise.reject({ status: 404, message: 'Not Found' });
	}

	if (order !== undefined && !(order in validOrder)) {
		return Promise.reject({ status: 400, message: 'Bad Request' });
	}

	const orderByClause =
		sortby !== undefined ? ` ORDER BY ${validSortBy[sortby]}` : '';
	const orderClause = order !== undefined ? ` ${validOrder[order]}` : '';

	const queryStr = `SELECT a.*, COUNT(c.comment_id) AS comment_count
						FROM articles AS a
						LEFT JOIN comments AS c
						ON a.article_id = c.article_id
						GROUP BY a.article_id${orderByClause}${orderClause};`;

	return db.query(queryStr).then((result) => {
		if (result.rows.length === 0) {
			return Promise.reject({ status: 404, message: 'Not Found' });
		}
		const articlesWithoutBody = result.rows.map((article) => {
			const { body, ...articleWithoutBody } = article;
			return articleWithoutBody;
		});

		return articlesWithoutBody;
	});
};

exports.selectCommentsByArticleId = (article_id) => {
	if (isNaN(article_id)) {
		return Promise.reject({
			status: 400,
			message: 'Bad Request',
		});
	}
	let queryStr =
		'SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at;';
	return db.query(queryStr, [article_id]).then((result) => {
		if (result.rows.length === 0) {
			return Promise.reject({ status: 404, message: 'Not Found' });
		} else {
			return result.rows;
		}
	});
};
