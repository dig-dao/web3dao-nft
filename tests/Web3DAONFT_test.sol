// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;
import "remix_tests.sol";
import "remix_accounts.sol";
import "../contracts/Web3DAONFT.sol";

contract Web3DAONFTTest {
    address _owner;
    address acc1;
    address acc2;

    Web3DAOToken s;
    /// #sender: account-0
    function beforeAll () public {
        _owner = TestsAccounts.getAccount(0); 
        acc1 = TestsAccounts.getAccount(1);
        acc2 = TestsAccounts.getAccount(2);
        s = new Web3DAOToken("Web3 DAO NFT", "Web3DAO", 5);
    }

    function testTokenNameAndSymbol () public {
        Assert.equal(s.name(), "Web3 DAO NFT", "token name did not match");
        Assert.equal(s.symbol(), "Web3DAO", "token symbol did not match");
    }
    /// #sender: account-0
    function checkSenderIs0 () public payable {
        Assert.equal(msg.sender, TestsAccounts.getAccount(0), "wrong sender in checkSenderIs0");
    }
    /// #sender: account-0
    function checkMintTransfer () public payable {
        address[] memory _toAddresses;
        string[] memory _imageURIs;
        string[] memory _externalURIs;
        _toAddresses[0] = acc1;
        _toAddresses[1] = acc2;
        _imageURIs[0] = "ipfs://Qmb9UCEVhTF37noQQa8qmyVF7U4Wj6gytVEQXevKN9NxCg";
        _imageURIs[1] = "ipfs://Qmb9UCEVhTF37noQQa8qmyVF7U4Wj6gytVEQXevKN9NxCg";
        _externalURIs[0] = "https://example.com/";
        _externalURIs[1] = "https://example.com/";
        s.mintAndTransfer("My Test", _toAddresses, _imageURIs, _externalURIs);
    }

}