import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

////////////////////////////
// BankModule
////////////////////////////

const BankModule = buildModule("Bank", (m) => {

    const Bank = m.contract("Bank");

    return { Bank };
});

export default BankModule;