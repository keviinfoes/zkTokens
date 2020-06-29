POC implementation of zkTokens - makes ERC20 tokens private using zokrates. 

## Description
zkTokens is an uniswap inspired implementation of privacy tokens. The goal is to give any ERC20 token (including currently existing tokens like dai) a full privacy option. This is accomplished by creating a zkToken wrapper. zkTokens use [zokrates](https://github.com/Zokrates/ZoKrates) for the zero-knowledge implementation and specifically the gm17 proving scheme. Anyone can deploy a zkToken wrapper for any ERC20 token by using the zkTokenFactory. One zkToken can be created per ERC20 token. The zkToken implements a deposit, withdraw, transfer and mix function. 

Once a user deposits tokens they receive a note for that value. Using the transfer function the owner of the note can transfer an amount smaller or equal to the value of the note, this will create two new notes one for the receiver and one for the owner (unspent amount). By calling the withdraw function the owner of the note can withdraw the token. To providue ultimate privacy (between deposit and withdraw) zkToken implements a mixer. To deposit a note to the mixer the user submits a note and a proof of known receiver, secretA and secretB. To withdraw from the mixer the user submits the new note, secretA and a proof that these are equal to the committed secret and receiver. The secretA is checked on double spend. No information is shared between the deposit and the withdraw in the mixer, this breaks the link between the notes.

In summary the benefits of zkTokens are:
- anyone can make their favorite token private.
- thanks to zk-proofs zkToken transactions do not show any data of the transaction (sender, receiver and amount) when transferring notes.
- the mixer implementation fixes the privacy loss from deposit and withdraw. 

## Requirements
1. `truffle`
2. `zokrates`

## Usage
This instructions describes the deploy, deposit, transfer, withdraw and mix for zkTokens.

#### Deploy
To deploy the factory run `truffle migrate`. Once the factory is deployed call the factory function `zkTokenCreate`
with the address of the token the zkToken is linked to. For example dai.

#### Deposit, Transfer and Withdraw
To use the zkToken a user needs zokrates specific private-public keys. These can be created as follow:
- `cd zkTokens/zkoutput/zkTokenKeyPair`
- `./zokrates compute-witness -a [private-key-receiver]`. 

To deposit a user needs to:
1. Set allowance for the zkToken contract. `approve([address-zkTokenContract], [amount-to-deposit])`.
2. Generate the proof for deposit using the `zkTokenDeposit proving.key`. 
3. Call `deposit()` in the zkToken contract with the proof input generated above.

To withdraw and transfer a user needs to:
1. Generate the proof for withdraw using the `zkTokenWithdraw proving.key` or for transfer using the `zkTokenTransfer proving.key`.
2. Call `withdraw()` or `transfer()` with the proof generated above.

#### Mixer
A zkToken note can be mixed with other notes to remove the link from note to note transfer. A mixer is needed because
the deposit and withdraw of a token gives information about the deposit owners and amount and withdraw owner and receiver.
The note mixer hides the link between two notes. 

The mixer requires a deposit and a withdraw. The link between deposit and withdraw is hidden using zk-proofs. To mix a note:
1. Generate the proof for deposit to mixer using the `zkTokenMixerIN proving.key` or for withdraw from mixer using the `zkTokenMixerOUT proving.key`.
2. Call `mixerDeposit()` or `mixerWithdraw()` with the proof generated above. 

## Test
To test the implementation run `truffle test`. The test also includes a gas analyses. ZK-proofs are expensive because of the computation needed. 
Every step (deposit, withdraw, transfer, mix) cost approximately 1 usd, during normal ethereum activity. A small price to pay for privacy. Future improvements and changes can decrease the gas price.
