// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Bank {
    // Variables
    mapping(address => int) private balance;
    mapping(address => uint) private lastInterestCheck;
    mapping(address => uint) private totalInterestEarned;
    
    address public owner;
    uint public interestRate; // En basis points (ejemplo: 500 = 5%)
    uint public constant INTEREST_INTERVAL = 1 days; // Intervalo de cálculo de intereses
    
    // Events
    event DepositMade(address indexed account, uint value);
    event WithdrawMade(address indexed account, uint value);
    event TransferMade(address indexed from, address indexed to, uint value);
    event InterestAccrued(address indexed account, uint interest);
    event InterestRateUpdated(uint newRate);
    
  // Constructor
    constructor() {
    owner = msg.sender;
    interestRate = 10; // Tasa de interés inicial (ejemplo: 5%)
    }

    
    // Modificador de acceso
    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }
    
    // Public functions
    function getBalance(address account) public view returns (int) {
        return balance[account] + int(_calculateInterest(account));
    }

    function deposit() public payable {
        require(msg.value > 0, "MIN_ETHER_NOT_MET");
        _applyInterest(msg.sender);
        balance[msg.sender] += int(msg.value);
        emit DepositMade(msg.sender, msg.value);
    }

    function withdraw(uint amount) public {
        _applyInterest(msg.sender);
        require(balance[msg.sender] - int(amount) >= -10, "NOT_ENOUGH");
        balance[msg.sender] -= int(amount);
        payable(msg.sender).transfer(amount);
        emit WithdrawMade(msg.sender, amount);
    }

    function transfer(address destination, uint amount) public {
        _applyInterest(msg.sender);
        _applyInterest(destination);
        require(balance[msg.sender] - int(amount) >= -10, "NOT_ENOUGH");
        balance[msg.sender] -= int(amount);
        balance[destination] += int(amount);
        emit TransferMade(msg.sender, destination, amount);
    }

    function getTotalInterestEarned(address account) public view returns (uint) {
        return totalInterestEarned[account] + _calculateInterest(account);
    }

    // Función para actualizar la tasa de interés
    function updateInterestRate(uint newRate) public onlyOwner {
        interestRate = newRate;
        emit InterestRateUpdated(newRate);
    }


    // Internal functions
    function _applyInterest(address account) internal {
        if (lastInterestCheck[account] == 0) {
            lastInterestCheck[account] = block.timestamp;
            return; // No calcular intereses en la primera llamada
        }
        
        uint interest = _calculateInterest(account);
        if (interest > 0) {
            balance[account] += int(interest);
            totalInterestEarned[account] += interest;
            lastInterestCheck[account] = block.timestamp;
            emit InterestAccrued(account, interest);
        }
    }


    function _calculateInterest(address account) internal view returns (uint) {
        if (lastInterestCheck[account] == 0) {
            return 0;
        }
        uint timeElapsed = block.timestamp - lastInterestCheck[account];
        if (timeElapsed < INTEREST_INTERVAL) {
            return 0;
        }
        uint periods = timeElapsed / INTEREST_INTERVAL;
        uint interest = (uint(balance[account]) * interestRate * periods) / 10000;
        return interest;
    }
}