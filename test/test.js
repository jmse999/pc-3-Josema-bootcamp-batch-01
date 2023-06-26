const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const { getRole, deploySC, deploySCNoUp, ex, pEth } = require("../utils");

const MINTER_ROLE = getRole("MINTER_ROLE");
const BURNER_ROLE = getRole("BURNER_ROLE");

// 17 de Junio del 2023 GMT
var startDate = 1686960000;

var makeBN = (num) => ethers.BigNumber.from(String(num));

describe("MI PRIMER TOKEN TESTING", function () {
  var nftContract, publicSale, miPrimerToken, usdc;
  var owner, gnosis, alice, bob, carl, deysi;
  var name = "Mi Primer NFT";
  var symbol = "MPRNFT";

  before(async () => {
    [owner, gnosis, alice, bob, carl, deysi] = await ethers.getSigners();
  });

  // Estos dos métodos a continuación publican los contratos en cada red
  // Se usan en distintos tests de manera independiente
  // Ver ejemplo de como instanciar los contratos en deploy.js
  async function deployNftSC() {
    const nftContract = await deploySC("MiPrimerNft",[name,symbol])
  }

  async function deployPublicSaleSC() {
    miPrimerToken = await deploySC("MiPrimerToken", []);

    publicSale = await deploySC("PublicSale", []);

    //Setup

    await ex(publicSale, "setTokenAddress", [miPrimerToken.address]);
    await ex(publicSale, "setGnosisSafeWallet", [gnosis.address]);

  }

  async function deployMiPrimeToken() {
    const MiPrimeToken = await ethers.getContractFactory("MiPrimeToken");
    const miPrimeToken = await MiPrimeToken.deploy();
    tx = await miPrimeToken.deployed(); 
  }

  describe("Mi Primer Nft Smart Contract", () => {
    //Se publica el contrato antes de cada test
    beforeEach(async () => {
      await deployNftSC();
    });

    it("Verifica nombre colección", async () => {
      const nftContract = await deploySC("MiPrimerNft",[name,symbol])
      expect((await nftContract.name())).to.equal(name);
    });

    it("Verifica símbolo de colección", async () => {
      const nftContract = await deploySC("MiPrimerNft",[name,symbol])
      expect((await nftContract.symbol())).to.equal(symbol);
    });

    it("No permite acuñar sin privilegio", async () => {
      const nftContract = await deploySC("MiPrimerNft",[name,symbol])
      await nftContract.connect(bob).saf;
  
    });

    it("No permite acuñar doble id de Nft", async () => {
      const nftContract = await deploySC("MiPrimerNft",[name,symbol]);
      await nftContract.safeMint(bob.address, 2);
      await expect(nftContract.safeMint(bob.address, 2)).to.be.revertedWith(
        "Public Sale: Token has been already minted"
      );
    });

    it("Verifica rango de Nft sea mayor a 0 y menor a 31]", async () => {
      const nftContract = await deploySC("MiPrimerNft", [name, symbol]);
      await nftContract.grantRole(await nftContract.MINTER_ROLE(), alice.address);
      await expect(nftContract.safeMint(alice.address, 0)).to.be.revertedWith(
        "NFT: Token id out of range"
      );
      await expect(nftContract.safeMint(alice.address, 31)).to.be.revertedWith(
        "NFT: Token id out of range"
      );
    });

    it("Se pueden acuñar todos (30) los Nfts", async () => {
      const nftContract = await deploySC("MiPrimerNft",[name,symbol]);
      
      // Mint all 30 NFTs
      for(let i = 1; i <= 30; i++) {
        await nftContract.safeMint(bob.address, i);
      }
    
      // Check that all tokens exist
      for(let i = 1; i <= 30; i++) {
        expect(await nftContract.exists(i)).to.be.true;
      }
    });
  });

  describe("Public Sale Smart Contract", () => {
    // Se publica el contrato antes de cada test
    // beforeEach(async () => {
    //   await deployPublicSaleSC();
    // });

    it("No se puede comprar otra vez el mismo ID", async () => {
      
    });

    // it("IDs aceptables: [1, 30]", async () => {
    //   await expect(publicSale.nftId).to.be.within(0, 31)
    //     .to.revertedWith("NFT: Token id out of range")
    // });

    // it("Usuario no dio permiso de MiPrimerToken a Public Sale", async () => {
    //   const res = await publicSale.connect(alice).isPermittedToMint(_collectionName, publicSale.nftId, {from: bob})
    //   expect(res.revertedWith("NFT: You do not have permission to mint")).to.be.true;
    // });

    // it("Usuario no tiene suficientes MiPrimerToken para comprar", async () => {
    //   const res = await publicSale.connect(alice).isTokenBalanceOf(_collectionName, bob, publicSale.nftId, {from: bob})
    //   const amountToMint = ethers.utils.parseEther('2');
    //   await miPrimerNft.connect(alice).transfer(publicSale.address, amountToMint, {from: bob})
    //   .then(() => {})
    //   expect(res.revertedWith("NFT: Insufficient tokens")).to.be.true;
      
    // });

    // describe("Compra grupo 1 de NFT: 1 - 10", () => {
    //   it("Emite evento luego de comprar", async () => {
    //     // modelo para validar si evento se disparo con correctos argumentos
    //     var tx = await publicSale.purchaseNftById(id);
    //     await expect(tx)
    //       .to.emit(publicSale, "DeliverNft")
    //       .withArgs(owner.address, counter);
    //   });

    //   it("Disminuye balance de MiPrimerToken luego de compra", async () => {
    //     // Usar changeTokenBalance
    //     // source: https://ethereum-waffle.readthedocs.io/en/latest/matchers.html#change-token-balance
        
    //     await expect(() => miPrimerToken.transfer(alice.address, 200))
    //     .to.changeTokenBalance(token, walletTo, 200);
    //   });

    //   it("Gnosis safe recibe comisión del 10% luego de compra", async () => {
    //     // Use gnosis safe to get the value of a token in its vault
        
        





    //   });

    //   it("Smart contract recibe neto (90%) luego de compra", async () => {});
    // });

    // describe("Compra grupo 2 de NFT: 11 - 20", () => {
    //   it("Emite evento luego de comprar", async () => {});

    //   it("Disminuye balance de MiPrimerToken luego de compra", async () => {});

    //   it("Gnosis safe recibe comisión del 10% luego de compra", async () => {});

    //   it("Smart contract recibe neto (90%) luego de compra", async () => {});
    // });

    // describe("Compra grupo 3 de NFT: 21 - 30", () => {
    //   it("Disminuye balance de MiPrimerToken luego de compra", async () => {});

    //   it("Gnosis safe recibe comisión del 10% luego de compra", async () => {});

    //   it("Smart contract recibe neto (90%) luego de compra", async () => {});
    // });

    // describe("Depositando Ether para Random NFT", () => {
    //   it("Método emite evento (30 veces) ", async () => {});

    //   it("Método falla la vez 31", async () => {});

    //   it("Envío de Ether y emite Evento (30 veces)", async () => {});

    //   it("Envío de Ether falla la vez 31", async () => {});

    //   it("Da vuelto cuando y gnosis recibe Ether", async () => {
    //     // Usar el método changeEtherBalances
    //     // Source: https://ethereum-waffle.readthedocs.io/en/latest/matchers.html#change-ether-balance-multiple-accounts
    //     // Ejemplo:
    //     // await expect(
    //     //   await owner.sendTransaction({
    //     //     to: publicSale.address,
    //     //     value: pEth("0.02"),
    //     //   })
    //     // ).to.changeEtherBalances(
    //     //   [owner.address, gnosis.address],
    //     //   [pEth("-0.01"), pEth("0.01")]
    //     // );
    //   });
    // });
  });
});
