const fs = require('fs/promises');

exports.getEndPoints = (req, res, next) => {
	fs.readFile('endpoints.json', 'utf-8')
		.then((result) => {
			const endpoint = JSON.parse(result);
			res.status(200).send({ endpoints: endpoint });
		})
		.catch((err) => {
			next(err);
		});
};
