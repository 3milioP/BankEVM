
"use strict";

var web3 = null;

if (typeof window.ethereum == 'undefined') {
    console.error('MetaMask is not installed!');
    document.body.innerText = "MetaMask is not installed!"
} else {
   
    METAMASK = window.ethereum;
    const web3 = new window.Web3(METAMASK);

    BANK = new web3.eth.Contract(BANK_ABI, BANK_ADDRESS);

    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);

    root.render(<div><Main /></div>);
}