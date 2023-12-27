const { ethers } = require('hardhat');
const { expect } = require('chai');

describe('Escrow', function () {
  let contract;
  let depositor;
  let beneficiary;
  let arbiter1;
  let arbiter2;
  const deposit = ethers.parseEther('1');
  beforeEach(async () => {
    depositor = await ethers.provider.getSigner(0);
    beneficiary = await ethers.provider.getSigner(1);
    arbiter1 = await ethers.provider.getSigner(2);
    arbiter2 = await ethers.provider.getSigner(3);
    const Escrow = await ethers.getContractFactory('Escrow');
    contract = await Escrow.deploy(
      arbiter1.getAddress(),
      arbiter2.getAddress(),
      beneficiary.getAddress(),
      {
        value: deposit,
      }
    );
    await contract.waitForDeployment();
  });

  it('should be funded initially', async function () {
    let balance = await ethers.provider.getBalance(contract.target);
    expect(balance).to.eq(deposit);
  });

  describe('after approval from address other than the arbiter', () => {
    it('should revert', async () => {
      await expect(contract.connect(beneficiary).approve()).to.be.reverted;
    });
  });

  describe('after approval from the same arbiter', () => {
    it('should revert', async () => {
      await contract.connect(arbiter1).approve();
      await expect(contract.connect(arbiter1).approve()).to.be.reverted;
    });
  });

  describe('after approval from the arbiter', () => {
    it('should transfer balance to beneficiary', async () => {
      const before = await ethers.provider.getBalance(beneficiary.getAddress());
      const approveTxn1 = await contract.connect(arbiter1).approve();
      await approveTxn1.wait();
      const approveTxn2 = await contract.connect(arbiter2).approve();
      await approveTxn2.wait();
      const after = await ethers.provider.getBalance(beneficiary.getAddress());
      expect(after-before).to.eq(deposit);
    });
  });
});
