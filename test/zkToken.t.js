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
			let inverse = await ZKToken.notes("0x0000000000000000000000000000000083ad7376f7bf5152b64ee4939cc87cb9")
			assert.equal(note.toString(16), "83ad7376f7bf5152b64ee4939cc87cb9", "zkToken: note is not registered")
			assert.equal(inverse.toString(16), "b828cbc3bda1124784e9a1be808cc9ae", "zkToken: note is not registered")
		})	
	})
	describe('zkTokenTransfer()', function () {
		it('should transfer zkToken - burn old note and create new note', async () => {
			await ZKToken.transfer(
				["0x2262b713f26ab4a52153b46d903006f32be07b7d9ba508158eb39aa61e4df688", "0x0e30b6135d473ae53520316ad83711bdcadd07bf07a540aac43fa46d04ddfe32"],
				[["0x0346a90264118a721dff40201f637f55917516f19d6a548f84d87de5b9e31be5", "0x02398b5a6310785df11709e78b9bdd93921494b835c5452f86e8f96daa21470c"], 
				["0x28636b517cb48a13ba6bcf78731bb9ccadd49172b73a7e6c992ecaa61017da74", "0x1d67350d0f871448cfec0f0de7d04829e729c1f2c8d52d0b88a61a26c1647056"]],
				["0x16afcd49fa940f936ce954bac36b0955d1e9e27151d2fc058ce2c8fa2afe9328", "0x0b80403eabc04f5fdd54804f3b64686dfc6331320bcac3de47773f549bba4afb"],
				["0x00000000000000000000000000000000b828cbc3bda1124784e9a1be808cc9ae","0x0000000000000000000000000000000083ad7376f7bf5152b64ee4939cc87cb9","0x000000000000000000000000000000008192d9c34e2e9e6f143f388ab300b3fe","0x00000000000000000000000000000000c7118055d63eb796040a9ba27693dd73","0x0000000000000000000000000000000058f45d4a8c5c491d8dd2c9bcd0d99da6","0x000000000000000000000000000000004153e3c4b8ab5426d281f625a3dac5a5"]
			)
			let noteold = await ZKToken.notes("0x00000000000000000000000000000000b828cbc3bda1124784e9a1be808cc9ae")
			let inverseold = await ZKToken.notes("0x0000000000000000000000000000000083ad7376f7bf5152b64ee4939cc87cb9")
			assert.equal(noteold.toString(), "0", "zkToken: old note is not removed")
			assert.equal(inverseold.toString(), "0", "zkToken: old note is not removed")
			let noteA = await ZKToken.notes("0x000000000000000000000000000000008192d9c34e2e9e6f143f388ab300b3fe")
			let inverseA = await ZKToken.notes("0x00000000000000000000000000000000c7118055d63eb796040a9ba27693dd73")
			let noteB = await ZKToken.notes("0x0000000000000000000000000000000058f45d4a8c5c491d8dd2c9bcd0d99da6")
			let inverseB = await ZKToken.notes("0x000000000000000000000000000000004153e3c4b8ab5426d281f625a3dac5a5")
			assert.equal(noteA.toString(16), "c7118055d63eb796040a9ba27693dd73", "zkToken: new note is not registered")
			assert.equal(inverseA.toString(16), "8192d9c34e2e9e6f143f388ab300b3fe", "zkToken: new note is not registered")
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
			let inverseW = await ZKToken.notes("0x000000000000000000000000000000004153e3c4b8ab5426d281f625a3dac5a5")
			assert.equal(noteW.toString(), "0", "zkToken: old note is not removed")
			assert.equal(inverseW.toString(), "0", "zkToken: old note is not removed")
		})	
	})
	describe('zkTokenMixIn()', function () {
		it('should add input zkToken to mixer', async () => {
			await ZKToken.mixerDeposit(
				["0x302b3af44cb3eca7ccdcf575fb429171ab527dcab89cae401da7948c77ce02e0", "0x2713f6d043819042f165eb78a162565725d47b2a4c90beb021ffd545be88dfe0"],
				[["0x2288d1269a57ee839e6186a8e6cd78ad0c0dab3d0b3382ee7cc8a4e107775c18", "0x083265a5c446ab67aae2aaeca1b781b9ced8a406bf5f72adb720129e738287e3"],
				["0x03cb6713909c720918a267644f1f2e46d3cfbfca9c48ba0052aa0dbdae8f90c9", "0x04eceeaaa82229a2ee0bf2324b2b8a2dff364f2bf78455d038548efa7a54c66e"]],
				["0x2f77d7422d5aaa72c2ed79de08bcd752ebb5d638293bd80b10808cfaf5d74af8", "0x01992e709b38aa79a853c93b0e2e0975c7a90b205ad1d0bd85f5fb9eaaaddf76"],
				["0x000000000000000000000000000000008192d9c34e2e9e6f143f388ab300b3fe","0x00000000000000000000000000000000c7118055d63eb796040a9ba27693dd73","0x00000000000000000000000000000000432cf8111ff71f372cd5dc42bf47f779","0x0000000000000000000000000000000019ab80fd8235c83aee126bfee020e12c"]
			)
			let note = await ZKToken.notes("0x000000000000000000000000000000008192d9c34e2e9e6f143f388ab300b3fe")
			let inverse = await ZKToken.notes("0x00000000000000000000000000000000c7118055d63eb796040a9ba27693dd73")
			assert.equal(note.toString(), "0", "zkToken: old note is not removed")
			assert.equal(inverse.toString(), "0", "zkToken: old note is not removed")
			let notesM = await ZKToken.mixerNotes("0x000000000000000000000000000000008192d9c34e2e9e6f143f388ab300b3fe")
			let inverseM = await ZKToken.mixerNotes("0x00000000000000000000000000000000c7118055d63eb796040a9ba27693dd73")
			assert.equal(notesM.toString(16), "c7118055d63eb796040a9ba27693dd73", "zkToken: note is not added to mixer")
			assert.equal(inverseM.toString(16), "8192d9c34e2e9e6f143f388ab300b3fe", "zkToken: note is not added to mixer")
			let commit = await ZKToken.mixerCommit("0x00000000000000000000000000000000432cf8111ff71f372cd5dc42bf47f779")
			let inversecommit = await ZKToken.mixerCommit("0x0000000000000000000000000000000019ab80fd8235c83aee126bfee020e12c")
			assert.equal(commit.toString(16), "19ab80fd8235c83aee126bfee020e12c", "zkToken: commit is not added to mixer")
			assert.equal(inversecommit.toString(16), "432cf8111ff71f372cd5dc42bf47f779", "zkToken: commit is not added to mixer")
		})	
	})
	describe('zkTokenMixOut()', function () {
		it('should create new output', async () => {
			await ZKToken.mixerWithdraw(
				["0x2905a0e9c132acda3606e3eb9edcd236c1c646374f5fffa619476092018db6e8", "0x0ec9d44193ef16367e8f59b91110db996f7c2961b4cb0d115cdd4c785ad71b67"],
				[["0x1f95fe88ef4be3afc509cd994a96a83c4faf2c05c9179f03ffd385673c26dc7c", "0x065a3ad24dc4df21ca2829532717dd063d23670bbff0e8ef4c0d05c6d05eb52b"],
				["0x2d083f9b0cd7826fb67327a5d8519a2c1eaec5e71b40fffd89a2e6041134acea", "0x17c7708d708dc4c7ece95db6eb53820140e8eaece81dff0ccf7d9f15deb2462b"]],
				["0x1bffdadff044c7f11ac1e07c14aeb5fe85e233b5e68e44a83cb4fc424dd634c5", "0x0160037ebb185b90fce8b9d8ff2357b93bbe1fbf5abbd26126554424fe201309"],
				["0x00000000000000000000000000000000000000000000000000000000075bcd15","0x00000000000000000000000000000000432cf8111ff71f372cd5dc42bf47f779","0x0000000000000000000000000000000019ab80fd8235c83aee126bfee020e12c"]
			)
			let claim = await ZKToken.claim("0x00000000000000000000000000000000000000000000000000000000075bcd15")
			assert.equal(claim, true, "zkToken: claim is not added to mixer")
			let note = await ZKToken.notes("0x00000000000000000000000000000000432cf8111ff71f372cd5dc42bf47f779")
			let inverse = await ZKToken.notes("0x0000000000000000000000000000000019ab80fd8235c83aee126bfee020e12c")
			assert.equal(note.toString(16), "19ab80fd8235c83aee126bfee020e12c", "zkToken: old note is not added")
			assert.equal(inverse.toString(16), "432cf8111ff71f372cd5dc42bf47f779", "zkToken: new note is not added")
		})	
	})
});
