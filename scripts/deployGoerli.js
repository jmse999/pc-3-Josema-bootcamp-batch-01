require("dotenv").config();
const env = require("hardhat");
const {
  getRole,
  verify,
  ex,
  printAddress,
  deploySC,
  deploySCNoUp,
} = require("../utils");

const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

async function deployPublicSale(tokenAddress) {
    var gnosis = { address: "0x269d5A1417Ed1B87436485B1d6E7b7842CA8D7Bf" };
    let publicSaleContract = await deploySC("PublicSale", []);
    let implementation = await printAddress("Token PublicSale :", publicSaleContract.address);
    await ex(publicSaleContract, "setTokenAddress", [tokenAddress]);
    await ex(publicSaleContract, "setGnosisSafeWallet", [gnosis.address]);
    await verify(implementation, "PublicSale");
}
async function deployGoerli() {
  
    let tokenMPTKAddress = await deployMPTKN();
    await deployPublicSale(tokenMPTKAddress);
    await deployUSDC();
  
}
  async function deployUSDC() {
    let usdcContract = await deploySCNoUp("USDCoin", []);
    await verify(usdcContract.address, "USDCoin", []);
    return usdcContract.address;
}
async function deployMPTKN() {
  
    let tokenMPTK = await deploySC("MiPrimerToken", []);
    let implementation = await printAddress("MPTKN Token ERC20 :", tokenMPTK.address);
    await verify(implementation, "MiPrimerToken", []);
    
    return tokenMPTK.address;
}

deployGoerli()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });

