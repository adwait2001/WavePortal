require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});
module.exports = {
  solidity: "0.8.4",
  networks: {
    polygon_testnet: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/41cjZCqvrWErgubjvfjLPZmS5hPgsV2V",
      accounts: ["7af47912a2319b59633d69f601513c1e91bb26d7bfa0016544d3198bd3402104"]
    },
  },
};
