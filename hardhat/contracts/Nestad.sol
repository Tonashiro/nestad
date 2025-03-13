// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";

contract Nestad is ERC721, Ownable, ReentrancyGuard, IERC2981 {
    using Strings for uint256;

    // Variables
    bytes32 private root;
    uint256 public totalSupply;
    mapping(address => uint256) private mintedPerWallet;
    string public baseUri;

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

    // Royalty Info
    uint256 public royaltyFee;
    address public constant PLATFORM_ADDRESS =
        0xf26EAb233B0a2b499FC21F4452fAC03263030765;
    uint256 public constant PLATFORM_ROYALTY = 100; // 1%

    // Events
    event SaleStateUpdated(bool isPublicSaleActive, bool isWhitelistActive);
    event BaseURISet(string newBaseURI);
    event PriceUpdated(uint256 newPrice);
    event MaxMintUpdated(uint256 newMaxMintPerTx, uint256 newMaxMintPerWallet);
    event TokensMinted(address indexed minter, uint256 amount);
    event FundsWithdrawn(address indexed owner, uint256 amount);
    event RootUpdated(bytes32 newRoot);
    event RoyaltyUpdated(uint256 newRoyaltyFee);
    event SaleTimesUpdated(
        uint256 whitelistStart,
        uint256 whitelistEnd,
        uint256 publicSaleStart,
        uint256 publicSaleEnd
    );

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _baseUri,
        CollectionConfig memory _collectionConfig,
        SaleConfig memory _saleConfig,
        uint256 _royaltyFee,
        bytes32 _root
    ) ERC721(_name, _symbol) {
        root = _root;
        collectionConfig = _collectionConfig;
        saleConfig = _saleConfig;
        baseUri = _baseUri;
        isWhitelistActive = _saleConfig.hasWhitelist;

        // Ensure the royalty does not exceed 10%
        require(
            _royaltyFee + PLATFORM_ROYALTY <= 1000,
            "Total royalty cannot exceed 10%"
        );
        royaltyFee = _royaltyFee;

        collectionConfig.whitelistPrice = _collectionConfig.whitelistPrice;

        saleConfig.whitelistStart = _saleConfig.whitelistStart;
        saleConfig.whitelistEnd = _saleConfig.whitelistEnd;
        saleConfig.publicSaleStart = _saleConfig.publicSaleStart;
        saleConfig.publicSaleEnd = _saleConfig.publicSaleEnd;

        emit SaleTimesUpdated(
            _saleConfig.whitelistStart,
            _saleConfig.whitelistEnd,
            _saleConfig.publicSaleStart,
            _saleConfig.publicSaleEnd
        );
    }

    // Mint Functions (Whitelist & Public)

    function whitelistMint(
        bytes32[] memory proof,
        uint256 _amount
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

        _mintNFT(_amount, true);
    }

    function publicMint(uint256 _amount) external payable {
        require(
            !saleConfig.hasWhitelist ||
                block.timestamp >= saleConfig.whitelistEnd,
            "Public minting is not allowed before whitelist ends"
        );
        require(isPublicSaleActive, "Public sale is disabled");
        require(
            _isSaleActive(saleConfig.publicSaleStart, saleConfig.publicSaleEnd),
            "Public sale not active"
        );

        _mintNFT(_amount, false);
    }

    function _mintNFT(uint256 _amount, bool isWhitelist) internal {
        require(
            _amount <= collectionConfig.maxMintPerTx,
            "Exceeds max mint per transaction"
        );
        require(
            mintedPerWallet[msg.sender] + _amount <=
                collectionConfig.maxMintPerWallet,
            "Exceeds wallet mint limit"
        );
        require(
            totalSupply + _amount <= collectionConfig.maxTokens,
            "Exceeds max supply"
        );

        uint256 mintCost = isWhitelist
            ? collectionConfig.whitelistPrice
            : collectionConfig.mintPrice;

        require(_amount * mintCost <= msg.value, "Incorrect MON value");

        for (uint256 i = 1; i <= _amount; ) {
            _safeMint(msg.sender, totalSupply + i);
            unchecked {
                i++;
            }
        }

        mintedPerWallet[msg.sender] += _amount;
        totalSupply += _amount;

        emit TokensMinted(msg.sender, _amount);
    }

    // Utility Functions

    function _isSaleActive(
        uint256 startTime,
        uint256 endTime
    ) internal view returns (bool) {
        return
            (startTime == 0 || block.timestamp >= startTime) &&
            (endTime == 0 || block.timestamp <= endTime);
    }

    function setSaleTimes(
        uint256 _whitelistStart,
        uint256 _whitelistEnd,
        uint256 _publicSaleStart,
        uint256 _publicSaleEnd
    ) external onlyOwner {
        saleConfig.whitelistStart = _whitelistStart;
        saleConfig.whitelistEnd = _whitelistEnd;
        saleConfig.publicSaleStart = _publicSaleStart;
        saleConfig.publicSaleEnd = _publicSaleEnd;

        emit SaleTimesUpdated(
            _whitelistStart,
            _whitelistEnd,
            _publicSaleStart,
            _publicSaleEnd
        );
    }

    function setRoyalty(uint256 _royaltyFee) external onlyOwner {
        require(
            _royaltyFee + PLATFORM_ROYALTY <= 1000,
            "Total royalty cannot exceed 10%"
        );
        royaltyFee = _royaltyFee;
        emit RoyaltyUpdated(_royaltyFee);
    }

    function royaltyInfo(
        uint256,
        uint256 _salePrice
    ) external view override returns (address receiver, uint256 royaltyAmount) {
        uint256 totalRoyalty = (_salePrice * (royaltyFee + PLATFORM_ROYALTY)) /
            10000;
        return (address(this), totalRoyalty);
    }

    function toggleWhitelistSale() external onlyOwner {
        isWhitelistActive = !isWhitelistActive;

        emit SaleStateUpdated(isPublicSaleActive, isWhitelistActive);
    }

    function togglePublicSale() external onlyOwner {
        isPublicSaleActive = !isPublicSaleActive;

        emit SaleStateUpdated(isPublicSaleActive, isWhitelistActive);
    }

    function isValid(
        bytes32[] memory proof,
        bytes32 leaf
    ) public view returns (bool) {
        return MerkleProof.verify(proof, root, leaf);
    }

    function setRoot(bytes32 _root) public onlyOwner {
        root = _root;

        emit RootUpdated(_root);
    }

    function setBaseURI(string memory _baseUri) external onlyOwner {
        baseUri = _baseUri;

        emit BaseURISet(_baseUri);
    }

    function setPrice(uint256 _price) external onlyOwner {
        collectionConfig.mintPrice = _price;

        emit PriceUpdated(_price);
    }

    function setWhitelistPrice(uint256 _whitelistPrice) external onlyOwner {
        collectionConfig.whitelistPrice = _whitelistPrice;

        emit PriceUpdated(_whitelistPrice);
    }

    function setMaxMintLimits(
        uint256 _maxMintPerTx,
        uint256 _maxMintPerWallet
    ) external onlyOwner {
        collectionConfig.maxMintPerTx = _maxMintPerTx;
        collectionConfig.maxMintPerWallet = _maxMintPerWallet;

        emit MaxMintUpdated(_maxMintPerTx, _maxMintPerWallet);
    }

    function tokenURI(
        uint256 tokenId
    ) public view virtual override returns (string memory) {
        require(
            _exists(tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        return
            bytes(baseUri).length > 0
                ? string(abi.encodePacked(baseUri, Strings.toString(tokenId)))
                : "";
    }

    function withdrawAll() external nonReentrant onlyOwner {
        uint256 contractBalance = address(this).balance;
        require(contractBalance > 0, "No funds available");

        uint256 platformCut = (contractBalance * PLATFORM_ROYALTY) / 10000;
        uint256 ownerCut = contractBalance - platformCut;

        payable(PLATFORM_ADDRESS).transfer(platformCut);
        payable(owner()).transfer(ownerCut);

        emit FundsWithdrawn(owner(), ownerCut);
    }
}
