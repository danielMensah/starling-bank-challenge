const axios = require('axios');
const uuid = require('uuid/v4');

const accessToken = 'eyJhbGciOiJQUzI1NiIsInppcCI6IkdaSVAifQ.H4sIAAAAAAAAAH1TSZLcIBD8yoTOUxNaW8vNN3_ADyig6CZaAgWgticc_ruR0NJqT_imzKxKsij0O1HOJV2CowJBg_lwHm2v9JWhvn9wMyTviZtYqCguVVulWALlQkApsAEm6xIaWdc5q-o2JxGK6deYdFnVVHnZXNLiPVHoI5Fd8nwmkHMzaf_d9ILsDyUWb5ZVZRHMKJNQFlUNrK0zyJBY1hCXl4oFb2_upGNHniK2rCxB5sihpJIAy_wCRdM2PGVpLqgKHWGsb5yTc7FLCJmmad2CkFkKZZZKaGWFYSRWFVWFEov5HMfNSPOlxKRwW6KCxoE6SyjeXgT_Ob4ISpD2SiqyZ75Xzp-YFQhhQ8iOhPI7iIr3yG8D7ZUH_mmVpzec_M1Y5cLKQGmhHkpM2Mdihj1qvkbjaAVwo701fTxoZlbNaKnsgF4ZDUaCnLRwu-T20zcQj-aT82bYRqQB1Wo8oBboqRPUU6jb4FI2oL2Tn9OOliRZCgHd_6R4VtTGHjmFMT1d7RL2ufFfcW0ly2-4jTCQx5AGOx7goq54ST7iJ9EmRbAOEcFRBGrA6zpT1LZPYFN_77a90EEdthEfzhHvBr3hYYVP5QsBZt7lK7t2WSNVv4WKKU_UUmWJkxr9CbizFK_M4SOswcHVHDlO3Br9xC0-zwx4i9qFRX5lcYhfeB1iNPXhBc3vwljx5HZmN5szu_V7mv8Z4O7xSo1CrtTEHLfhEvZ3taRAvhDLnT4Tc0Xy5y-W48u_QAUAAA.WxwpnATPo6n0cl4YucRwrAqj9LF-GTDceXvECHBJars7C54UHMTOhfDY__KUTK0QJmeHqTapUoJKfb7-eDivtzRH8lFZYoAgJNoh_9TRjeEs6TPnx6nYxI6g7FInjY5gK9EC__X7lJiqZaCNKIJth9eS8s2hTWFkzsWOKOd_sGapY61TBA5enHU45vbuDB1ns-q1NJA07xUceFjNUSPgo0tUpOLdjLfPbAtqBXcJf0cGERSctfaOeT9R4dbjnxslbqW1tLVIYySvGWdNWSza7F6Y6vG6wHT8VcEaq8TJfJchZlvuZb5fqnmaK0iX569u3KO8re1rm8pdSFJzsKs36Kjsddp52DWsP9XBhvfiGhY8PDm3gQit2O0sEt9hDbC7P5QSn1hGFKwNEYE0UlvFYd7PR8Eifmyb-RsHMGQ21t00OCLPdF7pTtLz8djAvqBQjMFvXZr_9N8UrN_fKWKUiM-mIvKngEu_H6eVQDdgnF69HNd-EAAD6E155bzS76uux6GHvRDPyUI7ETyIQtx8D77PW1ZMzu1Fv3d03gkOlYYzOq06HWKdDBS3GFG0We7UiHHRe9wMbrr8F0jTyvBYkJIvkWXntH9wiXcJcbTxufBuQCPsRG1HqurK1Qy7P_hw9G794yk_P80Tl84kzD7VcdLJNjS3BbxratriKm2If9M';
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
