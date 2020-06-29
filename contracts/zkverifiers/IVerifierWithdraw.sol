pragma solidity ^0.6.1;

/**
 * @dev Interface of the Verifier withdraw contract  
 *
 */
interface IVerifierWithdraw {
    function verifyTxWithdraw(
	        uint[2] calldata a,
            uint[2][2] calldata b,
            uint[2] calldata c,
            uint[5] calldata input
        ) external returns (bool r);
}