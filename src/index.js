import { BigNumber, Contract, providers, ethers, utils } from "ethers";
import address from "./tokens.json";
const nftTknAbi = require("../artifacts/contracts/NFT.sol/MiPrimerNft.json").abi;
const publicSaleAbi = require("../artifacts/contracts/PublicSale.sol/PublicSale.json").abi;
const usdcTknAbi = require("../artifacts/contracts/USDCoin.sol/USDCoin.json").abi;
const miPrimerTknAbi = require("../artifacts/contracts/MiPrimerToken.sol/MiPrimerToken.json").abi;


window.ethers = ethers;

var provider, signer, account;
var usdcTkContract, miPrTokenContract, nftTknContract, pubSContract;

 
// REQUIRED
// Conectar con metamask
function initSCsGoerli() {
  provider = new providers.Web3Provider(window.ethereum);
  const usdcAddress = address.usdc;
  const miPrTknAdd = address.miPrTkn;
  const pubSContractAdd = address.publicSale;
  usdcTkContract = new Contract(usdcAddress, usdcTknAbi, provider);
  miPrTokenContract = new Contract(miPrTknAdd, miPrimerTknAbi, provider);
  pubSContract = new Contract(pubSContractAdd, publicSaleAbi, provider);
}

// OPTIONAL
// No require conexion con Metamask
// Usar JSON-RPC
// Se pueden escuchar eventos de los contratos usando el provider con RPC
function initSCsMumbai() {
  var nftAddress;
  nftTknContract; // = new Contract...
}

function setUpListeners() {
  // Connect to Metamask
}

function setUpEventsContracts() {
  // nftTknContract.on
}

async function setUp() {
  initSCsGoerli();
  initSCsMumbai();
  await setUpListeners();
  setUpEventsContracts();
}

setUp()
  .then()
  .catch((e) => console.log(e));
