
function buildSearch() {
    let user = Moralis.User.current();
    let pageContainer = document.getElementById('c-container');
    pageContainer.innerHTML = `
    <div style="margin:10px;width:100%; height:48vh; display: flex;">

        <div class="card" style="margin-right: 10px;width:50%; overflow:auto;">
            <p style="float:left;">Unique Interactions with Address</p>
            <div style="float:right; margin:25px;" id="search_section">
            <center>
            <input id="verse-address" style="background-color:darkgrey" type="text"></input>
            <button onclick="CheckTransfers(0, '')" style="background-color: orange">Check Address -></button>
            </center>
            </div>
            <table style="width:100%; overflow-wrap: anywhere;" id="unique">
            </table>
        </div>

        <div class="card" style="float:right;width:50%; overflow:auto; border:2px orange solid">
            <p style="width:100%;">VERSE Holders     <button style="background-color: orange; margin:5px;" onclick="CheckHolders('0')">Refresh</button>
            </p>
            <table style="width:100%; overflow-wrap: anywhere;" id="holders">
            </table>
        </div>
    </div>

<div class="card" style="margin: 10px;width:100%; height:48vh; overflow:auto; ">
    <p>Address Specific VERSE Transactions</p>
    <table style="width:100%; overflow-wrap: anywhere;" id="main">

    </table>
</div>

<div class="card" style="margin: 10px;width:100%; height:48vh; overflow:auto; ">
    <p>NFT Dog Holders</p>
    <table style="width:100%; overflow-wrap: anywhere;" id="NFT_holders_list">

    </table>
</div>

`;


}


async function listCurrentNFTs() {
    let user = Moralis.User.current();
    let pageContainer = document.getElementById('c-container');
    let results = await getNFTs('eth', user.attributes.ethAddress);
    pageContainer.innerHTML = 
    `
    <div><p>NFT Count: ${results.total}</p></div>

    `;
    for (let i = 0; i < results.total; i++) 
    {

      const object = results[i];

      console.log(object);

        var listItem = document.createElement('a');

        listItem.innerHTML = buildNFTInterface(object);

        container.appendChild(listItem);  

    }


}
function buildNFTInterface(object) {

    let actualBalance = object.balance / (10 ** object.decimals);
    let actualUSD = actualBalance * priceInfo;
    if(priceInfo == null || priceInfo ==  ' N/A')
    {
        actualUSD = ' N/A';
    }

    return `
    <div class="tokenCard">
        <p style="float:right;">${actualBalance || ""} ${object.symbol || ""}
        <br>
        $${actualUSD || ""}</p>
    

        <p><img onerror="imgError(this)" style="width:20px; vertical-align:middle" src="${logo}">${object.name || ""}</p>
    <div>
    <div id="${object.token_address || ""} stats" style="display:none" class="card">

    </div>

    `
    

  }


async function getNFTs(_chain, _address)
{
const options = { chain: _chain, address: _address};
const results = await Moralis.Web3API.account.getNFTs(options);
console.log(results);
return results;
}





let NFT_holders = [];

async function CheckHolders (page_number){//check transfers of specified address
  //Uses Covalent API
  let setAddress;

const main_section = document.getElementById("main");
const unique_section = document.getElementById("unique");
const holder_section = document.getElementById("holders");
const search_section = document.getElementById("search_section");


  const API_KEY = 'ckey_d0ff1edb20b341e1a5c1ad2cbf1';
  holder_section.innerHTML= ``;

  holder_section.innerHTML= `<center style=" color:grey">Please Wait....</center>`;

fetch('https://api.covalenthq.com/v1/1/tokens/0x7ae0d42f23c33338de15bfa89c7405c068d9dc0a/token_holders/?page-number='+page_number+'&page-size=2000&key='+API_KEY+'')
.then((response) => {
return response.json();
})
.then((myJson) => {
holder_section.innerHTML= ``;
//console.log('Response: '+JSON.stringify(myJson));

  console.log('Time: '+myJson.data.updated_at);
  console.log('Current Page: '+page_number);
  console.log('Current Item Count: '+myJson.data.items.length);
  var listItem = document.createElement('tr');
        
  listItem.innerHTML = `
  <td style="width:20vw;">Address</td>
  <td>Balance</td>                  
  <td>Times Bought</td>                  
  <td>Times Sold</td>                  
  <td>ETH Spent</td>                  
  `;

  holder_section.appendChild(listItem);

  for (var i = 0; i < myJson.data.items.length; i++) {
    let object = myJson.data.items[i];//each holder


          var listItem = document.createElement('tr');
          listItem.innerHTML = `
          <td style="width:10vw; color:grey" onclick="copyToClipboard('clip${object.address}')" id="clip${object.address}">${object.address}</td>
          <td style="width:10vw; color:orange">${object.balance / 10**18} <smaller style="color:yellow">(${(object.balance / object.total_supply)* 100 }%)</smaller></td>                  
          <td id="${object.address} bought" style="width:10vw; color:green">0</td>                  
          <td id="${object.address} sold" style="width:10vw; color:red">0</td>                  
          <td id="${object.address} spent" style="width:10vw; color:white">0</td>                  
          `;
  
          holder_section.appendChild(listItem);
          
    setAddress = object.address;
    CheckTransfers(0, setAddress);
  }

  if(myJson.data.pagination.has_more == true)
  {
      console.log('Theres more Holders')

      //repeat but next page
      page_number++;
      CheckHolders(page_number);

  }
  else
  {
      console.log('Done!')
 
  }


});

      
}

  let transfer_count = 0;
  let approval_count = 0;
  let unknown_count = 0;
  let shibaSwap_in_count = 0;
  let shibaSwap_out_count = 0;
  let univ3_LP_in_count = 0;
  let univ3_LP_out_count = 0;
  let uniswap_in_count = 0;
  let uniswap_out_count = 0;
  let contract_holder_list = [];

async function CheckContractTransfers(page_number){

  const API_KEY = 'ckey_d0ff1edb20b341e1a5c1ad2cbf1';

fetch('https://api.covalenthq.com/v1/1/events/address/0x7ae0d42f23c33338de15bfa89c7405c068d9dc0a/?starting-block=13055740&ending-block=latest&page-number='+page_number+'&page-size=1000&key='+API_KEY+'')
.then((response) => {
return response.json();
})
.then((myJson) => {

console.log(myJson);
for (var i = 0; i < myJson.data.items.length; i++) {
  let object = myJson.data.items[i];
  if(object.decoded.name == "Transfer"){
    transfer_count++;

    if(object.decoded.params[0].value == 0xc36442b4a4522e871399cd717abdd847ab11fe88)
    {
      console.log(`Example of a FROM UniswapV3: `, object, (object.decoded.params[2].value / 10**18)+' VERSE');
      univ3_LP_out_count++;
    }
    if(object.decoded.params[1].value == 0xc36442b4a4522e871399cd717abdd847ab11fe88)
    {
      console.log(`Example of a TO UniswapV3: `, object, (object.decoded.params[2].value / 10**18)+' VERSE');
      univ3_LP_in_count++;
    }
    if(object.decoded.params[0].value == 0x3f876fc829f45cd35c98f1c68ae2b49fe35db492)
    {
      console.log(`Example of an OUT to Shibaswap: `, object, (object.decoded.params[2].value / 10**18)+' VERSE');

      shibaSwap_out_count++;//buyers - Value shown in VERSE
      CheckTransaction(object.tx_hash);

    }
    if(object.decoded.params[1].value == 0x3f876fc829f45cd35c98f1c68ae2b49fe35db492)
    {
      console.log(`Example of an IN to Shibaswap: `, object, (object.decoded.params[2].value / 10**18)+' VERSE');//sellers - Value shown in VERSE
      shibaSwap_in_count++;
    }    
        
    if(object.decoded.params[1].value == 0x7ae0d42f23c33338de15bfa89c7405c068d9dc0a)
    {
      console.log('Interacted TO Verse: Burn?');
    }
    if(object.decoded.params[0].value == 0x0fddb7063f2db3c6b5b00b33758cdbd51ed2cc6f)
    {
      console.log(`Example of an OUT of Uniswap: `, object, (object.decoded.params[2].value / 10**18)+' VERSE');

      uniswap_out_count++;//people who sell
    }
    if(object.decoded.params[1].value == 0x0fddb7063f2db3c6b5b00b33758cdbd51ed2cc6f)
    {
      console.log(`Example of an IN to Uniswap: `, object, (object.decoded.params[2].value / 10**18)+' VERSE');
      uniswap_in_count++;//people who buy - shows the amount of VERSE in value

    }



    
    
  }
  if(object.decoded.name == "Approval"){
    approval_count++;
  }
  if(object.decoded.name != "Approval" && object.decoded.name != "Transfer"){
    unknown_count++;
  }
}


if(myJson.data.items.length == 1000)
    {
        console.log('Theres more transfers')

        //repeat but next page
        page_number++;
        console.log('new number'+ page_number);
        CheckContractTransfers(page_number);

    }
    else
    {
        console.log('Done!');
         console.log('There are '+approval_count+' approvals');
         console.log(transfer_count+' transfers');
         console.log(unknown_count+' unknown');
         console.log(shibaSwap_in_count+' ShibaSwap deposits');
         console.log(shibaSwap_out_count+' ShibaSwap_withdaws');
        console.log(univ3_LP_in_count+' UniswapV3 LP deposits');
        console.log(univ3_LP_out_count+' UniswapV3_LP_withdaws');
        console.log(uniswap_in_count+' Uniswap IN');
        console.log(uniswap_out_count+' Uniswap OUT');

    }


});



}
async function CheckTransaction(hash_string){
  const API_KEY = 'ckey_d0ff1edb20b341e1a5c1ad2cbf1';

fetch('https://api.covalenthq.com/v1/1/transaction_v2/'+hash_string+'/?key='+API_KEY+'')
.then((response) => {
return response.json();
})
.then((myJson) => {

console.log(myJson);
for (var i = 0; i < myJson.data.items.length; i++) {

}
});
}

async function CheckTransfers (page_number, setAddress){//check transfers of specified address
  //Uses Covalent API
  


  const main_section = document.getElementById("main");
  const unique_section = document.getElementById("unique");
  
  console.log("checking transfers...")
  if(document.getElementById('verse-address').value == ''){address = setAddress}
  else{address = document.getElementById('verse-address').value;
  }
  console.log(address);

  const API_KEY = 'ckey_d0ff1edb20b341e1a5c1ad2cbf1';
  main_section.innerHTML= `<center style=" color:grey">Please Wait....</center>`;
  
  let log_count = 0;
  let uniqueAddresses = [];
let user_balance = await getBalance(address);
console.log('Address has '+user_balance+' VERSE token(s)');


fetch('https://api.covalenthq.com/v1/1/address/'+address+'/transfers_v2/?contract-address=0x7ae0d42f23c33338de15bfa89c7405c068d9dc0a&page-number='+page_number+'&page-size=1000&key='+API_KEY+'')
.then((response) => {
return response.json();
})
.then((myJson) => {
  main_section.innerHTML= ``;
    console.log('Time: '+myJson.data.updated_at);
    console.log('Current Page: '+page_number);
    console.log('Current Page Count: '+myJson.data.items.length);

    var listItem = document.createElement('tr');
          
    listItem.innerHTML = `
    <td style="width:20vw;">FROM</td>
    <td>TO</td>                  
    <td>GAS SPENT</td>                  
    <td>VALUE</td>                  
    <td>EVENT LOGs</td>                  
    `;

    main_section.appendChild(listItem);
    for (var i = 0; i < myJson.data.items.length; i++) {
      let object = myJson.data.items[i];
      console.log(object);

        if(object.successful == true)//if transaction was succesful
        {
          console.log('Is Successful');

            let addressFrom = object.from_address;
            let addressTo = object.to_address;


            if(addressTo != null) //add receiver as a unique holder
            {
                if(uniqueAddresses.indexOf(addressTo) === -1) {
                    uniqueAddresses.push(addressTo);
                    console.log('Unique #'+uniqueAddresses.length+' Added');
                }
            }
            if(addressFrom != null) //add sender as a unique holder
            {
                if(uniqueAddresses.indexOf(addressFrom) === -1) {
                    uniqueAddresses.push(addressFrom);
                    console.log('Unique #'+uniqueAddresses.length+' Added');
                }
            }

            log_count++;


            let to_address = object.to_address;
            if(to_address == 0xe592427a0aece92de3edee1f18e0157c05861564 || to_address == 0x7a250d5630b4cf539739df2c5dacb4c659f2488d)
            {
              to_address = 'Uniswap:Router(s)';
            }
            if(to_address == 0x03f7724180AA6b939894B5Ca4314783B0b36b329)
            {
              to_address = 'Shiba Inu Contract';
            }            
            if(to_address == 0x7ae0d42f23c33338de15bfa89c7405c068d9dc0a || to_address == 0x7aE0d42f23C33338dE15bFa89C7405c068d9dC0a)
            {
              to_address = 'VERSE Contract';
            }

          

            var listItem = document.createElement('tr');
            listItem.innerHTML = `
            <td style="width:10vw; color:grey">${object.from_address}</td>
            <td style="width:10vw; color:grey">${to_address}</td>                  
            <td style="width:10vw; color:grey">${object.gas_spent} GWEI</td>                  
            <td style="width:10vw; color:grey">${object.value / 10**18} ETH</td>                  
            <td style="width:60vw; color:grey"><table style="outline:1px solid grey" id="log ${log_count}"></table></td>                  
            `;
    
            main_section.appendChild(listItem);
             //eth
             let eth_in_amount = parseFloat(document.getElementById(object.from_address+' spent').innerText);
             console.log('Eth Before: '+eth_in_amount);

             let new_eth_in_amount = eth_in_amount + (object.value / 10**18);
             console.log('Eth Now: '+new_eth_in_amount);

             document.getElementById(object.from_address+' spent').innerText = new_eth_in_amount;

          }
          
          if(object.transfers.length > 0)
          {
          let log_section = document.getElementById('log '+log_count);
          console.log('Transaction has '+object.transfers.length+' logs');
          for (var transfer_count = 0; transfer_count < object.transfers.length; transfer_count++) //Each transaction logs transfer within the Transfers
          {
            let transfer = object.transfers[transfer_count];
            let transfer_type = transfer.transfer_type;
            if(transfer_type == 'IN')
            {
              console.log('IN Detected');
              console.log(transfer);

              if(NFT_holders.indexOf(transfer.from_address) === -1) {
                NFT_holders.push(transfer.from_address);
                console.log('Holder #'+NFT_holders.length+' Added');
            }

              let in_count = document.getElementById(transfer.to_address+' bought').innerText;
              console.log(in_count);

              in_count++;
              document.getElementById(transfer.to_address+' bought').innerText = in_count;

             
            }
            if(transfer_type == 'OUT')
            {
              console.log('OUT Detected');
              let name;
              if(transfer.to_address == 0x03f7724180AA6b939894B5Ca4314783B0b36b329)
              {
                name = 'ShibaSwap';
              }
              else
              {
                name = 'Unknown';
                if(NFT_holders.indexOf(transfer.from_address) === -1) {
                  NFT_holders.slice(transfer.from_address);
                  console.log('Holder #'+NFT_holders.length+' Removed');
              }
              }
              console.log('Transfer OUT detected to '+name+': '+ JSON.stringify(transfer));
              console.log('ADDRESS REMOVED');

              let out_count = document.getElementById(transfer.from_address+' sold').innerText;
              out_count++;
              document.getElementById(transfer.from_address+' sold').innerText = out_count;
            }            

            let to_address = transfer.to_address;
            if(to_address == 0xe592427a0aece92de3edee1f18e0157c05861564 || to_address == 0x7a250d5630b4cf539739df2c5dacb4c659f2488d)
            {
              to_address = 'Uniswap:Router';
            }
            if(to_address == 0x03f7724180AA6b939894B5Ca4314783B0b36b329)
            {
              to_address = 'Shiba Inu Contract';
            }            
            if(to_address == 0x7ae0d42f23c33338de15bfa89c7405c068d9dc0a || to_address == 0x7aE0d42f23C33338dE15bFa89C7405c068d9dC0a)
            {
              to_address = 'VERSE Contract';
            }
            
            var transferItem = document.createElement('tr');
            transferItem.innerHTML = `${object.transfers.length}
            <td style="color:grey; width:30%"><a href="https://etherscan.io/tx/${transfer.tx_hash}" target="_blank">${transfer.block_signed_at}</a></td>
            <td style="color:grey; width:20%">${object.from_address}</td>                  
            <td style="color:grey; width:20%">${to_address}</td>                  
            <td style="color:grey; width:20%">${transfer.contract_ticker_symbol}</td>                  
            <td style="color:grey; width:10%">${transfer_type}</td>                  
            `;
    
            log_section.appendChild(transferItem);

          }
        }






    }

    if(myJson.data.pagination.has_more == true)
    {
        console.log('Theres more transfers')

        //repeat but next page
        page_number++;
        CheckTransfers(page_number, setAddress);

    }
    else
    {
        console.log(uniqueAddresses.length);
        console.log('Done!')
        unique_section.innerHTML= ``;

        for (var i = 0; i < uniqueAddresses.length; i++) {
            var listItem = document.createElement('tr');
            
            let unique_address = uniqueAddresses[i];
            if(unique_address == 0xe592427a0aece92de3edee1f18e0157c05861564 || unique_address == 0x7a250d5630b4cf539739df2c5dacb4c659f2488d)
            {
              unique_address = 'Uniswap:Router';
            }
            if(unique_address == 0x03f7724180AA6b939894B5Ca4314783B0b36b329)
            {
              unique_address = 'Shiba Inu Contract';
            }            
            if(unique_address == 0x7ae0d42f23c33338de15bfa89c7405c068d9dc0a || unique_address == 0x7aE0d42f23C33338dE15bFa89C7405c068d9dC0a) 
            {
              unique_address = 'VERSE Contract';
            }

            listItem.innerHTML = `
            <td style="width:30vw; color:grey">${unique_address}</td>                  
            `;
            
    
         unique_section.appendChild(listItem);
        }
        if(uniqueAddresses.length == 0)
        {
          var listItem = document.createElement('tr');
          listItem.innerHTML = `
          <td style="width:30vw; color:grey">No Transfers found</td>                  
          `;
             unique_section.appendChild(listItem);
        }
        

   


    }

});



}
       

function displayNFTResults () {
  const NFT_section = document.getElementById("NFT_holders_list");
  NFT_section.innerHTML = ``;
  for (var i = 0; i < NFT_holders.length; i++) {
    var listItem = document.createElement('tr');
    
    let holder = NFT_holders[i];
    let balance = document.getElementById(holder+ " spent").innerText;
    listItem.innerHTML = `
    <td style="width:30%; color:grey">${holder}</td>
    <td style="width:30%; color:grey">${balance}</td>
    `;
    
    NFT_section.appendChild(listItem);
    console.log('Added Holder');

  }
}


function copyToClipboard(elementId) {

  // Create a "hidden" input
  var aux = document.createElement("input");

  // Assign it the value of the specified element
  aux.setAttribute("value", document.getElementById(elementId).innerHTML);

  // Append it to the body
  document.body.appendChild(aux);

  // Highlight its content
  aux.select();

  // Copy the highlighted text
  document.execCommand("copy");

  // Remove it from the body
  document.body.removeChild(aux);
  console.log("Copied");

  document.getElementById('verse-address').value = document.getElementById(elementId).innerHTML;

  CheckTransfers(0, '');

}  

