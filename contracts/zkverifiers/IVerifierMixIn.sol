pragma solidity ^0.6.1;

/**
 * @dev Interface of the Verifier transfer contract  
 *
 */
interface IVerifierMixIn {
    function verifyTxMixIn(
	        uint[2] calldata a,
            uint[2][2] calldata b,
            uint[2] calldata c,
            uint[4] calldata input
        ) external returns (bool r);
}