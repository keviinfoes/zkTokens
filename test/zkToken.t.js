const zkTokenFactory = artifacts.require("zkTokenFactory");
const VerifierDeposit = artifacts.require("VerifierDeposit");
const VerifierWithdraw = artifacts.require("VerifierWithdraw");
const VerifierTransfer = artifacts.require("VerifierTransfer");
const BN256G2 = artifacts.require("BN256G2");
const Pairing = artifacts.require("Pairing");

const zkToken = artifacts.require("zkToken");
const ERC20 = artifacts.require("ERC20");

contract('zkToken', async accounts => {
	let Factory
	let DepositVerifier
	let WithdrawVerifier
	let TransferVerifier
	let Token
	let ZKToken
	before(async() => {
		DepositVerifier = await VerifierDeposit.deployed();
		WithdrawVerifier = await VerifierWithdraw.deployed();
		TransferVerifier = await VerifierTransfer.deployed();
		Factory = await zkTokenFactory.deployed(DepositVerifier.address, WithdrawVerifier.address, TransferVerifier.address)
		Token = await ERC20.deployed("test", "tst")
		await Factory.zkTokenCreate(Token.address)
		let zkTokenAddress = await Factory.getzkTokenAddress(Token.address)
		ZKToken = await zkToken.at(zkTokenAddress)
	})
	describe('zkTokenDeposit()', function () {
		it('should create new zkToken note and receive tokens', async () => {
			await Token.approve(ZKToken.address, 10)
			await ZKToken.deposit(
				["0x1ee2323445a338c01c06bb13b8c989dba61afc053a639a78c686ab6bf4605574", "0x0e850a741c5d9aa60a93e2b3d0474251a4fa811a9395f892ec5a7a0226a4ed3c"],
				[["0x2327357d0ccc14712471841c74c0d835ed8e4fce8ce1f55ff355961342190f18", "0x1212ec0bd0625ac612acefb27fc4569f3f9d16470c1d70cb6922fd6bb713d06c"], 
				["0x20320b235e7b27715f46c3235ba4f4f17954888a6fd73fc28fba035423bb062e", "0x2a67f8998d9e13760d2bff7aeb77e6dba698e11fc6f3fbda21e7603d0c578d78"]],
				["0x22d823fdd11f1962cc09fb2df9d822c82b330ca3c131d4cb2627047ec57de8e5", "0x1cb3b9db527650e8fee2f852fc48be272d7e55654a4e42261ddcb7467d543d60"],
				["0x000000000000000000000000000000000000000000000000000000000000000a", "0x00000000000000000000000000000000b828cbc3bda1124784e9a1be808cc9ae", "0x0000000000000000000000000000000083ad7376f7bf5152b64ee4939cc87cb9"]
			)
			let note = await ZKToken.notes("0x00000000000000000000000000000000b828cbc3bda1124784e9a1be808cc9ae")
			let inverse = await ZKToken.inverse("0x0000000000000000000000000000000083ad7376f7bf5152b64ee4939cc87cb9")
			assert.equal(note.toString(16), "83ad7376f7bf5152b64ee4939cc87cb9", "zkToken: note is not registered")
			assert.equal(inverse.toString(16), "b828cbc3bda1124784e9a1be808cc9ae", "zkToken: note is not registered")
		})	
	})
	describe('zkTokenTransfer()', function () {
		it('should transfer zkToken - burn old note and create new note', async () => {
			await ZKToken.transfer(
				["0x2cc52505d21c4159395a6f678492c7ff0c7558bdd5e6a2a17ac0957c61500ab5", "0x27f0c3487b48a776f004ec2a38941c85078fccc7f9615a06619cd0d58a561ba0"],
				[["0x04db5909d22113be5b1d981813a0e71531dc6ae2a83322ac1365f064843667a5", "0x0ed295be7913b293f7eeaee9ad078a79ea53370add7c65d091001952fbf3dc13"], 
				["0x2054bb735dd016fabba5372855f6549fe57c6a6e66a327e4a0213baead54e93c", "0x1996d1b7c0bd8332c4621f0a2b2a97bd323a3dca8a358125cc2fe58de42beb57"]],
				["0x11070c50e499e1c54ddf494a67e7ebec28ab7d863ee906f0ab89bf81f82b1fd7", "0x2c4b5bf8199187030fe3bd8df44accd0bce0e39512032c294c41182291b90fdf"],
				["0x00000000000000000000000000000000b828cbc3bda1124784e9a1be808cc9ae","0x0000000000000000000000000000000083ad7376f7bf5152b64ee4939cc87cb9","0x00000000000000000000000000000000e0478c766086db39e37d514918db5749","0x00000000000000000000000000000000c0582d7f4be897adcac6b2611dfa8f35","0x0000000000000000000000000000000058f45d4a8c5c491d8dd2c9bcd0d99da6","0x000000000000000000000000000000004153e3c4b8ab5426d281f625a3dac5a5"]
			)
			let noteold = await ZKToken.notes("0x00000000000000000000000000000000b828cbc3bda1124784e9a1be808cc9ae")
			let inverseold = await ZKToken.inverse("0x0000000000000000000000000000000083ad7376f7bf5152b64ee4939cc87cb9")
			assert.equal(noteold.toString(), "0", "zkToken: old note is not removed")
			assert.equal(inverseold.toString(), "0", "zkToken: old note is not removed")
			let noteA = await ZKToken.notes("0x00000000000000000000000000000000e0478c766086db39e37d514918db5749")
			let inverseA = await ZKToken.inverse("0x00000000000000000000000000000000c0582d7f4be897adcac6b2611dfa8f35")
			let noteB = await ZKToken.notes("0x0000000000000000000000000000000058f45d4a8c5c491d8dd2c9bcd0d99da6")
			let inverseB = await ZKToken.inverse("0x000000000000000000000000000000004153e3c4b8ab5426d281f625a3dac5a5")
			assert.equal(noteA.toString(16), "c0582d7f4be897adcac6b2611dfa8f35", "zkToken: new note is not registered")
			assert.equal(inverseA.toString(16), "e0478c766086db39e37d514918db5749", "zkToken: new note is not registered")
			assert.equal(noteB.toString(16), "4153e3c4b8ab5426d281f625a3dac5a5", "zkToken: new note is not registered")
			assert.equal(inverseB.toString(16), "58f45d4a8c5c491d8dd2c9bcd0d99da6", "zkToken: new note is not registered")
		})	
	})
	describe('zkTokenWithdraw()', function () {
		it('should burn zkToken note and transfer token amount', async () => {
			await ZKToken.withdraw(
				["0x027780b98a69d00564df0ac8b3d6c4bcf3dfac54dfbe52c9b57ac3b21a40a0ce", "0x15b996c61f58e279cca1f91d21e789495b9462f9800ee7b3abd53d71634060b3"],
				[["0x03e12cc80faf68fbd3f6a5b9210c53741d9cbf7dd75989aecd62b42c46e52274", "0x2d4de176cf036a87fbd42905c94f0c5d9530aa2465a779d7acfce638b6ad9e87"], 
				["0x050eb126ce49abc6cd33f37bbd3f40007839537452fad935a4f1833ecd4e638d", "0x196d43b7793589a4dc496ad22666fbd367622a6133a345428019b94183b8d37c"]],
				["0x2378906c5c99dce73032ed652452f12d122634f25ee1c8cc83e828ae276ebc47", "0x0d5c1ec36407cb03ea53099d1354351028325a1175d11aafbfeaef0e50d4818c"],
				["0x0000000000000000000000000000000000000000000000000000000000000005","0x0000000000000000000000000000000058f45d4a8c5c491d8dd2c9bcd0d99da6","0x000000000000000000000000000000004153e3c4b8ab5426d281f625a3dac5a5","0x000000000000000000000000f1cc7eb5b67d15e5e07f0812bcab9cece21ce008","0x000000000000000000000000f1cc7eb5b67d15e5e07f0812bcab9cece21ce008"]
			)
			let noteW = await ZKToken.notes("0x0000000000000000000000000000000058f45d4a8c5c491d8dd2c9bcd0d99da6")
			let inverseW = await ZKToken.inverse("0x000000000000000000000000000000004153e3c4b8ab5426d281f625a3dac5a5")
			assert.equal(noteW.toString(), "0", "zkToken: old note is not removed")
			assert.equal(inverseW.toString(), "0", "zkToken: old note is not removed")
		})	
	})
});
