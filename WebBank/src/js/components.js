const Main = () => {
    const [account, setAccount] = React.useState(null);
    const [balance, setBalance] = React.useState("0");
    const [bankBalance, setBankBalance] = React.useState("0");
    const [totalInterest, setTotalInterest] = React.useState("0");
    const [depositAmount, setDepositAmount] = React.useState("");
    const [withdrawAmount, setWithdrawAmount] = React.useState("");
    const [transferAmount, setTransferAmount] = React.useState("");
    const [receiverAddress, setReceiverAddress] = React.useState("");
    const [interestRate, setInterestRate] = React.useState("0");
    const [newInterestRate, setNewInterestRate] = React.useState("");
    const [isOwner, setIsOwner] = React.useState(false);
    const [web3Instance, setWeb3Instance] = React.useState(null);
    const [simulationTime, setSimulationTime] = React.useState(1); // Días para la simulación
    const [estimatedInterest, setEstimatedInterest] = React.useState("0"); // Interés estimado
  
    // Función para actualizar todos los valores relevantes
    const updateAllValues = async () => {
      if (web3Instance && account) {
        await updateBalance(account);
        await updateBankBalance(account);
        await updateInterest(account);
        await fetchInterestRate();
      }
    };
  
    // Llamadas a las funciones de actualización
    const updateBalance = async (userAddress) => {
      if (web3Instance) {
        const balance = await web3Instance.eth.getBalance(userAddress);
        setBalance(web3Instance.utils.fromWei(balance, 'ether'));
      }
    };
  
    const updateBankBalance = async (userAddress) => {
      if (web3Instance && BANK) {
        try {
          const bankBalance = await BANK.methods.getBalance(userAddress).call();
          setBankBalance(web3Instance.utils.fromWei(bankBalance, 'ether'));  
        } catch (error) {
          console.error("Error fetching bank balance:", error);
        }
      }
    };
  
    const updateInterest = async (userAddress) => {
      if (web3Instance) {
        const interest = await BANK.methods.getTotalInterestEarned(userAddress).call();
        setTotalInterest(web3Instance.utils.fromWei(interest, 'ether'));
      }
    };
  
    const fetchInterestRate = async () => {
      if (web3Instance) {
        const rate = await BANK.methods.interestRate().call();
        setInterestRate(rate / 100); // Ajustar a porcentaje
      }
    };
  
    // Calcular el interés estimado
    const calculateInterest = () => {
      const balanceInEther = parseFloat(bankBalance);
      const rate = parseFloat(interestRate) / 100;
      const days = simulationTime;
  
      // Fórmula simple para calcular el interés
      const interestEarned = balanceInEther * rate * days; 
  
      setEstimatedInterest(interestEarned.toFixed(4)); // Estimar el interés ganado
    };
  
    React.useEffect(() => {
      const connectToMetamask = async () => {
        try {
          const savedWallet = localStorage.getItem("Web3Login");
          if (savedWallet) {
            setAccount(savedWallet);
            await updateAllValues();
            return;
          }
  
          const wallets = await METAMASK.request({ method: 'eth_requestAccounts' });
          if (!wallets.length) throw new Error("No wallet connected");
          const wallet = wallets[0];
  
          await METAMASK.request({ method: 'wallet_addEthereumChain', params: [NETWORK] });
  
          setAccount(wallet);
          localStorage.setItem("Web3Login", wallet);
          await updateAllValues();
        } catch (error) {
          console.error("Error connecting to MetaMask:", error.message);
        }
      };
  
      connectToMetamask();
    }, []);
  
    React.useEffect(() => {
      if (account) {
        updateAllValues(); // Llamar a la función optimizada cada vez que se cambie la cuenta
      }
    }, [account]);
  
    React.useEffect(() => {
      if (account) {
        const web3 = new Web3(window.ethereum);
        setWeb3Instance(web3);
        const bank = new web3.eth.Contract(BANK_ABI, BANK_ADDRESS);
        BANK = bank;  // Asegúrate de que BANK esté definido
      }
    }, [account]);
  
    const deposit = async () => {
      if (!web3Instance || !BANK) {
        console.error("Web3 or Bank contract is not initialized.");
        return;
      }
  
      try {
        const weiAmount = web3Instance.utils.toWei(depositAmount, 'ether');
        await BANK.methods.deposit().send({ from: account, value: weiAmount });
        updateAllValues(); 
      } catch (error) {
        console.error("Deposit error:", error);
      }
    };
  
    const withdraw = async () => {
      if (!web3Instance || !BANK) {
        console.error("Web3 or Bank contract is not initialized.");
        return;
      }
  
      try {
        const weiAmount = web3Instance.utils.toWei(withdrawAmount, 'ether');
        await BANK.methods.withdraw(weiAmount).send({ from: account });
        updateAllValues();
      } catch (error) {
        console.error("Withdraw error:", error);
      }
    };
  
    const transfer = async () => {
      if (!web3Instance || !BANK) {
        console.error("Web3 or Bank contract is not initialized.");
        return;
      }
  
      try {
        const weiAmount = web3Instance.utils.toWei(transferAmount, 'ether');
        await BANK.methods.transfer(receiverAddress, weiAmount).send({ from: account });
        updateAllValues();
      } catch (error) {
        console.error("Transfer error:", error);
      }
    };
  
    React.useEffect(() => {
      BANK.events.InterestAccrued({ fromBlock: 'latest' })
        .on('data', event => {
          console.log('Interest Accrued:', event);
          updateAllValues(); 
        });
    }, [account]);
  
    return (
      <div>
        <h1>Welcome to the Bank</h1>
        <p>Connected Account: {account}</p>
        <p>Balance: {balance} ETH</p>
        <p>Bank Balance: {bankBalance} ETH</p>
        <p>Accumulated Interest: {totalInterest} ETH</p>
        <p>Interest Rate: {interestRate * 100}%</p>
        
        {/* Simulador de interés */}
        <div>
          <h2>Interest Calculator</h2>
          <p>Simulate how much your balance will earn in interest.</p>
          <label htmlFor="simulationTime">Enter the number of days: </label>
          <input
            type="number"
            id="simulationTime"
            value={simulationTime}
            onChange={(e) => setSimulationTime(e.target.value)}
          />
          <button onClick={calculateInterest}>Calculate Interest</button>
          <p>Estimated Interest Earned: {estimatedInterest} ETH</p>
        </div>
        
        <br />
        <div>
          <h2>Deposit</h2>
          <input type="number" placeholder="Amount in ETH" value={depositAmount} onChange={(e) => setDepositAmount(e.target.value)} />
          <button onClick={deposit}>Deposit</button>
        </div>
        <div>
          <h2>Withdraw</h2>
          <input type="number" placeholder="Amount in ETH" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} />
          <button onClick={withdraw}>Withdraw</button>
        </div>
        <div>
          <h2>Transfer</h2>
          <input type="text" placeholder="Receiver Address" value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)} />
          <input type="number" placeholder="Amount in ETH" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} />
          <button onClick={transfer}>Transfer</button>
        </div>
        {isOwner && (
          <div>
            <h2>Update Interest Rate</h2>
            <input type="number" placeholder="New Rate (%)" value={newInterestRate} onChange={(e) => setNewInterestRate(e.target.value)} />
            <button onClick={updateInterestRate}>Update Rate</button>
          </div>
        )}
      </div>
    );
  };
  