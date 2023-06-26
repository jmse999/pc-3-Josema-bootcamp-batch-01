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

var MINTER_ROLE = getRole("MINTER_ROLE");
var BURNER_ROLE = getRole("BURNER_ROLE");

async function deployMumbai() {
  var relayerAddress = "0xeb0868cf925105ac466c2b19039301e904061514";
  var name = "Mi Primer NFT";
  var symbol = "MPRNFT";
  var nftContract = await deploySC("MiPrimerNft", [name, symbol]);
  var implementation = await printAddress("NFT", nftContract.address);

  // set up
  await ex(nftContract, "grantRole", [MINTER_ROLE, relayerAddress], "GR");

  await verify(implementation, "MiPrimerNft", []);
}


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

// deployMumbai()
deployMumbai()
  //
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
