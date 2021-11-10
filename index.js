const serverUrl = "https://khybc8eujjv8.usemoralis.com:2053/server";
const appId = "ZjLwImf5hHp67RxfVPWH11uKiS7UYVuoxvoTX05f";
Moralis.start({ serverUrl, appId });


var web3;
checkWeb3();

async function checkWeb3(){
  const ethereum = window.ethereum;
  if(!ethereum || !ethereum.on) {
      displayMessage("01", "This App Requires MetaMask, Please Install MetaMask");
  }
  else{
      //displayMessage("00", "Metamask is Installed");
      setWeb3Environment();
  }
}

function setWeb3Environment(){
  web3 = new Web3(window.ethereum);
  getNetwork();
  monitorNetwork();
}

async function getNetwork(){
  chainID = await web3.eth.net.getId();
  console.log(chainID+": Active network is "+ getNetworkName(chainID));
  if(chainID !== 1)
  {
    alert('Please switch to the Ethereum Network.');
  }


}

function getNetworkName(chainID){
  networks = {
      1:"Ethereum Mainnet",
      3:"Ethereum Ropsten",
      4:"Ethereum Rinkeby",
      5:"Ethereum Goerli",
      10:"Optimism",
      42:"Ethereum Kovan",
      56:"Binance Smart Chain Mainnet",
      97:"Binance Smart Chain Testnet",
      137:"Polygon Mainnet",
      250:"Fantom Opera",
      43114:"Avalanche C-Chain",    //EVM
      //43114:"Avalanche X-Chain",    //Creating and trading
      //43114:"Avalanche P-Chain",    //metadata, validators, and subnets
      80001:"Polygon Mumbai Testnet"
  }
  return networks[chainID];
}

function getMoralisChainID(chainID){
  networks = {
      1:"eth",
      56:"bsc",
      137:"polygon",
      43114:"",    //EVM
      80001:"mumbai"
  }
  return networks[chainID];
}

function monitorNetwork(){
  Moralis.onChainChanged(function(){
      //window.location.reload()
      console.log('Network Changed');
      getNetwork();
  })
}


const appHeaderContainer = document.getElementById("app-header-btns");
const contentContainer = document.getElementById("content");

async function logOut() {
  await Moralis.User.logOut();
  render();
  console.log("logged out. User:", Moralis.User.current());
}

async function loginWithMetaMask() {
  let user = Moralis.User.current();
  if (!user) {
    user = await Moralis.authenticate();
  }
  console.log(user);

  render();
}

function buildLoginComponent(isSignUp = false) {
    const btnSignUp = isSignUp ? "" : `<button type="button" id="btn-login-email-signup">Sign Up With Email</button>`;
  
    return `
    <div style="margin-left:auto;margin-right:auto;margin-top:100px">
    <div style="" class="card">
    <center>
    <h2 class="title">Login</h2>
   <img src="/images/logo_io.png" style="width:200px;display:block">
<br>

      <div class="container login">
        <button style="color:#141824; font-style:bold" id="btn-login-metamask">Login or Signup With MetaMask</button>
     
        
      </div>
      </center>
      </div>
      </div>
    `;
  }
  

  function buildSideMenu() {
    const user = Moralis.User.current();
    if (!user) {
      return;
    }
    else{

        return `
    
    
        <div id="cont">
        <div id="menu-fixed">
          <a href="#cont">
            <i class="material-icons back">&#xE314;</i>
          </a>
          <a href="#menu-fixed">
            <div class="logo">
              <p><img src="/images/logo_under.png" style="width:100%; overflow:hidden"></p>
            </div>
          </a>
          <hr>
          <ul class="menu">
            <li onclick="buildHome()"><i class="material-icons">&#xE88A;</i><p>Home</p></li>
            <li onclick="buildSwap()"><i class="material-icons">&#xe8d4;</i><p>Swap</p></li>
            <li onclick="listCurrentTokens(0)"><i class="material-icons">&#xe263;</i><p>Tokens</p></li>
            <li onclick="logOut()"><i class="material-icons">&#xe9ba;</i><p>Logout</p></li>
          </ul>
        </div>
        </div>
        
        <div id="page">
        <div class="tokenCard" style="width:100%"><p>Currently Signed In: ${getAddressTxt(user.attributes.ethAddress)}</p></div>
        <br> 
        <div id ="c-container"></div>
        </div>
    
        `;
    }
  }
  
    



  function buildHome() {
    let user = Moralis.User.current();
    let pageContainer = document.getElementById('c-container');
    pageContainer.innerHTML = ``;
    let element = document.createElement('div');
    element.innerHTML = `
    <div id= "0x7ae0d42f23c33338de15bfa89c7405c068d9dc0a stats"></div>
    <br>
    <div style="display:flex; width:100%">
    <div class="card" style="width:50%">
      <p>Verse Holders:<p id="verseHolderCount"></p></p>
    </div>
    <br>
    <div class="card" style="width:50%">
      <p>ShibaSwap LP Holders:<p id="shibaswapLiquidity"></p></p>
      </div>    
    </div>
    `;
    pageContainer.appendChild(element);
    CheckLiquidityHolders(0);
    getCurrentTokenStats('1', '0x7ae0d42f23c33338de15bfa89c7405c068d9dc0a');

}



function renderLogin(isSignUp) {
  contentContainer.innerHTML = buildLoginComponent(isSignUp);
  document.getElementById("btn-login-metamask").onclick = loginWithMetaMask;
}

function getAddressTxt(address) {
  return `${address.substr(0, 4)}...${address.substr(address.length - 4, address.length)}`;
}

function buildProfileComponent(user) {
  return `
    <div class="container card">
    <div>
    <h2>Profile Settings</h2>
    <hr>
        <div class="form-group">
          <label for="name">Username</label>
          <input type="text" id="name" value="${user.attributes.username || ""}"/>
        </div>
        <button class="mt" type="button" id="btn-profile-save">Save Profile</button>

    </div>
  `;
}


function renderProfile() {
    let user = Moralis.User.current();
let pageContainer = document.getElementById('c-container');
  pageContainer.innerHTML = buildProfileComponent(user);
  document.getElementById("btn-profile-save").onclick = onSaveProfile;

}

async function onSaveProfile(event) {
  event.preventDefault();
  const user = Moralis.User.current();

  try {
    // get values from the form
    const username = document.getElementById("name").value;

    // update user object
    user.setUsername(username); // built in

    await user.save();
    alert("saved successfully!");
  } catch (error) {
    console.error(error);
    alert("Error while saving. See the console.");
  }
}

function render() {
  const user = Moralis.User.current();
  if (user) {
    contentContainer.innerHTML = buildSideMenu();
    buildHome();


  } else {
    renderLogin();
  }
}

function init() {

  // render on page load
  render();
}
init();






async function checkScore(address) {
  fetch('https://api.coingecko.com/api/v3/coins/ethereum/contract/'+address)
  .then((response) => {
  return response.json();
  })
  .then((myJson) => {
    console.log(myJson);
    if(!myJson.error)
    {
      console.log('no error');
      if(myJson.coingecko_score > 5)
      {
        console.log('Passed: '+myJson.coingecko_score);
        return myJson.coingecko_score;
      }
      else
      {
        console.log('Failed: '+myJson.coingecko_score);
        return null;
      }
    }
    else
    {
      console.log('NULL');
      return null;
    }
  });
}

async function listCurrentTokens(number)
{
    const user = Moralis.User.current();
    const container = document.getElementById("c-container");
    container.innerHTML = ``;
    container.innerHTML = buildLoader();
//ERC20s
//const Balance = await Moralis.Web3.getERC20({ chain: _chain, symbol: _symbol });


let wallet_address = user.attributes.accounts[number];
console.log('User has '+user.attributes.accounts.length+' account addresses linked.')

console.log(user.attributes.accounts[0]);

const supportedChains = ['eth'];
var alltokens = document.createElement('div');

for (let i = 0; i < supportedChains.length; i++) 
{

  // get native balance for a given address
    const nativeBalance = await Moralis.Web3API.account.getNativeBalance({chain: supportedChains[i], address: wallet_address});
  console.log('Results1:' +JSON.stringify(nativeBalance));
  

        var listItem = document.createElement('a');
       let actualNative = nativeBalance.balance / (10 ** 18);
       let name;
       let symbol;
       if(supportedChains[i] == 'eth'){name = 'Ethereum'; color = '#716b9496;'; symbol = 'ETH', logo = 'https://ethereum.org/static/a183661dd70e0e5c70689a0ec95ef0ba/34ca5/eth-diamond-purple.png'}
       if(supportedChains[i] == 'avalanche'){name = 'Avalanche'; color = '#24242493;'; symbol = 'AVAX', logo = 'https://seeklogo.com/images/A/avalanche-avax-logo-440813952D-seeklogo.com.png'}

        listItem.innerHTML = 
        
        
        `<div class="tokenCard">
        <div style="width:50%">
        <p><img style="width:20px; vertical-align:middle" src="${logo}"> ${ name || ""}</p>
        </div>
        <div style="width:50%; text-align:right;">
          <p>${actualNative || ""} ${ symbol || ""}</p>
        </div>

        <div>
                                `;
        alltokens.appendChild(listItem);         
  

  const tokenBalance = await Moralis.Web3API.account.getTokenBalances({chain: supportedChains[i], address: wallet_address});


  for (let i = 0; i < tokenBalance.length; i++) 
    {
      const object = tokenBalance[i];
      console.log(object);

      let trust_check = await checkScore(object.token_address);
      console.log(trust_check);
      console.log('Trust checked done');
      if(trust_check != null)
      {
        var listItem = document.createElement('a');
        let logo = await grabMeta('eth', object.token_address);
        if(logo == null)
        {
          logo = 'https://logos.covalenthq.com/tokens/1/'+object.token_address+'.png';
        }
        
        let priceResult = await grabPrice('eth',object.token_address)
        .catch(console.error);
        let priceInfo;
        if(priceResult == null)
        {
          priceInfo = ' N/A';
        }
        else
        {
          priceInfo = priceResult.usdPrice;
          
        }
        listItem.innerHTML = buildTokenInterface(object, logo, priceInfo);
          alltokens.appendChild(listItem);  
          //document.getElementById(object.token_address+ ' statsToggle').onclick = function(){
          //    getCurrentTokenStats(chainID, object.token_address);
          //    toggle(object.token_address+' stats');
          //}
      }



       
  }

  container.innerHTML = ``;
  container.appendChild(alltokens);  
}

}

function buildTokenInterface(object, logo, priceInfo) {

    let actualBalance = object.balance / (10 ** object.decimals);
    let actualUSD = actualBalance * priceInfo;
    if(priceInfo == null || priceInfo ==  ' N/A')
    {
        actualUSD = ' N/A';
    }

    return `
    <div id="${object.token_address || ""} statsToggle" class="tokenCard">
    <div style="width:50%">

        <p><img onerror="imgError(this)" style="width:20px; vertical-align:middle" src="${logo}"> ${object.name || ""}</p>
    </div>
      <div style="width:50%; text-align:right;">

      <p>${actualBalance || ""} ${object.symbol || ""}
      <br>
      $${actualUSD || ""}</p>
    </div>
    </div>

    `
    

  }


async function toggle(id) {
    var x = document.getElementById(id);
    console.log(id);
    if (x.style.display === "none") {
      x.style.display = "block";
    } else {
      x.style.display = "none";
    }
  }
   

  async function grabMeta(_chain, _address){
    //Get metadata for one token
    const options = { chain: _chain, addresses: _address };
    const tokenMetadata = await Moralis.Web3API.token.getTokenMetadata(options);
    console.log(tokenMetadata);
    if(tokenMetadata.length == 0)
    {
        return null;
    }
    let thumbnail = tokenMetadata[0].thumbnail;
    return thumbnail;
}

async function grabPrice(_chain, _address){

const options = {
    chain: _chain,
    address: _address
  };
  const price = await Moralis.Web3API.token.getTokenPrice(options);
  if(price == null)
  {
      return null;
  }

  return price;
}

  async function getCurrentTokenStats (chain, input){
    //Uses Covalent API
    const API_KEY = 'ckey_d0ff1edb20b341e1a5c1ad2cbf1';
    //const supportedChains = ['1', '137', '56', '43114', '250'];
  
    let chain_id = 1;
    let user = Moralis.User.current();
    let address = input;
    const container = document.getElementById(input+' stats');
    container.innerHTML = ``;
    container.innerHTML = buildLoader();
    
  
    let today = new Date();
    let date = today.getFullYear()+'-'+("0" + (today.getMonth() + 1)).slice(-2)+'-'+("0" + today.getDate()).slice(-2);
    console.log(date);
    let beforeDate = (today.getFullYear()) +'-'+("0" + (today.getMonth() + 1-3)).slice(-2)+'-'+("0" + today.getDate()).slice(-2);
    console.log(beforeDate);
  
    fetch('https://api.covalenthq.com/v1/pricing/historical_by_addresses_v2/'+chain_id+'/usd/'+address+'/?from='+beforeDate+'&to='+date+'&key='+API_KEY+'')
    .then((response) => {
    return response.json();
    })
    .then((myJson) => {
      console.log(myJson);
      console.log(myJson.data[0].prices.length);
      let prices = [];
      let dates = [];
      for (var i = 0; i < myJson.data[0].prices.length; i++) 
  {
    let object = myJson.data[0].prices[i];
    prices.push(object.price);
    dates.push(object.date);
  
  }
      let element = document.createElement('div');
      element.innerHTML = `
      <div class="card">
        <canvas style="color:white" id="myChart"></canvas>
        
        <div class="slidecontainer">
        <input style="width:98%" name="time" type="range" min="3" max="${myJson.data[0].prices.length - 1}" value="7" class="slider" id="myRange">
        </div>
        </div>
      `;
      container.innerHTML = ``;
      container.appendChild(element);
      priceHistory(address, prices, dates);
      document.getElementById("myRange").onchange = function () {
        priceHistory(address, prices, dates);
      };
      
  
  
  
    });
          
  }
   async function priceHistory(token, _prices, _dates) {
  
        let days = document.getElementById('myRange').value;
        let i = token;
  
        let dates = _dates.slice(0, days).reverse();
        let prices = _prices.slice(0, days).reverse();
  
        const data = {
          labels: dates,
          datasets: [{
          label: "Token Price",
          backgroundColor: 'orange',
          borderColor: 'orange',
          defaultFontColor: 'orange',
          data:prices,
          }]
        };
  
        const config = {
          type: 'line',
          data: data,
          options: {  
              defaultFontColor: 'orange'
        }
        };
  
        if(window.myChart instanceof Chart){
          myChart.destroy()
        }
  
        window.myChart = new Chart(
          document.getElementById('myChart'),
          config
        );
  
      }

      
function imgError(image) {
    image.onerror = "";
    image.src = "/images/question.png";
    return true;
  }
  

  /*SWAP*/


  function buildSwap() {
      let pageContainer = document.getElementById('c-container');
      pageContainer.innerHTML = `
      
          <div id="window">
              <h4>Swap</h4>
              <div id="form">
                  <div class="swapbox">
                  <h4>From</h4>
                  <div class="swapbox_select token_select" id="from_token_select">
                      <img src="/images/question.png" id="from_token_img" onerror="imgError(this)" class="token_image">
                      <span id="from_token_text">Select Token</span>
                  </div>
                  
                  <div class="swapbox_select">
                      <input class="number form-control" placeholder="amount" id="from_amount">
                  </div>
                  </div>
                  <div class="swapbox">
                  <h4>To</h4>
                  <div class="swapbox_select token_select"  id="to_token_select">
                      <img src="/images/question.png" id="to_token_img" onerror="imgError(this)" class="token_image">
                      <span id="to_token_text">Select Token</span>
                  </div>
                  <div class="swapbox_select">
                      <input class="number form-control" placeholder="amount" id="to_amount">
                  </div>
                      
                  </div>
                  <button disabled class="btn btn-large btn-primary btn-block" id="swap_button">
                  Swap
                  </button>
                  <div style="float:right">Estimated Gas: <span id="gas_estimate"></span></div>
              </div>
          </div>
          <br><br>
          <div class="card" style="outline:2px solid orange;">
          <p><img src="https://shibaswap.com/static/media/shibaswap-icon.ee749b42.png" style="width:25px;"> We support ShibaSwap!</p>
          <hr>
            <small>Are you a supporter of ShibaSwap? So are we! Our Dex ties into the best deals, including those on ShibaSwap. Try it out and see for yourself.</small>
          </div>
      
  
  <div class="modal" id="token_modal" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
          <button id="modal_close" type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
            <h5 class="modal-title">Select token</h5>
   
          </div>
          <div class="modal-body">
            <div id="token_list"></div>
          </div>
        </div>
      </div>
    </div>`;
    document.getElementById("modal_close").onclick = closeModal;
    document.getElementById("from_token_select").onclick = (() => {openModal("from")});
    document.getElementById("to_token_select").onclick = (() => {openModal("to")});
    document.getElementById("from_amount").onblur = getQuote;
    document.getElementById("swap_button").onclick = trySwap;
    
    listAvailableTokens();
    
    }

let currentTrade = {};
let currentSelectSide;
let tokens;
  console.log(currentTrade);

async function listAvailableTokens(){
let url = 'https://ropsten.api.0x.org';
let endpoint = '/swap/v1/tokens';
    
    fetch(url+endpoint)
    .then((response) => {
    return response.json();
    })
    .then((myJson) => {
      console.log(myJson);
      console.log(myJson.records.length);
      console.log(myJson[0]);
      tokens=[];
      let verse = {address: '0x7ae0d42f23c33338de15bfa89c7405c068d9dc0a', decimals: 18, name: 'Verse', symbol: 'VERSE'};
      tokens.push(verse);
      let usdt = {address: '0xdac17f958d2ee523a2206206994597c13d831ec7', decimals: 6, name: 'Tether USD', symbol: 'USDT'};
      tokens.push(usdt);
      let dai = {address: '0x6b175474e89094c44da98b954eedeac495271d0f', decimals: 18, name: 'Dai Stablecoin', symbol: 'DAI'};
      tokens.push(dai);
      let eth = {address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', decimals: 18, name: 'Ether', symbol: 'ETH'};
      tokens.push(eth);
      for (var i = 0; i < myJson.records.length; i++) 
      {
        let object = myJson.records[i];
        tokens.push(object); //adds in 0x tokens
      }


      let parent = document.getElementById("token_list");
      for( const address in tokens){
          let token = tokens[address];
          let div = document.createElement("div");
          div.setAttribute("data-address", address)
          div.className = "tokenCard-swap";
          let logo = 'https://logos.covalenthq.com/tokens/1/'+token.address+'.png';
          div.innerHTML = `
          <img onerror="imgError(this)" class="token_list_img" src="${logo}">
          <span class="token_list_text">${token.symbol}</span>
          `;
          div.onclick = (() => {selectToken(address)});
          parent.appendChild(div);
      }
    });
  
  }

  function selectToken(address){
    closeModal();
    console.log(tokens);
    currentTrade[currentSelectSide] = tokens[address];
    console.log(currentTrade);
    renderInterface();
    getQuote();
  }
  
  function renderInterface(){
    if(currentTrade.from){
      if(currentTrade.from.symbol == 'VERSE')
      {
        document.getElementById("from_token_img").src = '/images/question.png';
      }
      else
      {
        document.getElementById("from_token_img").src = 'https://logos.covalenthq.com/tokens/1/'+currentTrade.from.address+'.png';
      }
        document.getElementById("from_token_text").innerHTML = currentTrade.from.symbol;
    }
    if(currentTrade.to){
      if(currentTrade.to.symbol == 'VERSE')
      {
        document.getElementById("to_token_img").src = '/images/question.png';
      }
      else
      {
        document.getElementById("to_token_img").src = 'https://logos.covalenthq.com/tokens/1/'+currentTrade.to.address+'.png';

      }
        document.getElementById("to_token_text").innerHTML = currentTrade.to.symbol;
    }
  }
  
  function openModal(side){
    currentSelectSide = side;
    document.getElementById("token_modal").style.display = "block";
  }
  function closeModal(){
    document.getElementById("token_modal").style.display = "none";
  }
  
  async function getQuote(){
    if(!currentTrade.from || !currentTrade.to || !document.getElementById("from_amount").value) return;
    
    let amount = Number( 
      (document.getElementById("from_amount").value * 10**currentTrade.from.decimals) 
    )
    console.log('Amount:', amount);
    let url = 'https://ropsten.api.0x.org';
    let endpoint = '/swap/v1/quote?';

    fetch(url+endpoint+'buyToken='+currentTrade.to.address+'&sellToken='+currentTrade.from.address+'&sellAmount='+amount+'&slippagePercentage=1')//+'&includedSources=shibaswap'
    .then((response) => {
    return response.json();
    })
    .then((myJson) => {
      quote = myJson;
      console.log(quote);
      document.getElementById("gas_estimate").innerHTML = quote.estimatedGas;
      document.getElementById("to_amount").value = quote.buyAmount / (10**currentTrade.to.decimals);
      document.getElementById("swap_button").disabled = false;
    });
  
  }
  
  async function trySwap(){
    await Moralis.Web3.enableWeb3();
    let user = Moralis.User.current();

    
    if(currentTrade.from.symbol !== "ETH"){
 

      //Get token allowance
      const options = {
        chain: 'ropsten',
        owner_address: user.attributes.ethAddress,
        spender_address: quote.allowanceTarget,
        address: currentTrade.from.address
      };
      const allowance = await Moralis.Web3API.token.getTokenAllowance(options);
      console.log('allowance', allowance);
      
      if(allowance.allowance < quote.sellAmount){

       console.log('You have not set enough allowance for this token');
        const ABI = [
          {
            "constant": false,
            "inputs": [
              {
                "internalType": "address",
                "name": "spender",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              }
            ],
            "name": "approve",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          },
        ];
        
        const options = {
          contractAddress: currentTrade.from.address,
          functionName: "approve",
          abi: ABI,
          params: {
            spender: quote.allowanceTarget,
            amount: quote.sellAmount
          },
        };
        
        const receipt = await Moralis.executeFunction(options);
        console.log(receipt)
        return;
      }
      
      
    }
    try {
        let receipt = await doSwap(quote);
        console.log(receipt);
        alert("Swap Complete: "+ receipt);
    
        } 
    catch (error) {
        alert('ERROR: '+error.message);
    }
      
  
  
  }
  
  async function doSwap(quote){
    let pageContainer = document.getElementById('c-container');
    pageContainer.innerHTML = ``;
    let web3 = await Moralis.Web3.enableWeb3();

    let user = Moralis.User.current();
    quote.from = user.attributes.ethAddress;
    console.log('Try Transaction', quote);
    
    let results = await web3.eth.sendTransaction(quote);
    pageContainer.innerHTML = `
    <div class="tokenCard" style="display:block; width:fit-content">
    <h3>Transaction Results</h2><hr>
    <p>Block Hash: ${results.blockHash}</p><br>
    <p>Block Number: ${results.blockNumber}</p><br>
    <p>Cumulative Gas Used: ${results.cumulativeGasUsed}</p><br>
    <p>Effective Gas Price: ${results.effectiveGasPrice}</p><br>
    <p>From: ${results.from}</p><br>
    <p>To: ${results.to}</p><br>
    <p>Transaction Hash: <a href="https://etherscan.io/tx/${results.transactionHash}">${results.transactionHash}</a></p>
    </div>`;

  }
  
  
  
  function buildLoader() {
    return `
    <center><div class="loader"></div></center>`
    ;
  }
  
  



  /* Transaction Explorer*/


  async function getBalance(address)
{
  
let _chain = 'eth';
let user = Moralis.User.current();
let Balance = await Moralis.Web3API.account.getTokenBalances({chain: _chain, address: address});
let balance;
console.log('User Address: '+address);
  if(Balance == undefined || Balance.length == 0)
  {        
    balance = 0;
    return balance;
  }
  else
  {
    console.log('User owns '+Balance.length+' different token(s)');

    for (let i = 0; i < Balance.length; i++) 
      {
        console.log(Balance[i]);
        if(Balance[i].token_address == 0x7ae0d42f23c33338de15bfa89c7405c068d9dc0a) //VERSE: 0x7ae0d42f23c33338de15bfa89c7405c068d9dc0a
        {
          balance = Balance[i].balance / 10**18;   
        }
      }
      return balance;
  }
}


async function CheckLiquidityHolders (page_number){//check transfers of specified address
    //Uses Covalent API
    let shibAddress = '0x3f876fc829f45cd35c98f1c68ae2b49fe35db492';
    let verseAddress = '0x7ae0d42f23c33338de15bfa89c7405c068d9dc0a';
    
    const liquidity_section = document.getElementById("shibaswapLiquidity");
    const liquidity1_section = document.getElementById("verseHolderCount");
  
    const API_KEY = 'ckey_d0ff1edb20b341e1a5c1ad2cbf1';
    liquidity_section.innerHTML= ``;
    liquidity_section.innerHTML= buildLoader();

    liquidity1_section.innerHTML= ``;
    liquidity1_section.innerHTML= buildLoader();
  
    fetch('https://api.covalenthq.com/v1/1/tokens/'+shibAddress+'/token_holders/?page-number='+page_number+'&page-size=5000&key='+API_KEY+'')
    .then((response) => {
    return response.json();
    })
    .then((myJson) => {
      liquidity_section.innerHTML= ``;
    //console.log('Response: '+JSON.stringify(myJson));
    
    console.log('Time: '+myJson.data.updated_at);
    console.log('Current Page: '+page_number);
    console.log('Current Page Count: '+myJson.data.items.length);
    liquidity_section.innerHTML=  myJson.data.items.length
  
  
      if(myJson.data.pagination.has_more == true)
      {
          console.log('Theres more Holders')
    
          //repeat but next page
          page_number++;
          //CheckShibLiquidityHolders(page_number);
    
      }
      else
      {
          console.log('Done!')
     
      }
    
    });
    fetch('https://api.covalenthq.com/v1/1/tokens/'+verseAddress+'/token_holders/?page-number='+page_number+'&page-size=5000&key='+API_KEY+'')
    .then((response) => {
    return response.json();
    })
    .then((myJson) => {
      liquidity1_section.innerHTML= ``;
    //console.log('Response: '+JSON.stringify(myJson));
    
    console.log('Time: '+myJson.data.updated_at);
    console.log('Current Page: '+page_number);
    console.log('Current Page Count: '+myJson.data.items.length);
    liquidity1_section.innerHTML=  myJson.data.items.length
  
  
      if(myJson.data.pagination.has_more == true)
      {
          console.log('Theres more Holders')
    
          //repeat but next page
          page_number++;
          //CheckVerseLiquidityHolders(page_number);
    
      }
      else
      {
          console.log('Done!')
     
      }
    
    });
      
        
  }
  

  