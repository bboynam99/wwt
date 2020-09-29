// note: USDT, USDC decimal = 6

var walletConnect = false;
var walletAddress;
var balance = 0;
var decimals = 18;

var tokenAddress; // wwt token
var wwtlpAddress; //wwt lp token
var wwtPoolAddress; //wwt-lp pool address

//计算WWT-TRX LP Token价格，单位usdt
var wwtlpPrice = 0.01;

var currentPagePoolID = "WWT";
var currentPageWalletBalance = 0;
var currentPageStaked = 0;
var currentPageReward = 0;

var mm_tron = new $.mm_tron({
	// OK
	contract_address: "",
	precision: 100000000000000000
});

const trx_address = "T9ycGdsTDc9hAVobuNauvZAd14dt9LVyee";
const usdt_address = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
const pearl_address = "TGbu32VEGpS4kDmjrmn5ZZJgUyHQiaweoq";
const jfi_address = "TN7zQd2oCCguSQykZ437tZzLEaGJ7EGyha";
const wwt_address = "xx";


function setNileNode() {
	console.log("setNileNode");
	tokenAddress = contractAddresses['testWwtTokenAddress']; // wwt token
	wwtlpAddress = contractAddresses['testWwtLPAddress']; //wwt lp token
	wwtPoolAddress = contractAddresses['testWwtPoolAddress']; //wwt-lp pool address
}

function setMainNode() {
	console.log("setMainNode");
	tokenAddress = contractAddresses['wwtTokenAddress']; // wwt token
	wwtlpAddress = contractAddresses['wwtLPAddress']; //wwt lp token
	wwtPoolAddress = contractAddresses['wwtPoolAddress']; //wwt-lp pool address
}

function parseJustswapData(data) {
	// console.log("parseJustswapData : "+data);
	var tmp = eval('(' + data + ')');
	var d = tmp.data;

	for (var i = 0; i < allTokens.length; i++) {
		var name = allTokens[i];
		var token = pools[name];
		// console.log("name="+name+",address="+token.address);
		var info = d["0_" + token.address];
		if (info) {
			token.price = info.price;
			token.decimals = info.base_decimal;
			console.log("name=" + name + ",price=" + info.price);
		}
	}
}

function loadJustswapData() {
	for (var i = 0; i < 10; i++) {
		$("#div1").load('https://api.justswap.io/v2/allpairs?page_size=300&page_num=' + i, function (response, status, xhr) {
			if (status) {
				parseJustswapData(response);
				var usdt = pools["USDT"];
				if (usdt.price != 0) {
					calRealPrice();
				}
			}
		});
	}
}

//计算所有token对USDT的价格
function calRealPrice() {
	var usdt = pools["USDT"];
	for (var i = 0; i < allTokens.length; i++) {
		var name = allTokens[i];
		if (name != "USDT") {
			var token = pools[name];
			token.price = token.price / usdt.price;
			if (name == "WWT")
				$('.tokenprice').text('$' + parseFloat(token.price).toFixed(4));
			if(name=="WWT/TRX"){
				token.price = wwtlpPrice;
			}
		}
	}
}

//name,address,poolAddress,weight,poolTotalStake,userStake,userBalance
function createToken(name, address, poolAddress) {
	var oTempToken = new Object;

	//用来质押的代币名称
	oTempToken.name = name;

	//用来质押的代币地址，比如这个是wwt-trx lp 地址
	oTempToken.address = address;

	//用来挖矿的地址，比如这个是矿池wwt-trx lp的地址
	oTempToken.poolAddress = poolAddress;

	//该矿池能挖出来总代币数量
	oTempToken.totalReward = 50;

	//该矿池目前质押的总数量
	oTempToken.poolTotalStake = 0;

	//该矿池这个用户质押了多少
	oTempToken.userStake = 0;

	//该矿池用来挖矿的代币，用户有多少
	oTempToken.userBalance = 0;

	//用户当前挖出来多少代币
	oTempToken.userEarn = 0;

	//该矿池的挖矿币的价格
	oTempToken.price = 0;

	//该矿池的挖矿币的精度
	oTempToken.decimals = 18;

	//该矿池的APY
	oTempToken.apy = 0;
	return oTempToken;
}

var allTokens = [
	"WWT/TRX",
	"WWT",
	"USDT",
	"PEARL",
	"COLA",
	"SSK",
	"SUN",
	"JFI",
	"HT",
	"GOLD",
	"DZI",
	"MKR",
]

var pools = {
	"WWT/TRX": createToken("WWT/TRX", "TT5eiN2GaGikcTUyPZcuHNj31f2edYzgBu", "TMN2GpeJhYgwqPoRDbvevqtWKdwBBD3wqX"),
	"WWT": createToken("WWT", "TX3wPdSdnJ7wto4QyZ2J9QEVr5XcgEr6Cq", ""),
	"USDT": createToken("USDT", "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", ""),
	"PEARL": createToken("PEARL", "TGbu32VEGpS4kDmjrmn5ZZJgUyHQiaweoq", ""),
	"COLA": createToken("COLA", "TSNWgunSeGUQqBKK4bM31iLw3bn9SBWWTG", ""),
	"SSK": createToken("SSK", "TW1sqqq7UphAqGNHDXSLXsEainYHJuQeyC", ""),
	"SUN": createToken("SUN", "TKkeiboTkxXKJpbmVFbv4a8ov5rAfRDMf9", ""),
	"JFI": createToken("JFI", "TN7zQd2oCCguSQykZ437tZzLEaGJ7EGyha", ""),
	"HT": createToken("HT", "TDyvndWuvX5xTBwHPYJi7J3Yq8pq8yh62h", ""),
	"GOLD": createToken("GOLD", "TQs33VBR68syFx93KQ9iYSg8Xyr68t3A3L", ""),
	"DZI": createToken("DZI", "TLi2o9XadMAonBJvzoj1kHBkNe6Nh1SaZ3", ""),
	"MKR": createToken("MKR", "TRqJw3csFiyswCY7tYjVMpfk9jxYaWmPME", ""),
}

var loadedpools = 0;
var totalPoolWeight = 14; // sum of weight

function updateAllTokens() {
	var usdt = pools["USDT"];
	if(usdt.price==0){
		return;
	}
	for (var i = 0; i < allTokens.length; i++) {
		var name = allTokens[i];
		updateAPY(name);
	}
}

function updateAPY(name){
	async function trigger(){
		console.log("updateapy "+name+",address="+pools[name].poolAddress);
		let poolContract = await window.tronWeb.contract().at(pools[name].poolAddress);
		let totalStake = await poolContract.totalSupply().call();
		console.log("updateAPY name="+name+", totalStake=" + totalStake);

		//池子每s产出wwt数量
		let rewardRate = await poolContract.rewardRate().call();

		let wwwToken = pools["WWT"];
		//每s能挖出的wwt总价格
		let rewardPrice = rewardRate/Math.pow(10,wwwToken.decimals) * wwwToken.price;

		//用来质押的代币
		let stakeToken = pools[name];

		let totalStakePrice = totalStake/Math.pow(10,stakeToken.decimals) * stakeToken.price;

		//每s，每u能产出的产率
		let aps = 1;
		if(totalStakePrice!=0)
		aps = rewardPrice/totalStakePrice;
		
		let apy = aps * 60 * 60 * 24 * 365;

		stakeToken.apy = apy;

		var apyp = ".poolyield"+name;
		if(name==="WWT/TRX"){
			apyp =".poolyieldWWTTRX";
		}
		if(apy>=60 * 60 * 24 * 365){
			$(apyp).text("Infinity %");
		}else
		$(apyp).animateNumbers(parseInt(apy)*100 + ' %');
	}
	if(pools[name]&&pools[name].poolAddress){
		trigger();		
	}
}

// function updateYield() {
// 	// need modification
// 	var perblock = 100;
// 	var annualblock = (365 * 86400) / 13; // approximation of 13 sec/block
// 	var annualreward = annualblock * perblock;
// 	var perpoolunit = annualreward / totalPoolWeight;

// 	var ctx2 = new web3.eth.Contract(uniswapABI, pools[0][0]);
// 	ctx2.methods.getReserves().call(function (err, result1) {
// 		ctx2.methods.totalSupply().call(function (err, result2) {
// 			ctx2.methods.balanceOf(chefAddress).call(function (err, result3) {
// 				var totalSupply = result2; // total supply of UNI-V2
// 				var stakedSupply = result3; // staked amount in chef
// 				var percentageOfSupplyInPool = stakedSupply / totalSupply;
// 				//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit);
// 				// total liquidity ~ 2*(single token liquidity)*(staked percentage), reserve0 = eth , reserve1 = usdt
// 				pools[0][4] =
// 					((perpoolunit /
// 						((result1['_reserve1'] * 2) / Math.pow(10, 6))) *
// 						100 *
// 						pools[0][3]) /
// 					percentageOfSupplyInPool;
// 				pools[0][5] =
// 					((result1['_reserve1'] * 2) / Math.pow(10, 6)) *
// 					percentageOfSupplyInPool;
// 				//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit,result1['_reserve1']/Math.pow(10,18),pools[0][3]);
// 				$('.pool0yield').animateNumbers(parseInt(pools[0][4]) + '%');
// 				loadedPool();
// 			});
// 		});
// 	});

// 	//uniswap _revserve0 and 1 is amount*decimal of each token
// 	var ctx0 = new web3.eth.Contract(uniswapABI, pools[5][0]);
// 	ctx0.methods.getReserves().call(function (err, result1) {
// 		ctx0.methods.totalSupply().call(function (err, result2) {
// 			ctx0.methods.balanceOf(chefAddress).call(function (err, result3) {
// 				//console.log('BURGER with ETH ctx1:',result1['_reserve0'],result1['_reserve1']);
// 				var totalSupply = result2; // total supply of UNI-V2
// 				var stakedSupply = result3; // staked amount in chef
// 				var percentageOfSupplyInPool = stakedSupply / totalSupply;
// 				//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit);
// 				// total liquidity ~ 2*(single token liquidity)*(staked percentage), reserve1 = burger, reseve0 = eth
// 				pools[5][4] =
// 					((perpoolunit /
// 						((result1['_reserve1'] * 2) / Math.pow(10, 18))) *
// 						100 *
// 						pools[5][3]) /
// 					percentageOfSupplyInPool;
// 				pools[5][5] =
// 					((prices['burgerusd'] * result1['_reserve1'] * 2) /
// 						Math.pow(10, 18)) *
// 					percentageOfSupplyInPool;
// 				//console.log(result2,result3,percentageOfSupplyInPool,perpoolunit,result1['_reserve0']/Math.pow(10,18),pools[5][3]);
// 				$('.pool5yield').animateNumbers(parseInt(pools[5][4]) + '%');
// 				loadedPool();
// 			});
// 		});
// 	});

// }


function updateConnectStatus() {
	if (walletConnect) {
		$('body').addClass('web3');
	}
	getBalance(walletAddress);
}

function getSupply() {
	var contract = new web3.eth.Contract(tokenABI, tokenAddress);
	contract.methods.totalSupply().call(function (error, result) {
		result = result / Math.pow(10, 18);

		//console.log(error, result)
		$('.supply span').animateNumbers(parseInt(result));
		$('.mcap span').animateNumbers(parseInt(result * prices['burgerusd']));
	});
}

function getBalance(address) {
	async function triggercontract() {
		console.log("tokenAddress=" + tokenAddress);
		console.log("wallet address=" + address);
		let instance = await window.tronWeb.contract().at(tokenAddress);
		let res = await instance.totalSupply().call();
		console.log("total =" + res);
		let balanceOf = await instance.balanceOf(address).call();
		decimals = await instance.decimals().call();

		balance = balanceOf / Math.pow(10, decimals);
		$('.balance').text(balance.toFixedSpecial(2) + ' WWT');
	}
	triggercontract();
}

function hidepages() {
	$('main').hide();
}

function nav(classname) {
	hidepages();
	$('body').removeClass('approved');

	if (classname.indexOf('pool') === 0) {
		$('#singlepool').show();
		initpooldata(classname.slice(4));
		$('main.pool').show();
	} else {
		$('main.' + classname).show();
	}
}

function initpooldata(name) {
	console.log("initpooldata:" + name);
	async function triggercontract() {
		$('.farmname').text(pools[name].name + ' pool');
		currentPagePoolID = name;
		//get yield balance

		//get staked balance
		//if larger than zero, approved
		var allowance = 0;
		if (name === "WWT/TRX") {
			//这是lp token，需要单独处理
			//checkAllowance(userAddress, contractAddress)
			allowance = await mm_tron.allowance(walletAddress, pools[name].address, pools[name].poolAddress);
			console.log("allowance=" + allowance);
			if (allowance > 0) {
				$('body').addClass('approved');
			}
			let lpDecimals = await mm_tron.decimals(pools[name].address);
			// console.log("lpDecimals="+lpDecimals);
			let lpBalance = await mm_tron.balanceOf(walletAddress, pools[name].address, lpDecimals);
			pools[name].userBalance = lpBalance;
			$('#maxAvaliable').text(lpBalance);
		} else {
			let tokenContract = await window.tronWeb.contract.at(pools[name].address);
			allowance = await tokenContract.allowance(walletAddress, pools[name].poolAddress);
			// console.log("allowance=" + allowance);
			if (allowance > 0) {
				$('body').addClass('approved');
			}
			let b = await tokenContract.balanceOf(walletAddress).call();
			let d = await tokenContract.decimals().call();
			let bb = b / Math.pow(10, decimals);
			console.log("d=" + d + ",bb=" + bb);
			pools[name].userBalance = bb;
		}

		let poolContract = await window.tronWeb.contract().at(pools[name].poolAddress);
		let totalStake = await poolContract.totalSupply().call();
		console.log("totalStake=" + totalStake);
		$('.totalstake').text((totalStake / Math.pow(10, decimals)).toFixedSpecial(4));
		pools[name].poolTotalStake = totalStake / Math.pow(10, decimals);

		let balance = await poolContract.balanceOf(walletAddress).call();
		console.log("balance=" + balance);
		balance = (balance / Math.pow(10, decimals)).toFixedSpecial(4);
		console.log("balance=" + balance);
		pools[name].userStake = balance;
		$('.stakedbalance').text(balance);

		$('#stakeToken').text(pools[name].name + " ");

		let earned = await poolContract.earned(walletAddress).call();
		earned = (earned / Math.pow(10, decimals)).toFixedSpecial(4);
		pools[name].userEarn = earned;
		$('.rewardbalance').text(earned);
	}
	triggercontract();
}

function approveSpend() {
	async function trigger() {
		await mm_tron.approve(pools[currentPagePoolID].address, pools[currentPagePoolID].poolAddress);
	}
	trigger();
}

function stake() {
	document.getElementById("popTitle").innerHTML = "Stake";
	$('#maxAvaliable').text(pools[currentPagePoolID].userBalance);
	document.getElementById('stakeInput').value = 0;
	$("#withdrawdiv").hide();
	$("#stakediv").show();
	showAlert();
}

function withdraw() {
	document.getElementById("popTitle").innerHTML = "Withdraw";
	$('#maxAvaliable').text(pools[currentPagePoolID].userStake);
	document.getElementById('stakeInput').value = 0;
	$("#withdrawdiv").show();
	$("#stakediv").hide();
	//maxAvaliable
	showAlert();
}

function withdrawSure() {
	hideAlert();
}

function stakeSure() {
	hideAlert();
}

function maxStake() {
	var max = $('#maxAvaliable').text();
	console.log("maxStake=" + max);
	document.getElementById('stakeInput').value = max
}

function showAlert() {
	document.getElementById('light').style.display = 'block';
	document.getElementById('fade').style.display = 'block';
}

function hideAlert() {
	document.getElementById('light').style.display = 'none';
	document.getElementById('fade').style.display = 'none';
}

function claimReward() {
	var contract = new web3.eth.Contract(chefABI, chefAddress);
	contract.methods
		.deposit(currentPagePoolID, 0)
		.send({ from: walletAddress }, function (err, transactionHash) {
			//some code
			//console.log(transactionHash)
		});
}
function removeFromPool() {
	var contract = new web3.eth.Contract(chefABI, chefAddress);
	var amount = prompt(
		'Amount to withdraw',
		(currentPageStaked - 1000000) / 10 ** 18
	); // to fix round error due to JS
	contract.methods
		.withdraw(
			currentPagePoolID,
			(amount * Math.pow(10, 18)).toFixedSpecial(0)
		)
		.send({ from: walletAddress }, function (err, transactionHash) {
			//some code
			//console.log(transactionHash)
		});
}

function loadedPool() {
	loadedpools++;

	if (loadedpools > 4) {
		var tvl = 0;
		for (var i = 0; i < pools.length; i++) {
			tvl = tvl + pools[i][5];
		}

		var realtvl = 0;
		for (var i = 0; i < pools.length; i++) {
			if (i != 2 && i != 3) {
				realtvl = realtvl + pools[i][5];
			}
		}

		$('.tvl span').animateNumbers(parseInt(tvl));
		console.warn('tvl:' + tvl);
	}
}

function updatePrice(p) {
	$('.tokenprice').text('$' + p.toFixedSpecial(4));
	updateYield();
}

function getlptoken(id) {
	if (typeof id === 'undefined') {
		window.open(pools[currentPagePoolID][2]);
	} else {
		window.open(pools[id][2]);
	}
}

var timer = setInterval(() => {
	console.log("address start")
	gettronweb();
}, 1000);

function gettronweb() {
	if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
		console.log("address Yes:" + window.tronWeb.defaultAddress.base58)
		walletAddress = window.tronWeb.defaultAddress.base58;
		clearInterval(timer);
		walletConnect = true;
		checkNode();
		updateConnectStatus();
		loadJustswapData();
	} else {
		console.log("address No")
		wallet_address.textContent = "未连接钱包（需要安装TronLink钱包）";
	}
}



function checkNode() {
	var host = window.tronWeb.fullNode.host;
	console.log("checkNode=" + host);
	if (host == "https://api.nileex.io") {
		setNileNode();
	} else if (host == "https://api.trongrid.io") {
		setMainNode();
	}
}

function test() {

}

Number.prototype.toFixedSpecial = function (n) {
	var str = this.toFixed(n);
	if (str.indexOf('e+') === -1) return str;

	str = str
		.replace('.', '')
		.split('e+')
		.reduce(function (p, b) {
			return p + Array(b - p.length + 2).join(0);
		});

	if (n > 0) str += '.' + Array(n + 1).join(0);

	return str;
};


setInterval(function () {
	//每隔10s自动更新信息
	updateAllTokens();
}, 10000);

setTimeout(function(){
	//启动后2s更新信息
	updateAllTokens();
},2000);


function uploadReword() {
	//notifyRewardAmount
	async function triggercontract() {
		// var functionSelector = "allowance(address,address)";
		var functionSelector = "notifyRewardAmount(uint256)";

		var parameter = [{
			type: "uint256",
			value: window.tronWeb.toHex(600e18)
		}
		];
		var options = {};
		let tx = await tronWeb.transactionBuilder.triggerSmartContract(
			wwtPoolAddress,
			functionSelector,
			options,
			parameter
		);
		var signedTx = await tronWeb.trx.sign(tx.transaction);
		await tronWeb.trx.sendRawTransaction(signedTx);
	}
	triggercontract();
}