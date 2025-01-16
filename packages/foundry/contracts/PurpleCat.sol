//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;


import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract PurpleCat is ERC721Enumerable, Ownable {
    mapping(address => bool) public mintlist;
    uint private _tokenIdCounter;
    uint public constant MAX_SUPPLY = 100;
    uint public constant PRICE = 0.001 ether;
    uint public constant MAX_PER_MINT = 3;

    string public baseTokenURI;

    constructor(string memory baseURI,address initialOwner) ERC721("Purple Cat", "PCAT") Ownable(initialOwner){
        setBaseURI(baseURI);
    }

    // mint 10 NFTs for free sell
    function reserveNFTs() public onlyOwner {
        uint totalMinted = _tokenIdCounter;
        require(totalMinted + 10 < MAX_SUPPLY, "Not enough NFTs");
        // free mint
        for (uint i = 0; i < 10; i++) {
            _mintSingleNFT();
        }
    }

    // getter func for baseURI
    function _baseURI() internal view virtual override returns (string memory) {
        return baseTokenURI;
    }

    // setter func for baseURI
    function setBaseURI(string memory _baseTokenURI) public onlyOwner {
        baseTokenURI = _baseTokenURI;
    }

    /**
     * mint NFT func 
     */
    function mintNFTs(uint _count) public payable{
        if(mintlist[msg.sender] == true){
            revert("Your are already mint");
        }
        // get token IDs
        uint totalMinted = _tokenIdCounter;
        // check fro mint NFT
        require(totalMinted + _count <= MAX_SUPPLY, "Not enough NFTs!");
        require(_count > 0 && _count <= MAX_PER_MINT, "Cannot mint specified number of NFTs.");
        require(msg.value >= PRICE * _count, "Not enough ether to purchase NFTs.");

        for (uint i = 0; i < _count; i++) {
            _mintSingleNFT();
        }
        mintlist[msg.sender] = true;
    }

    function _mintSingleNFT() private {
        uint newTokenID = _tokenIdCounter;
        // call _safeMint func
        _safeMint(msg.sender, newTokenID);
        _tokenIdCounter += 1;
    }

    // getter owner's all tokensId
    function tokensOfOwner(address _owner) external view returns (uint[] memory) {

        uint tokenCount = balanceOf(_owner);
        uint[] memory tokensId = new uint256[](tokenCount);

        for (uint i = 0; i < tokenCount; i++) {
            tokensId[i] = tokenOfOwnerByIndex(_owner, i);
        }

        return tokensId;
    }

    function withdraw() public payable onlyOwner {
        uint balance = address(this).balance;
        require(balance > 0, "No ether left to withdraw");
        // send ETH to msg.sender
        (bool success, ) = (msg.sender).call{value: balance}("");
        require(success, "Transfer failed.");
    }
}
