// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract PublicSale is
    Initializable,
    PausableUpgradeable,
    AccessControlUpgradeable,
    UUPSUpgradeable
{
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant UPGRADER_ROLE = keccak256("UPGRADER_ROLE");

    // Mi Primer Token
    // Crear su setter
    IERC20Upgradeable miPrimerToken;

    using Counters for Counters.Counter;
    Counters.Counter public _totalSupply;
    // 17 de Junio del 2023 GMT
    uint256 constant startDate = 1686960000;

    // Maximo price NFT
    uint256 constant MAX_PRICE_NFT = 50000 * 10 ** 18;

    // Gnosis Safe
    // Crear su setter
    address gnosisSafeWallet;

    mapping(uint256 =>bool)isNFTMinted;
    uint256[] listIDsNotMinted;

    event DeliverNft(address winnerAccount, uint256 nftId);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize() public initializer {
        __Pausable_init();
        __AccessControl_init();
        __UUPSUpgradeable_init();

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        _grantRole(UPGRADER_ROLE, msg.sender);
        initializeNotMintedArray();
    }

    function purchaseNftById(uint256 _id) external {
        // Realizar 3 validaciones:
        // 1 - el id no se haya vendido. Sugerencia: llevar la cuenta de ids vendidos
        //         * Mensaje de error: "Public Sale: id not available"
        // 2 - el msg.sender haya dado allowance a este contrato en suficiente de MPRTKN
        //         * Mensaje de error: "Public Sale: Not enough allowance"
        // 3 - el msg.sender tenga el balance suficiente de MPRTKN
        //         * Mensaje de error: "Public Sale: Not enough token balance"
        // 4 - el _id se encuentre entre 1 y 30
        //         * Mensaje de error: "NFT: Token id out of range"




        require(_id >= 1 && _id <= 30, "NFT: Token id out of range");
        require(!isNFTMinted[_id], "Public Sale: id not available");
        


        // Obtener el precio segun el id
        uint256 priceNft = getPriceById(_id);

        require(priceNft > 0, "Public Sale: Invalid NFT price");
        require(miPrimerToken.allowance(msg.sender, address(this)) >= priceNft, "Public Sale: Not enough allowance");
        require(miPrimerToken.balanceOf(msg.sender) >= priceNft, "Public Sale: Not enough token balance");


        updateTokenMinted(_id);
        // Purchase fees
        // 10% para Gnosis Safe (fee)
        // 90% se quedan en este contrato (net)
        // from: msg.sender - to: gnosisSafeWallet - amount: fee
        // from: msg.sender - to: address(this) - amount: net
        miPrimerToken.transferFrom(msg.sender, gnosisSafeWallet, (priceNft*10)/100); // 10% fee
        miPrimerToken.transferFrom(msg.sender, address(this), (priceNft*90)/100); // net amount

      


        // EMITIR EVENTO para que lo escuche OPEN ZEPPELIN DEFENDER
        emit DeliverNft(msg.sender, _id);
    }

    function depositEthForARandomNft() public payable {
        // Realizar 2 validaciones
        // 1 - que el msg.value sea mayor o igual a 0.01 ether
        // 2 - que haya NFTs disponibles para hacer el random

        require(msg.value >= 0.01 ether, "Public Sale: Insufficient Ether amount");
        require(listIDsNotMinted.length >0, "No hay tokens disponibles en lista");

        // Escgoer una id random de la lista de ids disponibles
        uint256 nftId = _getRandomNftId();

        // Enviar ether a Gnosis Safe
        // SUGERENCIA: Usar gnosisSafeWallet.call para enviar el ether
        // Validar los valores de retorno de 'call' para saber si se envio el ether correctamente
        
        updateTokenMinted(nftId);
        

        // Dar el cambio al usuario
        // El vuelto seria equivalente a: msg.value - 0.01 ether
        if (msg.value > 0.01 ether) {
            // logica para dar cambio
            // usar '.transfer' para enviar ether de vuelta al usuario
            uint256 change = msg.value - 0.01 ether;
            payable(msg.sender).transfer(change);
        }
        call(gnosisSafeWallet,0.01 ether);

        // EMITIR EVENTO para que lo escuche OPEN ZEPPELIN DEFENDER
        emit DeliverNft(msg.sender, nftId);
    }

    // PENDING
    // Crear el metodo receive
    receive() external payable {
        depositEthForARandomNft();
    }

    ////////////////////////////////////////////////////////////////////////
    /////////                    Helper Methods                    /////////
    ////////////////////////////////////////////////////////////////////////

    // Devuelve un id random de NFT de una lista de ids disponibles

    // Según el id del NFT, devuelve el precio. Existen 3 grupos de precios
    // Definir una variable global para almacenar el timestamp actual en epoch
    

    function getPriceById(uint256 _id) internal view returns (uint256) {
            
        if (_id > 0 && _id < 11) {
            
        } else if (_id > 10 && _id < 21) {
           
            return _id * 1000;
        } else {
           
            uint256 hoursPassed = (block.timestamp - startDate) / 3600; // 1623888000 es el timestamp correspondiente a las 00:00 horas del 17 de Junio del 2023 GMT
            
            uint256 basePrice = 10000; // Precio base de un NFT legendario
            uint256 hourlyIncrement = 1000; // Incremento horario del precio de un NFT legendario
            uint256 maxPrice = 50000; // Precio máximo de un NFT legendario
            
            uint256 price = basePrice + hoursPassed * hourlyIncrement;
            
            price = price > maxPrice ? maxPrice : price;
                
            return price;
        }
    }

    function pause() public onlyRole(PAUSER_ROLE) {
            _pause();
        }

    function unpause() public onlyRole(PAUSER_ROLE) {
            _unpause();
        }

    function _authorizeUpgrade(
            address newImplementation
        ) internal override onlyRole(UPGRADER_ROLE) {}    
    

    function initializeNotMintedArray() internal {
        for (uint i = 1; i <= 30; i++) {
            listIDsNotMinted.push(i);
        }
    }

    function updateTokenMinted(uint256 _id) internal {
        _removeIDnotMinted(_id);
        isNFTMinted[_id] = true;
        
        _totalSupply.increment();
    }

    function _removeIDnotMinted(uint256 _id) internal {
        for (uint i = 0; i < listIDsNotMinted.length; i++) {
            if (listIDsNotMinted[i] == _id) {
                listIDsNotMinted[i] = listIDsNotMinted[listIDsNotMinted.length - 1];
                listIDsNotMinted.pop();
                break;
            }
        }
    }


    function setGnosisSafeWallet(
        address _safeWallet
    ) public onlyRole(DEFAULT_ADMIN_ROLE) {
        gnosisSafeWallet = _safeWallet;
    }
    function setTokenAddress(
            address _tknAdress
        ) external onlyRole(DEFAULT_ADMIN_ROLE) {
            miPrimerToken = IERC20Upgradeable(_tknAdress);
    }

    function call(address _scAddress, uint256 _amount) internal {
        (bool success,) = payable(_scAddress).call{
            value: _amount,
            gas: 5000000
        }("");
        // error indica el error por el cual fallo
        require(success, "No se completo pago a gnosis");
    }
// Devuelve un id random de NFT de una lista de ids disponibles
    function _getRandomNftId() internal view returns (uint256) {
        uint256 long=listIDsNotMinted.length;
        require(long > 0, "No hay token disponibles");
        uint256 ramdom = (uint(
            keccak256(abi.encodePacked(block.difficulty, block.timestamp))
        ) % long);

        return listIDsNotMinted[ramdom];
    }

}
