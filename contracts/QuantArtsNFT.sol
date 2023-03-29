// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract QuantArtsNFT is ERC721, Ownable {
    using Strings for uint256;
    using ECDSA for bytes32;

    uint256 constant public maxSupply = 99;
    uint256 constant public minimumSoldSuplyNeeded = 60;
    uint256 constant public maxMintAmount = 3;
    uint256 constant public referralPercentage = 1000;
    uint256 constant public marketingPercentage = 1500;
    uint256 constant public divFactor = 10000;
    uint256 constant public minimumMintCost = 250 ether;
    bytes[] public authHashes;
    uint256 public totalSupply = 0;
    uint256 public publicMintCost = 450 ether;
    uint256 public guaranteedAirdropSupply = 3;
    uint256 public guaranteedWLSupply = 3;
    address public paymentToken;
    address public marketingAccount;
    address public signer;
    string public baseURI;
    string public baseExtension = ".json";
    uint256 public whitelistStartTimestamp = 0;
    uint256 public publicStartTimestamp = 0;
    uint256 public mintFinishTimestamp = 0;
    uint256 public guaranteedWLTimestamp = 0;
    uint256 public ownerBalance = 0;
    mapping(address => uint256) public alreadyMintedAmount;
    mapping(address => uint256) public mintPaidAmounts;
    mapping(address => bool) public hasWhitelistAccountAlreadyMinted;

    struct MintAmounts {
        uint256 totalMintCost;
        uint256 refundableAmount;
        uint256 referralAmount;
    }

    struct MintCheckInfo {
        uint256 mintAmount;
        address referrer;
        uint256 maxAmount;
        uint256 unitPrice;
        bool isGuaranteed;
        bytes signature;
        bool isWhitelist;
    }

    event OwnerClaimed(address indexed to, uint256 amount);
    event Refunded(address indexed to, uint256 amount);
    event Mint(address indexed to, address indexed referrer,uint256 amount, uint256 unitPrice);

    constructor(string memory _name, string memory _symbol, address _signer, address _paymentToken, address _marketingAccount, string memory _initBaseURI, 
                uint256 _initWhitelistStartTimestamp, uint256 _initPublicStartTimestamp, uint256 _initMintFinishTimestamp, uint256 _initGuaranteedWLTimestamp) ERC721(_name, _symbol) {
        setBaseURI(_initBaseURI);
        setWhitelistStartTimestamp(_initWhitelistStartTimestamp);
        setPublicStartTimestamp(_initPublicStartTimestamp);
        setMintFinishTimestamp(_initMintFinishTimestamp);
        setGuaranteedWLTimestamp(_initGuaranteedWLTimestamp);
        setPaymentToken(_paymentToken);
        setMarketingAccount(_marketingAccount);
        setSigner(_signer);
        addAuthHash(bytes("0x784c3e712e86c80f42fcde15c79019dd3a4792105b5e03744ced5253c545433c"));
    }

    function setPublicMintCost(uint256 _newPublicMintCost) public onlyOwner {
        publicMintCost = _newPublicMintCost;
    }

    function addAuthHash(bytes memory _newAuthHash) public onlyOwner {
        authHashes.push(_newAuthHash);
    }

    function setGuaranteedAirdropSupply(uint256 _newGuaranteedAirdropSupply) public onlyOwner {
        guaranteedAirdropSupply = _newGuaranteedAirdropSupply;
    }

    function setGuaranteedWLSupply(uint256 _newGuaranteedWLSupply) public onlyOwner {
        guaranteedWLSupply = _newGuaranteedWLSupply;
    }

    function setSigner(address _newSigner) public onlyOwner {
        signer = _newSigner;
    }

    function setPaymentToken(address _newPaymentToken) public onlyOwner {
        paymentToken = _newPaymentToken;
    }

    function setMarketingAccount(address _newMarketingAccount) public onlyOwner {
        marketingAccount = _newMarketingAccount;
    }

    function setBaseURI(string memory _newBaseURI) public onlyOwner {
        baseURI = _newBaseURI;
    }

    function setBaseExtension(string memory _newBaseExtension) public onlyOwner {
        baseExtension = _newBaseExtension;
    }

    function setGuaranteedWLTimestamp(uint256 _newGuaranteedWLTimestamp) public onlyOwner {
        require(_newGuaranteedWLTimestamp >= whitelistStartTimestamp && _newGuaranteedWLTimestamp < publicStartTimestamp, "QuantArtsNFT: Incorect guaranteed timestamp");
        guaranteedWLTimestamp = _newGuaranteedWLTimestamp;
    }

    function setWhitelistStartTimestamp(uint256 _newWhitelistStartTimestamp) public onlyOwner {
        whitelistStartTimestamp = _newWhitelistStartTimestamp;
    }

    function setPublicStartTimestamp(uint256 _newPublicStartTimestamp) public onlyOwner {
        require(_newPublicStartTimestamp >= whitelistStartTimestamp, "QuantArtsNFT: Public timestamp is before whitelist timestamp");
        publicStartTimestamp = _newPublicStartTimestamp;
    }

    function setMintFinishTimestamp(uint256 _newMintFinishTimestamp) public onlyOwner {
        require(_newMintFinishTimestamp >= publicStartTimestamp, "QuantArtsNFT: Mint finish timestamp is before public timestamp");
        mintFinishTimestamp = _newMintFinishTimestamp;
    }

    function redeemOwnerBalance(address payable _to) public onlyOwner {
        require(totalSupply >= minimumSoldSuplyNeeded, "QuantArtsNFT: Minimum sold supply is not reached");
        uint256 amount = ownerBalance;
        ownerBalance = 0;
        TransferHelper.safeTransfer(paymentToken ,_to, amount);
        emit OwnerClaimed(_to, amount);
    }

    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory){
        require(_exists(_tokenId), "ERC721Metadata: URI query for nonexistent token");
        string memory currentBaseURI = _baseURI();
        return bytes(currentBaseURI).length > 0 ? string(abi.encodePacked(currentBaseURI, _tokenId.toString(), baseExtension)) : "";
    }

    function mint(uint256 _mintAmount) external {
        MintCheckInfo memory info;
        info.mintAmount = _mintAmount;
        checkCorrectMint(info);
        alreadyMintedAmount[_msgSender()] += _mintAmount;
        MintAmounts memory amounts;
        amounts.totalMintCost = publicMintCost * _mintAmount;
        amounts.refundableAmount =  (amounts.totalMintCost * (divFactor - marketingPercentage)) / divFactor;
        mintPaidAmounts[_msgSender()] += amounts.refundableAmount;
        ownerBalance += amounts.refundableAmount;
        TransferHelper.safeTransferFrom(paymentToken, _msgSender(), address(this), amounts.totalMintCost);
        TransferHelper.safeTransfer(paymentToken, marketingAccount, (amounts.totalMintCost - amounts.refundableAmount));
        for (uint256 i = 0; i < _mintAmount; i++) {
            totalSupply++;
            _safeMint(_msgSender(), totalSupply - 1);
        }
        emit Mint(_msgSender(), address(0), _mintAmount, publicMintCost);
    }

    function mintReferred(uint256 _mintAmount, address _referrer) external {
         MintCheckInfo memory info;
        info.mintAmount = _mintAmount;
        checkCorrectMint(info);
        require(_referrer != _msgSender(), "QuantArtsNFT: Referrer cannot be equal to msg sender");
        require(_referrer != address(0), "QuantArtsNFT: Referral cannot be address zero");
        alreadyMintedAmount[_msgSender()] += _mintAmount;
        MintAmounts memory amounts;
        amounts.totalMintCost = publicMintCost * _mintAmount;
        amounts.refundableAmount =  (amounts.totalMintCost * (divFactor - marketingPercentage - referralPercentage)) / divFactor;
        mintPaidAmounts[_msgSender()] += amounts.refundableAmount;
        amounts.referralAmount = (amounts.totalMintCost * referralPercentage) / divFactor;
        ownerBalance += amounts.refundableAmount;
        TransferHelper.safeTransferFrom(paymentToken, _msgSender(), address(this), amounts.totalMintCost);
        TransferHelper.safeTransfer(paymentToken, _referrer, amounts.referralAmount);
        TransferHelper.safeTransfer(paymentToken, marketingAccount, amounts.totalMintCost - (amounts.referralAmount + amounts.refundableAmount));
        for (uint256 i = 0; i < _mintAmount; i++) {
            totalSupply++;
            _safeMint(_msgSender(), totalSupply - 1);
        }
        emit Mint(_msgSender(), _referrer, _mintAmount, publicMintCost);
    }

    function whitelistMint(uint256 _mintAmount, address _referrer, uint256 _maxAmount, 
                           uint256 _unitPrice , bool _isGuaranteed, bytes calldata _signature) external {
        MintCheckInfo memory info;
        info.mintAmount = _mintAmount;
        info.referrer = _referrer;
        info.maxAmount = _maxAmount;
        info.unitPrice = _unitPrice;
        info.isGuaranteed = _isGuaranteed;
        info.signature = _signature;
        info.isWhitelist = true;
        checkCorrectMint(info);
        hasWhitelistAccountAlreadyMinted[_msgSender()] = true;
        alreadyMintedAmount[_msgSender()] += _mintAmount;
        MintAmounts memory amounts;
        amounts.totalMintCost = _unitPrice * _mintAmount;
        amounts.refundableAmount =  (amounts.totalMintCost * (divFactor - marketingPercentage - referralPercentage)) / divFactor;
        mintPaidAmounts[_msgSender()] += amounts.refundableAmount;
        amounts.referralAmount = (amounts.totalMintCost * referralPercentage) / divFactor;
        ownerBalance += amounts.refundableAmount;
        TransferHelper.safeTransferFrom(paymentToken, _msgSender(), address(this), amounts.totalMintCost);
        TransferHelper.safeTransfer(paymentToken, _referrer, amounts.referralAmount);
        TransferHelper.safeTransfer(paymentToken, marketingAccount, amounts.totalMintCost - (amounts.referralAmount + amounts.refundableAmount));
        for (uint256 i = 0; i < _mintAmount; i++) {
            totalSupply++;
            _safeMint(_msgSender(), totalSupply - 1);
        }
        emit Mint(_msgSender(), _referrer, _mintAmount, _unitPrice);
    }

    function airdrop(address[] calldata _receivers ,uint256[] calldata amounts) external onlyOwner {
        require(_receivers.length == amounts.length, "QuantArtsNFT: Array lengths are not equal");
        for (uint256 i = 0; i < _receivers.length; i++) {
            require(amounts[i] > 0, "QuantArtsNFT: Airdrop amount is zero");
            require(totalSupply + amounts[i] <= maxSupply, "QuantArtsNFT: Mint amount is bigger than supply left");
            for (uint256 j = 0; j < amounts[i]; j++) {
                totalSupply++;
                _safeMint(_receivers[i], totalSupply - 1);
            }
        }
    }

   function refundMint() external {
        require(totalSupply < minimumSoldSuplyNeeded, "QuantArtsNFT: Minimum sold supply has been reached");
        require(block.timestamp >= mintFinishTimestamp, "QuantArtsNFT: Mint has not finished");
        uint256 refundAmount = mintPaidAmounts[_msgSender()];
        require(refundAmount > 0, "QuantArtsNFT: User has not minted any tokens");
        mintPaidAmounts[_msgSender()] = 0;
        TransferHelper.safeTransfer(paymentToken ,_msgSender(), refundAmount);
        emit Refunded(_msgSender(), refundAmount);
    }

    function checkCorrectMint(MintCheckInfo memory _info) internal view returns (bool){
        if (totalSupply < minimumSoldSuplyNeeded) {
            require(block.timestamp < mintFinishTimestamp, "QuantArtsNFT: Mint has finished");
        }
        require(block.timestamp > whitelistStartTimestamp, "QuantArtsNFT: Whitelist mint has not started yet");
        if (block.timestamp < publicStartTimestamp) {
            require(_info.isWhitelist, "QuantArtsNFT: Method is not WL mint");
            require(_info.unitPrice >= minimumMintCost, "QuantArtsNFT: UnitPrice is less than minimum");
            require(!hasWhitelistAccountAlreadyMinted[_msgSender()], "QuantArtsNFT: User has already minted with WL");
            require(_info.mintAmount <= _info.maxAmount, "QuantArtsNFT: Mint amount is bigger than WL max amount");
            require(_info.referrer != _msgSender(), "QuantArtsNFT: Referrer cannot be equal to msg sender");
            require(_info.referrer != address(0), "QuantArtsNFT: Referral cannot be address zero");
            bytes32 messageHash = keccak256(abi.encodePacked(_msgSender(), _info.referrer, _info.maxAmount, _info.unitPrice, _info.isGuaranteed));
            bytes32 ethHash = messageHash.toEthSignedMessageHash();
            address messageSigner = ethHash.recover(_info.signature);
            require(messageSigner == signer, "QuantArtsNFT: Signer is not valid");
            if (block.timestamp < guaranteedWLTimestamp && !_info.isGuaranteed ) {
                require(totalSupply + _info.mintAmount <= maxSupply - guaranteedAirdropSupply - guaranteedWLSupply, "QuantArtsNFT: Mint amount is bigger than supply left");
            } else {
                require(totalSupply + _info.mintAmount <= maxSupply - guaranteedAirdropSupply, "QuantArtsNFT: Mint amount is bigger than supply left");
            }
        } else {
            require(!_info.isWhitelist, "QuantArtsNFT: Method is WL mint");
            require(totalSupply + _info.mintAmount <= maxSupply - guaranteedAirdropSupply, "QuantArtsNFT: Mint amount is bigger than supply left");
            require(_info.mintAmount <= maxMintAmount - alreadyMintedAmount[_msgSender()], "QuantArtsNFT: Already minted amount is bigger than maxMintAmount");
        }
        require(_info.mintAmount > 0, "QuantArtsNFT: Mint amount is zero");
        return true;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return baseURI;
    }
}