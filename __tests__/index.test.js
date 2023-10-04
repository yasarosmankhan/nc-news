const app = require('../app');
const request = require('supertest');
const db = require('../db/connection');
const seed = require('../db/seeds/seed');
const data = require('../db/data/test-data/index');

beforeEach(() => seed(data));
afterAll(() => db.end());

describe('/api/topics', () => {
	test('GET:200 return an array of topics of the correct format', () => {
		return request(app)
			.get('/api/topics')
			.expect(200)
			.then(({ body }) => {
				expect(body.topics.length).toBe(3);
				body.topics.forEach((topic) => {
					expect(topic).toMatchObject({
						slug: expect.any(String),
						description: expect.any(String),
					});
				});
			});
	});
});

describe('/api/invalid-path', () => {
	test('GET:404 returns no content message', () => {
		return request(app)
			.get('/api/invalid-path')
			.expect(404)
			.then(({ body }) => {
				expect(body.message).toBe('Wrong Path!');
			});
	});
});

describe('/api endpoints', () => {
	test('should return an object describing all the available endpoints', () => {
		return request(app)
			.get('/api')
			.expect(200)
			.then(({ body }) => {
				const endpointsObj = body.endpoints;
				for (const [endpoint, key] of Object.entries(endpointsObj)) {
					expect(key.description).toEqual(expect.any(String));
					if (key.queries !== undefined) {
						expect(key.queries).toEqual(expect.any(Array));
					}
					if (key.exampleResponse !== undefined) {
						expect(key.exampleResponse).toEqual(expect.any(Object));
					}
				}
			});
	});
});

describe('/api/articles/:article_id', () => {
	test('GET:200 sends a single article to the client', () => {
		return request(app)
			.get('/api/articles/1')
			.expect(200)
			.then(({ body }) => {
				expect(body.article).toMatchObject({
					article_id: 1,
					title: expect.any(String),
					topic: expect.any(String),
					author: expect.any(String),
					body: expect.any(String),
					created_at: expect.any(String),
					votes: expect.any(Number),
					article_img_url: expect.any(String),
				});
			});
	});
	test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
		return request(app)
			.get('/api/articles/999')
			.expect(404)
			.then(({ body }) => {
				expect(body.message).toBe('Not Found');
			});
	});
	test('GET:400 sends an appropriate status and error message when given an invalid id', () => {
		return request(app)
			.get('/api/articles/not-an-article')
			.expect(400)
			.then(({ body }) => {
				expect(body.message).toBe('Bad Request');
			});
	});
});

describe('/api/articles', () => {
	test('should return articles object with all articles', () => {
		return request(app)
			.get('/api/articles')
			.then(({ body }) => {
				expect(body.articles.length).toBe(13);
				body.articles.forEach((article) => {
					expect(article).toMatchObject({
						article_id: expect.any(Number),
						title: expect.any(String),
						topic: expect.any(String),
						author: expect.any(String),
						created_at: expect.any(String),
						votes: expect.any(Number),
						article_img_url: expect.any(String),
						comment_count: expect.any(String),
					});
				});
				expect(body.articles.body).toBeUndefined();
			});
	});

	test('allows the client to change the sort order to descending', () => {
		return request(app)
			.get('/api/articles?sortby=created_at&order=desc')
			.then(({ body }) => {
				expect(body.articles).toBeSorted('created_at', {
					descending: true,
				});
			});
	});

	test('GET:404 sends an appropriate status and error message when given an invalid sortby', () => {
		return request(app)
			.get('/api/articles?sortby=invalid-sort-by')
			.expect(404)
			.then(({ body }) => {
				expect(body.message).toBe('Not Found');
			});
	});

	test('GET:400 sends an appropriate status and error message when given an invalid sortby', () => {
		return request(app)
			.get('/api/articles?order=invalid-order')
			.expect(400)
			.then(({ body }) => {
				expect(body.message).toBe('Bad Request');
			});
	});
});

describe('/api/articles/:article_id/comments', () => {
	test('GET:200 sends an array of comments belonging to a single article to the client', () => {
		return request(app)
			.get('/api/articles/1/comments')
			.expect(200)
			.then(({ body }) => {
				expect(body.comments.length).toBe(11);
				body.comments.forEach((comment) => {
					expect(comment).toMatchObject({
						comment_id: expect.any(Number),
						body: expect.any(String),
						article_id: 1,
						author: expect.any(String),
						votes: expect.any(Number),
						created_at: expect.any(String),
					});
				});
			});
	});
	test('GET:200 sends an empty array of comments if the id is valid, but there are no comments associated with the article', () => {
		return request(app)
			.get('/api/articles/2/comments')
			.expect(200)
			.then(({ body }) => {
				expect(body.comments).toEqual([]);
			});
	});
	test('allows the client to change sortby created_at', () => {
		return request(app)
			.get('/api/articles/1/comments')
			.then(({ body }) => {
				expect(body.comments).toBeSortedBy('created_at');
			});
	});
	test('GET:404 sends an appropriate status and error message when given a valid but non-existent id', () => {
		return request(app)
			.get('/api/articles/999/comments')
			.expect(404)
			.then(({ body }) => {
				expect(body.message).toBe('Not Found');
			});
	});
	test('GET:400 responds with an appropriate error message when given an invalid id', () => {
		return request(app)
			.get('/api/articles/not-an-id/comments')
			.expect(400)
			.then(({ body }) => {
				expect(body.message).toBe('Bad Request');
			});
	});
	test('POST:201 post a new comment and sends the new comment back to the client', () => {
		const newComment = {
			username: 'rogersop',
			body: 'Maybe I am not a rabbit',
		};
		return request(app)
			.post('/api/articles/2/comments')
			.send(newComment)
			.expect(201)
			.then(({ body }) => {
				expect(body.comment).toMatchObject({
					comment_id: 19,
					body: 'Maybe I am not a rabbit',
					article_id: 2,
					author: 'rogersop',
					votes: 0,
				});
			});
	});
	test('POST:400 responds with an appropriate status and error message when provided with incomplete info', () => {
		const newComment = {
			body: 'Maybe I am not a rabbit',
		};
		return request(app)
			.post('/api/articles/2/comments')
			.send(newComment)
			.expect(400)
			.then(({ body }) => {
				expect(body.message).toBe('Bad Request');
			});
	});
});
