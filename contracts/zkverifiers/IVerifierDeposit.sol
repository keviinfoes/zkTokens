pragma solidity ^0.6.1;

/**
 * @dev Interface of the Verifier deposit contract  
 *
 */
interface IVerifierDeposit {
    function verifyTxDeposit(
	        uint[2] calldata a,
            uint[2][2] calldata b,
            uint[2] calldata c,
            uint[3] calldata input
        ) external returns (bool r);
}
