import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as moment from 'moment';
import './App.css';

const baseURL = 'http://localhost:8100/';

const tableStyles = { margin: '0 auto' };
const tdStyles = {	paddingLeft: 10,	paddingRight: 10 };

const App = () => {
	const [ accountList, setAccountList ] = useState([]);
	const [ selectedSaving, setSaving ] = useState(null);
	const [ selectedAccount, setAccount ] = useState(null);
	const [ savingsGoals, setSavingsGoals ] = useState([]);
	const [ transactions, setTransactions ] = useState([]);
	const [ roundedAmount, setRoundedAmount ] = useState(0);
	const [ calendarStart, setCalendarStart ] = useState(moment().subtract(6, 'days').format('YYYY-MM-DD'));
	const [ calendarEnd, setCalendarEnd ] = useState(moment().format('YYYY-MM-DD'));

	// fetching accounts on component mount
	useEffect(() => {
		axios.get(baseURL + 'api/v2/accounts').then(details => setAccountList(details.data));
	}, []);

	useEffect(() => {
		if (selectedAccount) {
			getSavingsGoals();
		}
	}, [ selectedAccount ]);

	const handleGetTransactions = (account) => {
		setAccount(account);

		const params = {
			accountUid: account.accountUid,
			categoryUid: account.defaultCategory,
			from: moment(calendarStart).toISOString(),
			to: moment(calendarEnd).add(1, 'days').toISOString()
		};

		axios.get(baseURL + 'api/v2/transactions', { params })
			.then(transactions => setTransactions(transactions.data));
	};

	const handleRound = () => {
		let amount = transactions.map(tran => +(Math.ceil(tran.amount.minorUnits) - tran.amount.minorUnits));
		amount = amount.reduce((acc, num) => acc + num, 0).toFixed(2);
		setRoundedAmount(amount);
	};

	const handleRoundedAmountTransfer = () => {
		axios.post(baseURL + 'api/v2/savings-goals/add-money', {
			accountUid: selectedAccount.accountUid,
			savingsGoalUid: selectedSaving.savingsGoalUid,
			params: {
				amount: {
					currency: "GBP",
					minorUnits: roundedAmount * 100
				}
			}
		})
			.then(() => getSavingsGoals());
	};

	const getSavingsGoals = () => {
		const params = {
			accountUid: selectedAccount.accountUid
		};

		axios.get(baseURL + 'api/v2/savings-goals', { params }).then(savingsGoals => setSavingsGoals(savingsGoals.data))
	};

	return (
		<div className="App">
			<br/>
			<div>
				<div><b>Select dates</b></div>
				<input type="date" id="start" name="transaction-start"
				       onChange={(e) => setCalendarStart(e.target.value)}
				       value={calendarStart}/>
				<input type="date" id="end" name="transaction-end"
				       min={calendarStart}
				       onChange={(e) => setCalendarEnd(e.target.value)}
				       value={calendarEnd}/>
			</div>
			<br/>
			{accountList.length ? accountList.map((account, index) => {
				return <div key={index}>
					Account {index + 1} <button onClick={() => handleGetTransactions(account)}>Get transactions</button>
				</div>
			}) : 'There are no accounts available'}
			{transactions.length ? <div>
				<br/>
				<b>Transactions</b>
			</div> : ''}
			<div>
				{transactions.length ?
					(
						<table style={tableStyles}>
							<thead>
							<tr>
								<th>Date</th>
								<th>Reference</th>
								<th>Amount</th>
							</tr>
							</thead>
							<tbody>
							{
								transactions.map(trans => {
									return (
										<tr key={trans.feedItemUid}>
											<td style={tdStyles}>{moment(trans.transactionTime).format('DD/MM/YYYY HH:mm')}</td>
											<td style={tdStyles}>{trans.reference}</td>
											<td style={tdStyles}>£{trans.amount.minorUnits}</td>
										</tr>
									)
								})
							}
							</tbody>
						</table>) : ''
				}
			</div>
			<br/>
			{
				transactions.length ?
					<div>
						<div><b>Round amount: </b>{roundedAmount ? '£' + roundedAmount : ''}</div>
						<button onClick={() => handleRound()}>
							Round up
						</button><br/>
						<button disabled={!selectedSaving} onClick={() => handleRoundedAmountTransfer()}>
							{selectedSaving ? `Transfer to '${selectedSaving.name}' Savings Goals` : 'Select Savings Goals'}
						</button>
					</div> : (accountList.length ? 'There are no transactions' : '')
			}
			<br/>
			{savingsGoals.length ? <div><b>Savings Goals</b></div> : ''}
			{
				savingsGoals.map(goal => {
					return (
						<div key={goal.savingsGoalUid}>
							<input type="checkbox" name="vehicle1" value={goal.savingsGoalUid} onChange={() => setSaving(goal)}/>
							<label htmlFor={goal.savingsGoalUid}>{goal.name} - target: {goal.target.minorUnits / 100} - total
								saved: {goal.totalSaved.minorUnits / 100}</label>
						</div>
					)
				})
			}
			<br/>
		</div>
	);
};

export default App;
