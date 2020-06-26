pragma solidity ^0.6.1;

import './zkToken.sol';

/** 
 *  Factory for zkTokens
 */
contract zkTokenFactory {

  /**
    * @notice Mappings for zkTokens
  */
  mapping(address => address) public token_zktoken;
  mapping(address => address) public zktoken_token;
  
  /**
    * @notice variables for zkTokens
  */
  uint public id;
  address public verifierDeposit;
  address public verifierWithdraw;
  address public verifierTransfer;

  /**
    * @notice Emits when an asset is created.
  */
  event CreateToken(address token, address creator);

  /**
    * @notice Constructor -> sets the verifiers for zkTokens
  */
  constructor(address _verifierDeposit, address _verifierWithdraw, address _verifierTransfer) public {
      verifierDeposit = _verifierDeposit;
      verifierWithdraw = _verifierWithdraw;
      verifierTransfer = _verifierTransfer;
  }

  /**
    * @dev Given an id returns the corresponding zkToken address
  */
  function getzkTokenAddress(address _token) public view returns(address) {
    return token_zktoken[_token];
  }

  /**
    * @dev Given an zkToken address returns the corresponding id
  */
  function getTokenAddress(address _zktoken) public view returns(address) {
    return zktoken_token[_zktoken];
  }

  /**
    * @dev Deploy a TrustlessFund contract.
  */
  function zkTokenCreate(address _token) public {
    require(token_zktoken[_token] == address(0), 'factory: token is already created');
    zkToken token = new zkToken();
    token.initialize(_token, verifierDeposit, verifierWithdraw, verifierTransfer);
    token_zktoken[_token] = address(token);
    zktoken_token[address(token)] = _token;
    id++;
    emit CreateToken(address(token), msg.sender);
  }
}

  