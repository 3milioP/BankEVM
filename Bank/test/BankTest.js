const { assert, expect } = require('chai')
const { ethers } = require("hardhat");


const INITIAL_DEPOSIT = 1000n;
const INTEREST_RATE = 500; // 5% anual

describe("Nuestro Banco", function () {

    before(async function () {

        this.Bank = await ethers.getContractFactory("Bank");

        const [owner, addr1, addr2] = await ethers.getSigners();

        this.owner = owner;
        this.account1 = addr1;
        this.account2 = addr2;
    });

    beforeEach(async function () {

        this.bank = await this.Bank.deploy(INTEREST_RATE);

        await this.bank.connect(this.owner).deposit({ value: INITIAL_DEPOSIT });
    });

    it("Is Deployed", async function () {

        assert.isTrue(this.bank !== undefined);
    });

    it("Get Balance works!", async function () {

        const balance = await this.bank.getBalance(this.account1);
        assert.equal(balance, 0n, "Invalid Balance");
    });

    it("No deposit value given", async function () {

        await expect(
            this.bank.connect(this.account1).deposit())
            .to.be.revertedWith("MIN_ETHER_NOT_MET");

        await expect(
            this.bank.connect(this.account1).deposit({ value: 0 }))
            .to.be.revertedWith("MIN_ETHER_NOT_MET");
    });

    it("Deposit works!", async function () {

        await expect(this.bank.connect(this.account1).deposit({ value: 100 }))
            .to.emit(this.bank, "DepositMade")
            .withArgs(this.account1, 100);

        await expect(this.bank.connect(this.account1).deposit({ value: 1000 }))
            .to.emit(this.bank, "DepositMade")
            .withArgs(this.account1, 1000);
    });

    it("Withdraw and leave < -10 in balance", async function () {

        await expect(
            this.bank.connect(this.account1).withdraw(11))
            .to.be.revertedWith("NOT_ENOUGH");
    });

    it("Withdraw and leave -10 < 0 in balance", async function () {

        await this.bank.connect(this.account1).withdraw(10);

        assert.equal(await ethers.provider.getBalance(this.bank),
            INITIAL_DEPOSIT - 10n);

        await expect(
            this.bank.connect(this.account1).withdraw(1))
            .to.be.revertedWith("NOT_ENOUGH");
    });

    it("Withdraw and leave >= 0 in balance", async function () {

        assert.equal(await this.bank.getBalance(this.account1), 0n);
        await this.bank.connect(this.account1).deposit({ value: 10 });
        assert.equal(await this.bank.getBalance(this.account1), 10n);
        await this.bank.connect(this.account1).withdraw(10);
        assert.equal(await this.bank.getBalance(this.account1), 0n);
        await this.bank.connect(this.account1).withdraw(5);
        assert.equal(await this.bank.getBalance(this.account1), -5n);

        assert.equal(await ethers.provider.getBalance(this.bank),
            INITIAL_DEPOSIT - 5n);

        await expect(this.bank.connect(this.account1).withdraw(5))
            .to.emit(this.bank, "WithdrawMade")
            .withArgs(this.account1, 5);
    });

    it("Transfer and leave < -10 in balance", async function () {

        await expect(
            this.bank.connect(this.account1).transfer(this.account2, 11))
            .to.be.revertedWith("NOT_ENOUGH");
    });

    it("Transfer and leave -10 < 0 in balance", async function () {

        assert.equal(await this.bank.getBalance(this.account1), 0);
        assert.equal(await this.bank.getBalance(this.account2), 0n);

        await this.bank.connect(this.account1).transfer(this.account2, 10);

        assert.equal(await this.bank.getBalance(this.account1), -10n);
        assert.equal(await this.bank.getBalance(this.account2), 10n);

        assert.equal(await ethers.provider.getBalance(this.bank),
            INITIAL_DEPOSIT);
    });

    it("Transfer and leave >= 0 in balance", async function () {

        assert.equal(await this.bank.getBalance(this.account1), 0n);
        assert.equal(await this.bank.getBalance(this.account2), 0n);

        await this.bank.connect(this.account1).deposit({ value: 100 });

        assert.equal(await this.bank.getBalance(this.account1), 100n);
        assert.equal(await this.bank.getBalance(this.account2), 0n);

        await this.bank.connect(this.account1).transfer(this.account2, 40);

        assert.equal(await this.bank.getBalance(this.account1), 60n);
        assert.equal(await this.bank.getBalance(this.account2), 40n);

        await this.bank.connect(this.account1).transfer(this.account2, 65);

        assert.equal(await this.bank.getBalance(this.account1), -5n);
        assert.equal(await this.bank.getBalance(this.account2), 105n);

        assert.equal(await ethers.provider.getBalance(this.bank),
            INITIAL_DEPOSIT + 100n);

        await expect(this.bank.connect(this.account1).transfer(this.account2, 5))
            .to.emit(this.bank, "TransferMade")
            .withArgs(this.account1, this.account2, 5);
    });

    it("Intereses iniciales deben ser 0", async function () {
        const interest = await this.bank.getTotalInterestEarned(this.account1);
        assert.equal(interest, 0n, "El interés inicial debe ser 0");
    });

    it("Acumulación de intereses después de 1 día", async function () {
        await this.bank.connect(this.account1).deposit({ value: 100 }); // Primero depositar
    
        await ethers.provider.send("evm_increaseTime", [86400]); // Simular 1 día
        await ethers.provider.send("evm_mine");
    
        const interest = await this.bank.getTotalInterestEarned(this.account1);
        assert.isAbove(Number(interest), 0, "Debe haber intereses generados después de 1 día");
    });
    

    it("Owner puede actualizar la tasa de interés", async function () {
        await expect(this.bank.connect(this.owner).updateInterestRate(1000))
            .to.emit(this.bank, "InterestRateUpdated")
            .withArgs(1000);
        
        const newRate = await this.bank.interestRate();
        assert.equal(newRate, 1000, "La nueva tasa debe ser 10%");
    });

    it("No-owner no puede actualizar la tasa de interés", async function () {
        await expect(
            this.bank.connect(this.account1).updateInterestRate(1000)
        ).to.be.revertedWith("NOT_OWNER");
    });

    it("Intereses se aplican en transferencias", async function () {
        await this.bank.connect(this.account1).deposit({ value: 100 });
        
        await ethers.provider.send("evm_increaseTime", [86400]); // Simular 1 día
        await ethers.provider.send("evm_mine");
    
        await this.bank.connect(this.account1).transfer(this.account2, 50);
    
        // Simular el paso de 1 día para el account2 también
        await ethers.provider.send("evm_increaseTime", [86400]); // Simular 1 día más
        await ethers.provider.send("evm_mine");
    
        const interest1 = await this.bank.getTotalInterestEarned(this.account1);
        const interest2 = await this.bank.getTotalInterestEarned(this.account2);
    
        assert.isAbove(Number(interest1), 0, "El usuario 1 debe haber acumulado intereses");
        assert.isAbove(Number(interest2), 0, "El usuario 2 debe haber acumulado intereses");
    });
    

    it("Evento InterestAccrued se emite correctamente", async function () {
        await this.bank.connect(this.account1).deposit({ value: 100 });  // Realizar un depósito para asegurar interés
    
        await ethers.provider.send("evm_increaseTime", [86400]); // Simular 1 día
        await ethers.provider.send("evm_mine");
    
        const interest = await this.bank.getTotalInterestEarned(this.account1);
        assert.isAbove(Number(interest), 0, "Debe haber intereses generados antes de emitir el evento");
    
        await expect(this.bank.connect(this.account1).deposit({ value: 100 }))
            .to.emit(this.bank, "InterestAccrued")
            .withArgs(this.account1, interest);  // Usar el valor calculado de interés
    });
});