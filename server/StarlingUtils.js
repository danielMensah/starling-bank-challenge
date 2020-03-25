const axios = require('axios');
const uuid = require('uuid/v4');

const accessToken = 'eyJhbGciOiJQUzI1NiIsInppcCI6IkdaSVAifQ.H4sIAAAAAAAAAH1Ty5KbMBD8lS3OO1tgkDHccssP5ANG0shWGSRKEk62Uvn3CMTDOFu5uOjumVaPRv6dae-zNsNBg6TefviArtPmytHcP4Tts_fMjzxWlGfWsBwroJOUUEm8AFd1BRdV1yfO6uZEMhbTryFrC3Zhxbmom-o90xgSkdesnAgUwo4mfLedJPdDy9mbF6wqoxkVCqqS1cCbuoACiRcXEurMePQO9k4mdRQ8L8sTVXBuFEGlFIdLJeJPzgtVSslE0cSOONY3Icj71CWlyvO8bkCqIoeqyBU0imEcibOSMVRYTud4YQeaLiUlhdscFQz21DpC-fYihM_hRdCSTNBKkzvynfbhwCxAShdDtiR12EBSQkBx62mr3PFPpwO94Rhu1mkfVwbaSP3QcsQuFXPs0IglmkAnQVgTnO3SQROzaNYo7XoM2hqwCtRopN8kv52-gnS0GH2w_Toi9agX4x6NxECtpI5i3Qrnsh7dncKUdnCkyFEM6P8npbOSNnQoKI4Z6OrmsM-N_4pLKzlxw3WEngLGNNiKCGd1wXPyAT-JVimBZYgE9iLQPV6XmZK2fgIfu3u77oV2ardNeHdOeDPorIgrfCqfCbDTLl_ZpctZpbs1VEp5oOYqR4L0EA7AH6V0ZR4fcQ0ernbPceCW6Adu9nlmIDg0Pi7yK4td_MJrF5NpiC9oehfWySe3I7vaHNm1P9D0nwHhH6_UINVCjdwLFy9he1dzChQzMd_pMzFVZH_-Auzf7PtABQAA.TA63TaR9lu_r6PfCQqL9HcJVC_-aiF1nK3JTEIyqOvMCAs841G4ZK6VQcqyKhgWDop8f4GwgPFnbV3wsdsUYKEL5_NIOiBDJGhngcCPjRaadyZGcPZXb7vWs3wQrXN8YAbw8Jm0WNwzzfypEviQvrA0cuJnM7S7YboDYWLJ4nl9OukBOCv0IL9wIFYKpfS5aDEpnoOlEmue8bq9f2fi0E8GKEPVFTumNnvKSaP5iqsZ5y1rQiKi-X-yDilRYsNDTW2jGaee-8f0TyQQoMRZa_LgWggqtP3_AQMmONdceCvBBwYzSjO9uDGdiRiAXcCXCqHRia-BHtezqkG2JjVXTlRNYi6egKEFp5IUPrgbeXuI5a4idiPo22nwo32Gqj-NQWkGBteKf4eNKtUCjBs0PwEJwRwu5C2dQLPLwc6hXbO94ItjIyxiO_nTRKqQp27vM8R9ye327QdtHmfKyTKh3njDauqIJFPXPTQcvoQW5IcOgK-VVRGChPc24ALh2srnQaUwQPM0SBzBgDTWMK3MES5IhxvFcVV0NvngqZ1iENAzfze9dDWdaLN4VOjzSEgedi0jDLpnfXbis-FV5SWisAILfLJj_X_NNOqlnEBPTnvZFUwzIOZlcuWV5cLW2ZvM9AjPEYH7rDv5fWQbQrxd18aj_GtfDBYbkD5EFpxIX83w';
const baseURL = ' https://api-sandbox.starlingbank.com/';
const headers = {
	'Authorization': 'Bearer ' + accessToken,
	'Accept': 'application/json',
	'Access-Control-Allow-Origin': '*',
	'User-Agent': 'Daniel Mensah'
};

class StarlingUtils {

	async getAccounts() {
		const [ err, accounts ] = await to(axios.get(baseURL + 'api/v2/accounts', { headers }));
		if (err) return { error: true, status: err.response.status, statusText: err.response.statusText };

		return accounts.data.accounts;
	}

	async getTransactions(accountUid, categoryUid, minTransactionTimestamp, maxTransactionTimestamp) {
		let [ err, transactions ] = await to(axios.get(baseURL + `api/v2/feed/account/${accountUid}/category/${categoryUid}/transactions-between`, {
			headers,
			params: { minTransactionTimestamp, maxTransactionTimestamp }
		}));

		if (err) return { error: true, status: err.response.status, statusText: err.response.statusText };

		transactions = transactions.data.feedItems.filter(item => item.direction === 'OUT' && item.spendingCategory !== 'SAVING');
		transactions = transactions.map(item => ({
			...item,
			amount: { ...item.amount, minorUnits: (item.amount.minorUnits / 100).toFixed(2) }
		}));

		return transactions;
	};

	async getSavingsGoals(accountUid) {
		const [ err, savingsGoals ] = await to(axios.get(baseURL + `api/v2/account/${accountUid}/savings-goals`, { headers }));
		if (err) return { error: true, status: err.response.status, statusText: err.response.statusText };

		return savingsGoals.data.savingsGoalList;
	}

	async addMoneyToSavingsGoals(accountUid, savingsGoalUid, params) {
		const transferUid = uuid();
		const [ err, response ] = await to(axios.put(baseURL + `api/v2/account/${accountUid}/savings-goals/${savingsGoalUid}/add-money/${transferUid}`, params, { headers }));
		if (err) return { error: true, status: err.response.status, statusText: err.response.statusText };

		return response.data;
	}

	async withdrawMoneyToSavingsGoals(accountUid, savingsGoalUid, params) {
		const transferUid = uuid();
		const [ err, response ] = await to(axios.put(baseURL + `api/v2/account/${accountUid}/savings-goals/${savingsGoalUid}/withdraw-money/${transferUid}`, params, { headers }));
		if (err) return { error: true, status: err.response.status, statusText: err.response.statusText };

		return response.data;
	}
}

function to(promise) {
	return promise.then(data => [ null, data ])
		.catch(error => [ error ])
}

module.exports = StarlingUtils;
