pragma solidity ^0.6.1;

import './IERC20.sol';
import './zkverifiers/IVerifierDeposit.sol';
import './zkverifiers/IVerifierWithdraw.sol';
import './zkverifiers/IVerifierTransfer.sol';
import './zkverifiers/IVerifierMixIn.sol';
import './zkverifiers/IVerifierMixOut.sol';

/** 
 * make any ERC20 token a zero knowlegde token [zkToken]
 */
contract zkToken  {
    
        //Notes mapping
        mapping(uint256 => uint256) public notes;
        //Mixer notes mapping
        mapping(uint256 => uint256) public mixerNotes;
        mapping(uint256 => uint256) public mixerCommit;
        mapping(uint256 => bool) public claim;
        
        //zkToken system variables
        bool private initialized;
        IERC20 public token;
        IVerifierDeposit public verifierDeposit;
        IVerifierWithdraw public verifierWithdraw;
        IVerifierTransfer public verifierTransfer;
        IVerifierMixIn public verifierMixerIn;
        IVerifierMixOut public verifierMixerOut;
    
        event Deposit(uint256 note, uint256 inverse);
        event Withdraw(uint256 note, uint256 inverse);
        event Transfer(uint256 noteA, uint256 inverseA, uint256 noteB, uint256 inverseB);


        /**
         *  @dev initialize zkToken with ERC20 address
         */
        function initialize(address _token, 
                                address _verifierDeposit, 
                                address _verifierWithdraw, 
                                address _verifierTransfer,
                                address _verifierMixerIn,
                                address _verifierMixerOut
                ) external returns (bool succes) {
                require(initialized != true);
                initialized = true;
                token = IERC20(_token);
                verifierDeposit = IVerifierDeposit(_verifierDeposit);
                verifierWithdraw = IVerifierWithdraw(_verifierWithdraw);
                verifierTransfer = IVerifierTransfer(_verifierTransfer);
                verifierMixerIn = IVerifierMixIn(_verifierMixerIn);
                verifierMixerOut = IVerifierMixOut(_verifierMixerOut);
                return true;                
        }

        /**
         *  @dev migrate tokens to zkTokens
         */
        function deposit(
                uint[2] memory a,
                uint[2][2] memory b,
                uint[2] memory c,
                uint[3] memory input
            ) public returns (bool success) {
                verifierDeposit.verifyTxDeposit(a, b, c, input);
                //check if allowance is more or equal to amount proof
                require(token.allowance(msg.sender, address(this)) >= input[0], "not enought allowance");
                //transfer token amount in
                require(token.transferFrom(msg.sender, address(this), input[0]), "transfer failed");
                //add zkToken note
                require(notes[input[1]] == 0, "non empty note");
                require(notes[input[2]] == 0, "non empty note");
                notes[input[1]] = input[2];
                notes[input[2]] = input[1];
                emit Deposit(input[1], input[2]);
                return true;
        }

        /**
         *  @dev migrate zkTokens to tokens
         */
        function withdraw(
                uint[2] memory a,
                uint[2][2] memory b,
                uint[2] memory c,
                uint[5] memory input
            ) public returns (bool success) {
                verifierWithdraw.verifyTxWithdraw(a, b, c, input);
                //Check if the note withdraw exists
                require(notes[input[1]] == input[2], "note does not exist");
                require(notes[input[2]] == input[1], "note does not exist");
                //Remove note from database
                notes[input[1]] = 0;
                notes[input[2]] = 0;
                //Transfer amount out
                token.transfer(address(input[4]), input[0]);
                emit Withdraw(input[1], input[2]);
                return true;
        }

        /**
         *  @dev transfer zkTokens - hides receiver and amount
         */
        function transfer(
                uint[2] memory a,
                uint[2][2] memory b,
                uint[2] memory c,
                uint[6] memory input
            ) public returns (bool success) {
                verifierTransfer.verifyTxTransfer(a, b, c, input);
                //Check if the note sender exists
                require(notes[input[0]] == input[1], "note does not exist");
                require(notes[input[1]] == input[0], "note does not exist");
                //Remove the note from the database
                notes[input[0]] = 0;
                notes[input[1]] = 0;
                //Add the new notes to the database - if new notes currently do not exist
                require(notes[input[2]] == 0, "non empty note");
                require(notes[input[3]] == 0, "non empty note");
                require(notes[input[4]] == 0, "non empty note");
                require(notes[input[5]] == 0, "non empty note");
                notes[input[2]] = input[3];
                notes[input[3]] = input[2];
                notes[input[4]] = input[5];
                notes[input[5]] = input[4];
                emit Transfer(input[2], input[3], input[4], input[5]);
                return true;
        }

        /**
         *  @dev mixer zkTokens - hides hash link by mixing it with other note transfers
         */
        function mixerDeposit(
                uint[2] memory a,
                uint[2][2] memory b,
                uint[2] memory c,
                uint[4] memory input        
            ) public returns (bool success) {
                verifierMixerIn.verifyTxMixIn(a,b,c,input);
                require(mixerNotes[input[0]] == 0, "Mixer: note already in mixer");
                require(mixerNotes[input[1]] == 0, "Mixer: note already mixer");
                require(mixerCommit[input[2]] == 0, "Mixer: note already in mixer");
                require(mixerCommit[input[3]] == 0, "Mixer: note already mixer");
                notes[input[0]] = 0;
                notes[input[1]] = 0;
                mixerNotes[input[0]] = input[1];
                mixerNotes[input[1]] = input[0];
                mixerCommit[input[2]] = input[3];
                mixerCommit[input[3]] = input[2];
                return true;
        }
        function mixerWithdraw(
                uint[2] memory a,
                uint[2][2] memory b,
                uint[2] memory c,
                uint[3] memory input
            ) public returns (bool success) {
                verifierMixerOut.verifyTxMixOut(a,b,c,input);
                require(claim[input[0]] == false, "Mixer: note already withdrawn");
                require(notes[input[1]] == 0, "non empty note");
                require(notes[input[2]] == 0, "non empty note");
                claim[input[0]] = true;
                notes[input[1]] = input[2];
                notes[input[2]] = input[1];  
                return true;
        }
}