async function main() {

    let ETH = "100";
    let WEI = ethers.parseUnits(ETH, "ether");

    console.log(ETH, "eth", WEI, "wei");

    WEI = 1000n;
    ETH = ethers.formatEther(WEI);

    console.log(ETH, "eth", WEI, "wei");
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