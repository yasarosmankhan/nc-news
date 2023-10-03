const db = require('../db/connection');

exports.selectArticleById = (article_id) => {
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

	return db
		.query(queryStr)
		.then((result) => {
			if (result.rows.length === 0) {
				return Promise.reject({ status: 404, message: 'Not Found' });
			}
			const articlesWithoutBody = result.rows.map((article) => {
				const { body, ...articleWithoutBody } = article;
				return articleWithoutBody;
			});

			return articlesWithoutBody;
		})
		.catch((error) => {
			return Promise.reject(error);
		});
};

// SELECT
//     a.*,
//     COUNT(c.comment_id) AS comment_count
// FROM
//     articles AS a
// LEFT JOIN
//     comments AS c
// ON
//     a.article_id = c.article_id
// GROUP BY
//     a.article_id
