exports.handleCustomErrors = (err, req, res, next) => {
	if (err.status) {
		res.status(err.status).send({ message: err.message });
	}
	next(err);
};

exports.handle500Errors = (err, req, res, next) => {
	res.status(500).send({ message: 'Internal Server Error' });
	next(err);
};

exports.handleWrongPathErrors = (req, res, next) => {
	res.status(404).send({ message: 'Wrong Path!' });
};
