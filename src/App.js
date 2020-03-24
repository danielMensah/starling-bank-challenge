import React, { useState, useEffect } from 'react';
import axios from 'axios';
import * as moment from 'moment';
import './App.css';

const baseURL = 'http://localhost:8000/';

const App = () => {
	const [ accountDetails, setAccountDetails ] = useState([]);
	const [ selectedAccount, setSelectedAccount ] = useState(null);
	const [ selectedSavingsGoals ] = useState('d1674298-4098-4a1a-baf8-170b9c24a0e2');
	const [ transactions, setTransactions ] = useState([]);
	const [ roundedAmount, setRoundedAmount ] = useState(0);
	const [ calendarStart, setCalendarStart ] = useState(moment().subtract(6, 'days').format('YYYY-MM-DD'));
	const [ calendarEnd, setCalendarEnd ] = useState(moment().format('YYYY-MM-DD'));

	// fetching accounts on component mount
	useEffect(() => {
		axios.get(baseURL + 'api/v2/accounts').then(details => setAccountDetails(details.data));
	}, []);

	const handleGetTransactions = (account) => {
		setSelectedAccount(account);

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
		let amount = transactions.map(tran => +(Math.ceil(tran.amount.minorUnits) - tran.amount.minorUnits).toFixed(2));
		amount = amount.reduce((acc, num) => acc + num, 0);
		setRoundedAmount(amount);
	};

	const handleRoundedAmountTransfer = () => {
		axios.post(baseURL + 'api/v2/savings-goals/add-money', {
			accountUid: selectedAccount.accountUid,
			savingsGoalUid: selectedSavingsGoals,
			params: {
				amount: {
					currency: "GBP",
					minorUnits: roundedAmount * 100
				}
			}
		})
			.then((data) => console.log(data));
	};

	return (
		<div className="App">
			<div>
				<input type="date" id="start" name="transaction-start"
				       onChange={(e) => setCalendarStart(e.target.value)}
				       value={calendarStart}/>
				<input type="date" id="end" name="transaction-end"
				       min={calendarStart}
				       onChange={(e) => setCalendarEnd(e.target.value)}
				       value={calendarEnd}/>
			</div>
			{accountDetails.map((account, index) => {
				return <button key={index} onClick={() => handleGetTransactions(account)}>
					Account {index + 1}
				</button>
			})}
			<div>
				{transactions.map(trans => {
					return <div key={trans.feedItemUid}>Amount: £{trans.amount.minorUnits} on: {trans.transactionTime}</div>
				})}
			</div>
			{!!transactions.length ?
				<div>
					<div>Round amount: {roundedAmount ? roundedAmount : ''}</div>
					<button onClick={() => handleRound()}>
						Round up
					</button>
					<button onClick={() => handleRoundedAmountTransfer()}>Transfer to Savings Goals</button>
				</div> : ''
			}
		</div>
	);
};

export default App;
