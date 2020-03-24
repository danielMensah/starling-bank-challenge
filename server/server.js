const express = require('express');
const app = express();
const axios = require('axios');
const uuid = require('uuid/v4');
const bodyParser = require('body-parser');
const port = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const accessToken = 'eyJhbGciOiJQUzI1NiIsInppcCI6IkdaSVAifQ.H4sIAAAAAAAAAH1Ty5KbMBD8lS3OO1tgkDHccssP5ANG0shWGSRKEk62Uvn3CMTDOFu5uOjumVaPRv6dae-zNsNBg6TefviArtPmytHcP4Tts_fMjzxWlGfWsBwroJOUUEm8AFd1BRdV1yfO6uZEMhbTryFrC3Zhxbmom-o90xgSkdesnAgUwo4mfLedJPdDy9mbF6wqoxkVCqqS1cCbuoACiRcXEurMePQO9k4mdRQ8L8sTVXBuFEGlFIdLJeJPzgtVSslE0cSOONY3Icj71CWlyvO8bkCqIoeqyBU0imEcibOSMVRYTud4YQeaLiUlhdscFQz21DpC-fYihM_hRdCSTNBKkzvynfbhwCxAShdDtiR12EBSQkBx62mr3PFPpwO94Rhu1mkfVwbaSP3QcsQuFXPs0IglmkAnQVgTnO3SQROzaNYo7XoM2hqwCtRopN8kv52-gnS0GH2w_Toi9agX4x6NxECtpI5i3Qrnsh7dncKUdnCkyFEM6P8npbOSNnQoKI4Z6OrmsM-N_4pLKzlxw3WEngLGNNiKCGd1wXPyAT-JVimBZYgE9iLQPV6XmZK2fgIfu3u77oV2ardNeHdOeDPorIgrfCqfCbDTLl_ZpctZpbs1VEp5oOYqR4L0EA7AH6V0ZR4fcQ0ernbPceCW6Adu9nlmIDg0Pi7yK4td_MJrF5NpiC9oehfWySe3I7vaHNm1P9D0nwHhH6_UINVCjdwLFy9he1dzChQzMd_pMzFVZH_-Auzf7PtABQAA.TA63TaR9lu_r6PfCQqL9HcJVC_-aiF1nK3JTEIyqOvMCAs841G4ZK6VQcqyKhgWDop8f4GwgPFnbV3wsdsUYKEL5_NIOiBDJGhngcCPjRaadyZGcPZXb7vWs3wQrXN8YAbw8Jm0WNwzzfypEviQvrA0cuJnM7S7YboDYWLJ4nl9OukBOCv0IL9wIFYKpfS5aDEpnoOlEmue8bq9f2fi0E8GKEPVFTumNnvKSaP5iqsZ5y1rQiKi-X-yDilRYsNDTW2jGaee-8f0TyQQoMRZa_LgWggqtP3_AQMmONdceCvBBwYzSjO9uDGdiRiAXcCXCqHRia-BHtezqkG2JjVXTlRNYi6egKEFp5IUPrgbeXuI5a4idiPo22nwo32Gqj-NQWkGBteKf4eNKtUCjBs0PwEJwRwu5C2dQLPLwc6hXbO94ItjIyxiO_nTRKqQp27vM8R9ye327QdtHmfKyTKh3njDauqIJFPXPTQcvoQW5IcOgK-VVRGChPc24ALh2srnQaUwQPM0SBzBgDTWMK3MES5IhxvFcVV0NvngqZ1iENAzfze9dDWdaLN4VOjzSEgedi0jDLpnfXbis-FV5SWisAILfLJj_X_NNOqlnEBPTnvZFUwzIOZlcuWV5cLW2ZvM9AjPEYH7rDv5fWQbQrxd18aj_GtfDBYbkD5EFpxIX83w';
const baseURL = ' https://api-sandbox.starlingbank.com/';
const headers = {
	'Authorization': 'Bearer ' + accessToken,
	'Accept': 'application/json',
	'Access-Control-Allow-Origin': '*',
	'User-Agent': 'Daniel Mensah'
};

app.use(function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

app.get('/api/v2/accounts', async (req, res) => {
	const data = await axios.get(baseURL + 'api/v2/accounts', { headers });
	res.json(data.data.accounts);
});

app.get('/api/v2/transactions', async (req, res) => {
	const { accountUid, categoryUid, from, to } = req.query;

	let data = await axios.get(baseURL + `api/v2/feed/account/${accountUid}/category/${categoryUid}/transactions-between`, {
		headers,
		params: {
			minTransactionTimestamp: from,
			maxTransactionTimestamp: to,
		}
	}).catch(e => console.log(e));

	// only get outgoing transactions excluding transactions made in savings accounts.
	data = data.data.feedItems.filter(item => item.direction === 'OUT' && item.spendingCategory !== 'SAVING');

	// formatting amounts from minorUnits to readable format.
	data = data.map(item => ({...item, amount: {...item.amount, minorUnits: (item.amount.minorUnits/100).toFixed(2)}}));
	res.json(data);
});

app.post('/api/v2/savings-goals/add-money', async (req, res) => {
	const { accountUid, savingsGoalUid, params } = req.body;
	const transferUid = uuid();
	const data = await axios.put(baseURL + `api/v2/account/${accountUid}/savings-goals/${savingsGoalUid}/add-money/${transferUid}`, params, { headers });
	res.json(data.data);
});

app.get('/api/v2/savings-goals', async (req, res) => {
	const { accountUid } = req.query;
	const data = await axios.get(baseURL + `api/v2/account/${accountUid}/savings-goals`, { headers });
	res.json(data.data);
});

app.listen(port, () => {
	console.log(`Listening on: http://localhost:${port}/`);
});
