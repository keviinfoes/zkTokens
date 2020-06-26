const zkTokenFactory = artifacts.require("zkTokenFactory");
const VerifierDeposit = artifacts.require("VerifierDeposit");
const VerifierWithdraw = artifacts.require("VerifierWithdraw");
const VerifierTransfer = artifacts.require("VerifierTransfer");
const VerifierMixIn = artifacts.require("VerifierMixIn");
const VerifierMixOut = artifacts.require("VerifierMixOut");

const BN256G2 = artifacts.require("BN256G2");
const Pairing = artifacts.require("Pairing");
const ERC20 = artifacts.require("ERC20");

async function doDeploy(deployer) {
  await deployer.deploy(BN256G2);
  await deployer.deploy(Pairing);

  await deployer.link(BN256G2, VerifierDeposit);
  await deployer.link(Pairing, VerifierDeposit);
  await deployer.link(BN256G2, VerifierWithdraw);
  await deployer.link(Pairing, VerifierWithdraw);
  await deployer.link(BN256G2, VerifierTransfer);
  await deployer.link(Pairing, VerifierTransfer);
  await deployer.link(BN256G2, VerifierMixIn);
  await deployer.link(Pairing, VerifierMixIn);
  await deployer.link(BN256G2, VerifierMixOut);
  await deployer.link(Pairing, VerifierMixOut);

  await deployer.deploy(VerifierDeposit);
  await deployer.deploy(VerifierWithdraw);
  await deployer.deploy(VerifierTransfer);
  await deployer.deploy(VerifierMixIn);
  await deployer.deploy(VerifierMixOut);
  await deployer.deploy(zkTokenFactory,
                      VerifierDeposit.address,
                      VerifierWithdraw.address, 
                      VerifierTransfer.address,
                      VerifierMixIn.address,
                      VerifierMixOut.address
                      );

  //For testing only
  await deployer.deploy(ERC20, "test", "TST");
}

module.exports = (deployer) => {
  deployer.then(async () => {
      await doDeploy(deployer);
  });

};

