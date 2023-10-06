const db = require('../db/connection');

exports.selectArticleById = (article_id) => {
	if (isNaN(article_id)) {
		return Promise.reject({
			status: 400,
			message: 'Bad Request',
		});
	}
	let queryStr = `SELECT a.*, COUNT(c.comment_id) AS comment_count
					FROM articles AS a
					LEFT JOIN comments AS c
					ON a.article_id = c.article_id
					WHERE a.article_id = $1
					GROUP BY a.article_id;`;

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

exports.selectArticles = (sortby, order, topic) => {
	const validSortBy = { created_at: 'created_at' };
	const validOrder = { asc: 'ASC', desc: 'DESC' };
	let validFilters = [];

	const fetchTopic = () => {
		const topicQueryStr = 'SELECT slug FROM topics;';
		return db.query(topicQueryStr).then((result) => {
			validFilters = result.rows.map((row) => row.slug);
			return result;
		});
	};

	return fetchTopic().then(() => {
		if (sortby !== undefined && !(sortby in validSortBy)) {
			return Promise.reject({ status: 400, message: 'Bad Request' });
		}

		if (order !== undefined && !(order in validOrder)) {
			return Promise.reject({ status: 400, message: 'Bad Request' });
		}

		if (topic !== undefined && !validFilters.includes(topic)) {
			return Promise.reject({ status: 400, message: 'Bad Request' });
		}

		const orderByClause =
			sortby !== undefined ? ` ORDER BY ${validSortBy[sortby]}` : '';
		const orderClause = order !== undefined ? ` ${validOrder[order]}` : '';
		const filterClause =
			topic !== undefined ? `WHERE a.topic = '${topic}'` : '';

		const queryStr = `SELECT a.*, COUNT(c.comment_id) AS comment_count
						FROM articles AS a
						LEFT JOIN comments AS c
						ON a.article_id = c.article_id
						${filterClause}
						GROUP BY a.article_id${orderByClause}${orderClause};`;

		return db.query(queryStr).then((result) => {
			const articlesWithoutBody = result.rows.map((article) => {
				const { body, ...articleWithoutBody } = article;
				return articleWithoutBody;
			});

			return articlesWithoutBody;
		});
	});
};

exports.selectCommentsByArticleId = (article_id) => {
	if (isNaN(article_id)) {
		return Promise.reject({
			status: 400,
			message: 'Bad Request',
		});
	}

	const fetchArticle = () => {
		const articleQueryStr = 'SELECT * FROM articles WHERE article_id = $1;';
		return db.query(articleQueryStr, [article_id]).then((result) => {
			return result;
		});
	};

	const fetchComments = () => {
		const commentsQueryStr =
			'SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at;';
		return db.query(commentsQueryStr, [article_id]);
	};

	return Promise.all([fetchArticle(), fetchComments()]).then(
		([articleResult, commentsResult]) => {
			if (articleResult.rows.length === 0) {
				return Promise.reject({
					status: 404,
					message: 'Not Found',
				});
			} else {
				return commentsResult.rows.length === 0
					? []
					: commentsResult.rows;
			}
		}
	);
};

exports.InsertCommentByArticleId = (article_id, newComment) => {
	const { username, body } = newComment;

	if (!article_id || !username || !body) {
		return Promise.reject({ status: 400, message: 'Bad Request' });
	}

	const fetchArticle = () => {
		const articleQueryStr = 'SELECT * FROM articles WHERE article_id = $1;';
		return db.query(articleQueryStr, [article_id]);
	};

	const fetchAuthor = () => {
		const authorQueryStr = 'SELECT * FROM articles WHERE author = $1;';
		return db.query(authorQueryStr, [username]);
	};

	return fetchArticle()
		.then((articleResult) => {
			if (articleResult.rows.length === 0) {
				return Promise.reject({
					status: 404,
					message: 'Not Found',
				});
			} else {
				return fetchAuthor();
			}
		})
		.then((authorResult) => {
			if (authorResult.rows.length === 0) {
				return Promise.reject({
					status: 404,
					message: 'Not Found',
				});
			} else {
				const insertComment = () => {
					const commentsQueryStr = `INSERT INTO comments (body, article_id, author) 
									 VALUES ($1, $2, $3) RETURNING *;`;
					return db.query(commentsQueryStr, [
						body,
						article_id,
						username,
					]);
				};

				return insertComment().then((commentsResult) => {
					return commentsResult.rows[0];
				});
			}
		});
};

exports.updateArticleById = (votes, article_id) => {
	if (isNaN(votes) || isNaN(article_id)) {
		return Promise.reject({
			status: 400,
			message: 'Bad Request',
		});
	}
	if (article_id === undefined || !votes) {
		return Promise.reject({ status: 400, message: 'Bad Request' });
	}

	const fetchArticle = () => {
		const articleQueryStr = 'SELECT * FROM articles WHERE article_id = $1;';
		return db.query(articleQueryStr, [article_id]).then((result) => {
			return result;
		});
	};

	return fetchArticle().then((articleResult) => {
		if (articleResult.rows.length === 0) {
			return Promise.reject({
				status: 404,
				message: 'Not Found',
			});
		} else {
			const updateArticle = () => {
				const updateQueryStr = `UPDATE articles
										SET votes = $1
										WHERE article_id = $2 
										RETURNING *;`;
				return db.query(updateQueryStr, [votes, article_id]);
			};

			return updateArticle().then((result) => {
				return result.rows[0];
			});
		}
	});
};

exports.removeCommentById = (comment_id) => {
	if (isNaN(comment_id)) {
		return Promise.reject({
			status: 400,
			message: 'Bad Request',
		});
	}
	return db
		.query('DELETE FROM comments WHERE comment_id = $1 RETURNING *;', [
			comment_id,
		])
		.then((result) => {
			if (result.rows.length === 0) {
				return Promise.reject({
					status: 404,
					message: 'Not Found',
				});
			} else {
				return result.rows[0];
			}
		});
};
