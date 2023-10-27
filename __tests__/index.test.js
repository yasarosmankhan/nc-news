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
					comment_count: expect.any(String),
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
	test('PATCH:200 update the article and send back the result to the client ', () => {
		const votes = { inc_votes: 1 };
		return request(app)
			.patch('/api/articles/13')
			.send(votes)
			.expect(200)
			.then(({ body }) => {
				expect(body.article).toMatchObject({
					article_id: 13,
					title: 'Another article about Mitch',
					topic: 'mitch',
					author: 'butter_bridge',
					body: 'There will never be enough articles about Mitch!',
					votes: 1,
				});
			});
	});
	test('PATCH:200 update the article and ignores the unnecessary properties sent in votes object ', () => {
		const votes = { inc_votes: 1, test: 'test', test1: 'test1' };
		return request(app)
			.patch('/api/articles/13')
			.send(votes)
			.expect(200)
			.then(({ body }) => {
				expect(body.article).toMatchObject({
					article_id: 13,
					title: 'Another article about Mitch',
					topic: 'mitch',
					author: 'butter_bridge',
					body: 'There will never be enough articles about Mitch!',
					votes: 1,
				});
			});
	});
	test('PATCH:404 responds with an appropriate status and error message when attempting to post a comment to a non-existent article', () => {
		const votes = { inc_votes: 1 };
		return request(app)
			.patch('/api/articles/9999')
			.send(votes)
			.expect(404)
			.then(({ body }) => {
				expect(body.message).toBe('Not Found');
			});
	});
	test('PATCH:400 responds with an appropriate status and error message when attempting to post a comment to a invalid id', () => {
		const votes = { inc_votes: 1 };
		return request(app)
			.patch('/api/articles/invalid-id')
			.send(votes)
			.expect(400)
			.then(({ body }) => {
				expect(body.message).toBe('Bad Request');
			});
	});
	test('PATCH:400 responds with an appropriate status and error message if votes are not a number', () => {
		const votes = { inc_votes: 'NaN' };
		return request(app)
			.patch('/api/articles/13')
			.send(votes)
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

	test('allows the client to change the sort order to ascending', () => {
		return request(app)
			.get('/api/articles?sortby=created_at&order=asc')
			.then(({ body }) => {
				expect(body.articles).toBeSorted('created_at', {
					ascending: true,
				});
			});
	});

	test('allows the client to change the sort order to descending', () => {
		return request(app)
			.get('/api/articles?sortby=votes&order=desc')
			.then(({ body }) => {
				expect(body.articles).toBeSorted('votes', {
					descending: true,
				});
			});
	});

	test('allows the client to change the sort order to descending', () => {
		return request(app)
			.get('/api/articles?sortby=comment_count&order=desc')
			.then(({ body }) => {
				expect(body.articles).toBeSorted('comment_count', {
					descending: true,
				});
			});
	});

	test('allows the client to change the sort order to ascending', () => {
		return request(app)
			.get('/api/articles?sortby=comment_count&order=asc')
			.then(({ body }) => {
				expect(body.articles).toBeSorted('comment_count', {
					ascending: true,
				});
			});
	});

	test('GET:400 sends an appropriate status and error message when given an invalid sortby', () => {
		return request(app)
			.get('/api/articles?sortby=invalid-sort-by')
			.expect(400)
			.then(({ body }) => {
				expect(body.message).toBe('Bad Request');
			});
	});

	test('GET:400 sends an appropriate status and error message when given an invalid order', () => {
		return request(app)
			.get('/api/articles?order=invalid-order')
			.expect(400)
			.then(({ body }) => {
				expect(body.message).toBe('Bad Request');
			});
	});
	test('GET:200 when the topic is valid should filters the articles by the topic value specified in the query ', () => {
		return request(app)
			.get('/api/articles?topic=cats')
			.expect(200)
			.then(({ body }) => {
				expect(body.articles.length).toBe(1);
				expect(body.articles).toBeSortedBy('topic');
			});
	});

	test('GET:200 when the topic is valid but there are no assocaited articles', () => {
		return request(app)
			.get('/api/articles?topic=paper')
			.expect(200)
			.then(({ body }) => {
				expect(body.articles.length).toBe(0);
			});
	});

	test('GET:400 sends an appropriate status and error message when given an invalid filter', () => {
		return request(app)
			.get('/api/articles?topic=invalid-filter')
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
					body: 'Maybe I am not a rabbit',
					author: 'rogersop',
				});
			});
	});
	test('POST:404 responds with an appropriate status and error message when provided with invalid id', () => {
		const newComment = {
			username: 'rogersop',
			body: 'This is a test comment',
		};
		return request(app)
			.post('/api/articles/999/comments')
			.send(newComment)
			.expect(404)
			.then(({ body }) => {
				expect(body.message).toBe('Not Found');
			});
	});
	test('POST:404 responds with an appropriate status and error message when provided with invalid username', () => {
		const newComment = {
			username: 'invalid-username',
			body: 'Maybe I am not a rabbit',
		};
		return request(app)
			.post('/api/articles/2/comments')
			.send(newComment)
			.expect(404)
			.then(({ body }) => {
				expect(body.message).toBe('Not Found');
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
	test('POST:400 responds with an appropriate status and error message when provided with an empty comment body', () => {
		const newComment = {
			username: 'rogersop',
			body: '',
		};
		return request(app)
			.post('/api/articles/2/comments')
			.send(newComment)
			.expect(400)
			.then(({ body }) => {
				expect(body.message).toBe('Bad Request');
			});
	});

	test('POST:404 responds with an appropriate status and error message when attempting to post a comment to a non-existent article', () => {
		const newComment = {
			username: 'rogersop',
			body: 'This is a comment on a non-existent article',
		};
		return request(app)
			.post('/api/articles/9999/comments')
			.send(newComment)
			.expect(404)
			.then(({ body }) => {
				expect(body.message).toBe('Not Found');
			});
	});
});

describe('/api/comments/:comment_id', () => {
	test('DELETE:204 deletes the specified comment and sends no body back', () => {
		return request(app).delete('/api/comments/13').expect(204);
	});
	test('DELETE:404 responds with an appropriate status and error message when given a non-existent id', () => {
		return request(app)
			.delete('/api/comments/999')
			.expect(404)
			.then(({ body }) => {
				expect(body.message).toBe('Not Found');
			});
	});
	test('DELETE:400 responds with an appropriate status and error message when given an invalid id', () => {
		return request(app)
			.delete('/api/comments/invalid-id')
			.expect(400)
			.then(({ body }) => {
				expect(body.message).toBe('Bad Request');
			});
	});
});

describe('/api/users', () => {
	test('GET:200 return an array of users of the correct format', () => {
		return request(app)
			.get('/api/users')
			.expect(200)
			.then(({ body }) => {
				expect(body.users.length).toBe(4);
				body.users.forEach((user) => {
					expect(user).toMatchObject({
						username: expect.any(String),
						name: expect.any(String),
						avatar_url: expect.any(String),
					});
				});
			});
	});
});
