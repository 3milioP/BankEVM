async function main() {

    const [owner, user1, user2] = await ethers.getSigners();

    const BANK = await ethers.getContractFactory("Bank");
    const bank = await BANK.deploy();

    if (bank) {

        console.log("User 1 - Balance in Bank =", await bank.getBalance(user1));
        console.log("User 1 - Balance in Wallet =", await ethers.provider.getBalance(user1));
        console.log("Bank - Balance =", await ethers.provider.getBalance(bank));
        console.log()
        
        await bank.connect(user1).deposit({ value: 1000 });

        console.log("User 1 - Balance in Bank =", await bank.getBalance(user1));
        console.log("User 1 - Balance in Wallet =", await ethers.provider.getBalance(user1));
        console.log("Bank - Balance =", await ethers.provider.getBalance(bank));
        console.log()
        
        await bank.connect(user1).transfer(user2, 400);

        console.log("User 1 - Balance in Bank =", await bank.getBalance(user1));
        console.log("User 1 - Balance in Wallet =", await ethers.provider.getBalance(user1));
        console.log()

        console.log("User 2 - Balance in Bank =", await bank.getBalance(user2));
        console.log("User 2 - Balance in Wallet =", await ethers.provider.getBalance(user2));
        console.log("Bank - Balance =", await ethers.provider.getBalance(bank));
        console.log()
        
        await bank.connect(user2).transfer(user1, 100);

        console.log("User 1 - Balance in Bank =", await bank.getBalance(user1));
        console.log("User 1 - Balance in Wallet =", await ethers.provider.getBalance(user1));
        console.log()
        
        console.log("User 2 - Balance in Bank =", await bank.getBalance(user2));
        console.log("User 2 - Balance in Wallet =", await ethers.provider.getBalance(user2));
        console.log("Bank - Balance =", await ethers.provider.getBalance(bank));
        console.log()


/*
        await bank.connect(user1).withdraw(10);

        console.log("User 1 - Balance in Bank =", await bank.getBalance(user1));
        console.log("User 1 - Balance in Wallet =", await ethers.provider.getBalance(user1));
        console.log("Bank - Balance =", await ethers.provider.getBalance(bank));
        console.log()
*/
/*
        await bank.connect(user2).deposit({ value: 100 });

        console.log("User 2 - Balance in Bank =", await bank.getBalance(user2));
        console.log("User 2 - Balance in Wallet =", await ethers.provider.getBalance(user2));
        console.log("Bank - Balance =", await ethers.provider.getBalance(bank));
        console.log()
*/
    }
}

main()
    .then((result) => {
        console.log()
        console.log("All is good!")
        console.log()
        process.exit(0);
    })
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });