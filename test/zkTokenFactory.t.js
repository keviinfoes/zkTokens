const zkTokenFactory = artifacts.require("zkTokenFactory");
const VerifierDeposit = artifacts.require("VerifierDeposit");
const VerifierWithdraw = artifacts.require("VerifierWithdraw");
const VerifierTransfer = artifacts.require("VerifierTransfer");
const BN256G2 = artifacts.require("BN256G2");
const Pairing = artifacts.require("Pairing");

const ERC20 = artifacts.require("ERC20");

contract('zkTokenFactory', async accounts => {
	let Factory
	let DepositVerifier
	let WithdrawVerifier
	let TransferVerifier
	let Token
	before(async() => {
		DepositVerifier = await VerifierDeposit.deployed();
		WithdrawVerifier = await VerifierWithdraw.deployed();
		TransferVerifier = await VerifierTransfer.deployed();
		Factory = await zkTokenFactory.deployed(DepositVerifier.address, WithdrawVerifier.address, TransferVerifier.address)
		Token = await ERC20.deployed("test", "tst")
	})
	describe('Factory()', function () {
		it('should deploy zkfactory contract', async () => {
			let depositverf = await Factory.verifierDeposit()
			let withdrawverf = await Factory.verifierWithdraw()
			let transferverf = await Factory.verifierTransfer()
			assert.equal(depositverf, DepositVerifier.address ,"Factory: deposit verify contract not found")
			assert.equal(withdrawverf, WithdrawVerifier.address ,"Factory: withdraw verify contract not found")
			assert.equal(transferverf, TransferVerifier.address ,"Factory: transfer verify contract not found")
		})		
	})
	describe('zkTokenCreate()', function () {
		it('should create new zkToken contract', async () => {
			await Factory.zkTokenCreate(Token.address)
			let id = await Factory.id()
			assert.equal(id, 1, "zkTokenCreate(): new zkTokens is not created")
		})
		it('should store data new zkToken contract', async () => {
			let zkToken = await Factory.getzkTokenAddress(Token.address)
			let tokenstored = await Factory.getTokenAddress(zkToken)
			assert.equal(Token.address, tokenstored, "zkTokenCreate(): new zkTokens is not stored")
		})
	})
});
