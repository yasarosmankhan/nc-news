const fs = require('fs/promises');
const { selectTopics } = require('../models/topic.models');

exports.getTopics = (req, res, next) => {
	selectTopics()
		.then((topics) => {
			res.status(200).send({ topic: topics });
		})
		.catch((err) => {
			next(err);
		});
};

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
