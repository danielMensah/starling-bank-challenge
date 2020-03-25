const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const port = 8100;
const StarlingUtils = require('./StarlingUtils');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

const starlingUtils = new StarlingUtils();

app.get('/api/v2/accounts', async (req, res) => {
	const accounts = await starlingUtils.getAccounts();
	if (accounts.error) return res.status(accounts.status).json(accounts);

	res.status(200).json(accounts);
});

app.get('/api/v2/transactions', async (req, res) => {
	const { accountUid, categoryUid, from, to } = req.query;

	const transactions = await starlingUtils.getTransactions(accountUid, categoryUid, from, to);
	if (transactions.error) return res.status(transactions.status).json(transactions);

	res.status(200).json(transactions);
});

app.get('/api/v2/savings-goals', async (req, res) => {
	const { accountUid } = req.query;

	const savingsGoals = await starlingUtils.getSavingsGoals(accountUid);
	if (savingsGoals.error) return res.status(savingsGoals.status).json(savingsGoals);

	res.status(200).json(savingsGoals);
});

app.post('/api/v2/savings-goals/add-money', async (req, res) => {
	const { accountUid, savingsGoalUid, params } = req.body;

	const response = await starlingUtils.addMoneyToSavingsGoals(accountUid, savingsGoalUid, params);
	if (response.error) return res.status(response.status).json(response);

	res.status(200).json(response);
});

app.listen(port, () => {
	console.log(`Listening on: http://localhost:${port}/`);
});

module.exports = app;
