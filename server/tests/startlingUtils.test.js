const app = require('../server');
const supertest = require('supertest');
const request = supertest(app);
const StarlingUtils = require('../StarlingUtils');

const starlingUtils = new StarlingUtils();
const accountUid = '6d24eed7-38f8-4574-af77-52278f30cfb9';
const savingsGoalUid = 'd1674298-4098-4a1a-baf8-170b9c24a0e2';

it('test that app can get accounts', async done => {
	const response = await request.get('/api/v2/accounts');
	expect(response.status).toBe(200);
	done()
});

describe('Test transactions', () => {
	it('test that app can get transactions given an accountUid', async () => {
		const response = await request.get('/api/v2/transactions')
			.query({
				accountUid,
				categoryUid: 'aac7be8f-2564-4024-bb36-f157980b1343',
				from: '2020-03-24T00:00:00.000Z',
				to: '2020-03-25T00:00:00.000Z'
			});
		expect(response.status).toBe(200);
	});

	it('test that app throws 404 error when getting transactions without an accountUid', async done => {
		const response = await request.get('/api/v2/transactions');
		expect(response.status).toBe(404);
		done()
	});
});

describe('Test savings goals', () => {
	it('test that app can get savings goals given an accountUid', async () => {
		const response = await request.get('/api/v2/savings-goals')
			.query({ accountUid });
		expect(response.status).toBe(200);
	});

	it('test that app throws 404 error when getting savings goals without an accountUid', async () => {
		const response = await request.get('/api/v2/savings-goals');
		expect(response.status).toBe(404);
	});

	it('test that app can add amount to savings goals', async () => {
		const params = {
			amount: {
				currency: "GBP",
				minorUnits: 100
			}
		};

		const response = await request.post('/api/v2/savings-goals/add-money')
			.send({ accountUid, savingsGoalUid, params });

		console.log(response);
		expect(response.status).toBe(200);

		await starlingUtils.withdrawMoneyToSavingsGoals(accountUid, savingsGoalUid, params)
	});
});
