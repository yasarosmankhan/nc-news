const db = require('../db/connection');

exports.selectUsers = () => {
	return db.query('SELECT * FROM users;').then((result) => {
		if (result.rows.length === 0) {
			return Promise.reject({ status: 404, message: 'Not Found' });
		}
		return result.rows;
	});
};
