// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract Nestad1155 is ERC1155, Ownable, ReentrancyGuard, IERC2981 {
    using Strings for uint256;

    string public name;
    string public symbol;
    string public baseUri;
    bytes32 private root;
    mapping(address => uint256) private mintedPerWallet;
    uint256 public minted;

    struct CollectionConfig {
        uint256 maxTokens;
        uint256 mintPrice;
        uint256 whitelistPrice;
        uint256 maxMintPerTx;
        uint256 maxMintPerWallet;
    }

    struct SaleConfig {
        bool hasWhitelist;
        uint256 whitelistStart;
        uint256 whitelistEnd;
        uint256 publicSaleStart;
        uint256 publicSaleEnd;
    }

    CollectionConfig public collectionConfig;
    SaleConfig public saleConfig;

    bool public isPublicSaleActive = true;
    bool public isWhitelistActive;

    uint256 public royaltyFee;
    address public constant PLATFORM_ADDRESS =
        0xf26EAb233B0a2b499FC21F4452fAC03263030765;
    uint256 public constant PLATFORM_ROYALTY = 100; // 1%

    event TokensMinted(address indexed minter, uint256 amount);
    event RootUpdated(bytes32 newRoot);
    event BaseURISet(string newBaseURI);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseUri,
        CollectionConfig memory _collectionConfig,
        SaleConfig memory _saleConfig,
        uint256 _royaltyFee,
        bytes32 _root
    ) ERC1155(_baseUri) {
        name = _name;
        symbol = _symbol;
        root = _root;
        collectionConfig = _collectionConfig;
        saleConfig = _saleConfig;
        baseUri = _baseUri;
        isWhitelistActive = _saleConfig.hasWhitelist;

        require(
            _royaltyFee + PLATFORM_ROYALTY <= 1000,
            "Total royalty cannot exceed 10%"
        );
        royaltyFee = _royaltyFee;
    }

    function whitelistMint(
        bytes32[] memory proof,
        uint256 amount
    ) external payable {
        require(isWhitelistActive, "Whitelist sale is disabled");
        require(
            _isSaleActive(saleConfig.whitelistStart, saleConfig.whitelistEnd),
            "Whitelist sale not active"
        );
        require(
            isValid(proof, keccak256(abi.encodePacked(msg.sender))),
            "Not whitelisted"
        );
        _mintNFT(amount, true);
    }

    function publicMint(uint256 amount) external payable {
        require(
            !saleConfig.hasWhitelist ||
                block.timestamp >= saleConfig.whitelistEnd,
            "Public mint not allowed yet"
        );
        require(
            _isSaleActive(saleConfig.publicSaleStart, saleConfig.publicSaleEnd),
            "Public sale not active"
        );
        require(isPublicSaleActive, "Public sale is disabled");

        _mintNFT(amount, false);
    }

    function _mintNFT(uint256 amount, bool isWhitelist) internal {
        require(amount > 0, "Amount must be greater than zero");
        require(
            minted + amount <= collectionConfig.maxTokens,
            "Exceeds max supply"
        );

        uint256 mintCost = isWhitelist
            ? collectionConfig.whitelistPrice
            : collectionConfig.mintPrice;
        require(amount * mintCost <= msg.value, "Incorrect MON value");

        _mint(msg.sender, 0, amount, "");
        minted += amount;

        emit TokensMinted(msg.sender, amount);
    }

    function _isSaleActive(
        uint256 startTime,
        uint256 endTime
    ) internal view returns (bool) {
        return
            (startTime == 0 || block.timestamp >= startTime) &&
            (endTime == 0 || block.timestamp <= endTime);
    }

    function isValid(
        bytes32[] memory proof,
        bytes32 leaf
    ) public view returns (bool) {
        return MerkleProof.verify(proof, root, leaf);
    }

    function setRoot(bytes32 _root) external onlyOwner {
        root = _root;
        emit RootUpdated(_root);
    }

    function setBaseURI(string memory _baseUri) external onlyOwner {
        baseUri = _baseUri;
        emit BaseURISet(_baseUri);
    }

    function royaltyInfo(
        uint256,
        uint256 _salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        uint256 totalRoyalty = (_salePrice * (royaltyFee + PLATFORM_ROYALTY)) /
            10000;
        return (address(this), totalRoyalty);
    }

    function totalSupply() external view returns (uint256) {
        return minted;
    }

    function uri(uint256) public view override returns (string memory) {
        return baseUri;
    }

    function withdrawAll() external nonReentrant onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No funds available");

        uint256 platformCut = (contractBalance * PLATFORM_ROYALTY) / 10000;
        uint256 ownerCut = contractBalance - platformCut;

        payable(PLATFORM_ADDRESS).transfer(platformCut);
        payable(owner()).transfer(ownerCut);
    }
}
