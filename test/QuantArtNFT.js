require('@openzeppelin/test-helpers/configure')({
    environment: 'truffle',
    provider: web3.currentProvider,
});

const QuantArtsNFT = artifacts.require("./QuantArtsNFT.sol");
const token = artifacts.require("./ERC20.sol");
const { expectEvent, expectRevert, BN, time } = require("@openzeppelin/test-helpers");
const { toWei, soliditySha3 } = require("web3-utils");
const { ErrorMsgs } = require("./helpers");
const { MAX_SUPPLY, ZERO_BN, ADDRESS_ZERO, TOKEN_NAME, DIV_FACTOR, TOKEN_SYMBOL,CONTRACT_NAME, GUARANTEEED_TIMESTAMP, CONTRACT_SYMBOL, WHITELIST_TIMESTAMP, PUBLIC_TIMESTAMP, BASE_URI, MAX_MINT_AMOUNT, MINT_FINISH_TIMESTAMP } = require("./helpers/constants");
require("chai").should();

contract("QuantArtsNFT", ([owner, signer, whitelisted, whitelisted2, user, referral, referral2, ownerReceiver, marketing, ...restUsers]) => {

    beforeEach("Deploy contracts", async () => {
        tokenContract = await token.new(TOKEN_NAME, TOKEN_SYMBOL, { from: owner });
        quantArtsNFTcontract = await QuantArtsNFT.new(CONTRACT_NAME, CONTRACT_SYMBOL, signer, tokenContract.address, marketing, BASE_URI,
                                                      WHITELIST_TIMESTAMP, PUBLIC_TIMESTAMP, MINT_FINISH_TIMESTAMP, GUARANTEEED_TIMESTAMP, { from: owner });
    });

    describe("Getters and setters", () => {
        
        it("All gets from constants", async () => {
            let name = await quantArtsNFTcontract.name();
            name.should.be.equal(CONTRACT_NAME);
            let symbol = await quantArtsNFTcontract.symbol();
            symbol.should.be.equal(CONTRACT_SYMBOL);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            maxSupply.should.be.bignumber.equal(MAX_SUPPLY);
            let maxMintAmount = await quantArtsNFTcontract.maxMintAmount();
            maxMintAmount.should.be.bignumber.equal(MAX_MINT_AMOUNT);
        });

        it("Rest get and set", async () => {
            const newBaseURI = "https://alskjdhkqhdkqwdhqwhuwheiqhwie/";
            const newBaseExtension = ".png";
            const newWhitelistStartTimestamp = WHITELIST_TIMESTAMP.add(new BN("1"));
            const newPublicStartTimestamp = PUBLIC_TIMESTAMP.add(new BN("2"));
            const newGuaranteedWLTimestamp = PUBLIC_TIMESTAMP.add(new BN("1"));
            const newMintFinishTimestamp = MINT_FINISH_TIMESTAMP.add(new BN("2"));
            const newTokenAddress = user;
            const newMarketingAddress = user;
            const newGuaranteedAirdropSupply = new BN("10");
            const newPublicMintCost = new BN(toWei("500", "ether"));
            const newGuaranteedWLSupply = new BN("10");
            const newAuthHash = "0x784c3e712e86c80f42fcde15c79019dd3a4792105b5e03744ced5253c545433c";

            let beforeBaseURI = await quantArtsNFTcontract.baseURI();
            await quantArtsNFTcontract.setBaseURI(newBaseURI, { from: owner });
            let afterBaseURI = await quantArtsNFTcontract.baseURI();
            beforeBaseURI.should.not.be.equal(afterBaseURI);
            afterBaseURI.should.be.equal(newBaseURI);
            await expectRevert(
                quantArtsNFTcontract.setBaseURI(newBaseURI, { from: user }),
                ErrorMsgs.onlyOwner
            );

            let beforePublicMintCost = await quantArtsNFTcontract.publicMintCost();
            await quantArtsNFTcontract.setPublicMintCost(newPublicMintCost, { from: owner });
            let afterPublicMintCost = await quantArtsNFTcontract.publicMintCost();
            beforePublicMintCost.should.not.be.bignumber.equal(afterPublicMintCost);
            afterPublicMintCost.should.be.bignumber.equal(newPublicMintCost);
            await expectRevert(
                quantArtsNFTcontract.setPublicMintCost(owner, { from: user }),
                ErrorMsgs.onlyOwner
            );

            await quantArtsNFTcontract.addAuthHash(newAuthHash, { from: owner });
            let afterAuthHash = await quantArtsNFTcontract.authHashes(1);
            afterAuthHash.should.be.equal(newAuthHash);
            await expectRevert(
                quantArtsNFTcontract.addAuthHash(newAuthHash, { from: user }),
                ErrorMsgs.onlyOwner
            );
            
            let beforeGuaranteedAirdropSupply = await quantArtsNFTcontract.guaranteedAirdropSupply();
            await quantArtsNFTcontract.setGuaranteedAirdropSupply(newGuaranteedAirdropSupply, { from: owner });
            let afterGuaranteedAirdropSupply = await quantArtsNFTcontract.guaranteedAirdropSupply();
            beforeGuaranteedAirdropSupply.should.not.be.bignumber.equal(afterGuaranteedAirdropSupply);
            afterGuaranteedAirdropSupply.should.be.bignumber.equal(newGuaranteedAirdropSupply);
            await expectRevert(
                quantArtsNFTcontract.setGuaranteedAirdropSupply(owner, { from: user }),
                ErrorMsgs.onlyOwner
            );

            let beforeGuaranteedWLSupply = await quantArtsNFTcontract.guaranteedWLSupply();
            await quantArtsNFTcontract.setGuaranteedWLSupply(newGuaranteedWLSupply, { from: owner });
            let afterGuaranteedWLSupply = await quantArtsNFTcontract.guaranteedWLSupply();
            beforeGuaranteedWLSupply.should.not.be.bignumber.equal(afterGuaranteedWLSupply);
            afterGuaranteedWLSupply.should.be.bignumber.equal(newGuaranteedWLSupply);
            await expectRevert(
                quantArtsNFTcontract.setGuaranteedWLSupply(owner, { from: user }),
                ErrorMsgs.onlyOwner
            );

            let beforeTokenAddress = await quantArtsNFTcontract.paymentToken();
            await quantArtsNFTcontract.setPaymentToken(newTokenAddress, { from: owner });
            let afterTokenAddress = await quantArtsNFTcontract.paymentToken();
            beforeTokenAddress.should.not.be.equal(afterTokenAddress);
            afterTokenAddress.should.be.equal(newTokenAddress);
            await expectRevert(
                quantArtsNFTcontract.setPaymentToken(owner, { from: user }),
                ErrorMsgs.onlyOwner
            );


            let beforeMarketingAddress = await quantArtsNFTcontract.marketingAccount();
            await quantArtsNFTcontract.setMarketingAccount(newMarketingAddress, { from: owner });
            let afterMarketingAddress = await quantArtsNFTcontract.marketingAccount();
            beforeMarketingAddress.should.not.be.equal(afterMarketingAddress);
            afterMarketingAddress.should.be.equal(newMarketingAddress);
            await expectRevert(
                quantArtsNFTcontract.setMarketingAccount(owner, { from: user }),
                ErrorMsgs.onlyOwner
            );
            
            let beforeBaseExtension = await quantArtsNFTcontract.baseExtension();
            await quantArtsNFTcontract.setBaseExtension(newBaseExtension, { from: owner });
            let afterBaseExtension = await quantArtsNFTcontract.baseExtension();
            beforeBaseExtension.should.not.be.equal(afterBaseExtension);
            afterBaseExtension.should.be.equal(newBaseExtension);
            await expectRevert(
                quantArtsNFTcontract.setBaseExtension(newBaseExtension, { from: user }),
                ErrorMsgs.onlyOwner
            );

            let beforeWhitelistStartTimestamp = await quantArtsNFTcontract.whitelistStartTimestamp();
            await quantArtsNFTcontract.setWhitelistStartTimestamp(newWhitelistStartTimestamp, { from: owner });
            let afterWhitelistStartTimestamp = await quantArtsNFTcontract.whitelistStartTimestamp();
            beforeWhitelistStartTimestamp.should.not.be.bignumber.equal(afterWhitelistStartTimestamp);
            afterWhitelistStartTimestamp.should.be.bignumber.equal(newWhitelistStartTimestamp);
            await expectRevert(
                quantArtsNFTcontract.setWhitelistStartTimestamp(newWhitelistStartTimestamp, { from: user }),
                ErrorMsgs.onlyOwner
            );

            let beforePublicStartTimestamp = await quantArtsNFTcontract.publicStartTimestamp();
            await quantArtsNFTcontract.setPublicStartTimestamp(newPublicStartTimestamp, { from: owner });
            let afterPublicStartTimestamp = await quantArtsNFTcontract.publicStartTimestamp();
            beforePublicStartTimestamp.should.not.be.bignumber.equal(afterPublicStartTimestamp);
            afterPublicStartTimestamp.should.be.bignumber.equal(newPublicStartTimestamp);
            await expectRevert(
                quantArtsNFTcontract.setPublicStartTimestamp(newPublicStartTimestamp, { from: user }),
                ErrorMsgs.onlyOwner
            )
            await expectRevert(
                quantArtsNFTcontract.setPublicStartTimestamp(newWhitelistStartTimestamp.sub(new BN("1")), { from: owner }),
                ErrorMsgs.publicBeforeWhitelis
            );

            let beforeGuaranteedWLTimestamp = await quantArtsNFTcontract.guaranteedWLTimestamp();
            await quantArtsNFTcontract.setGuaranteedWLTimestamp(newGuaranteedWLTimestamp, { from: owner });
            let afterGuaranteedWLTimestamp = await quantArtsNFTcontract.guaranteedWLTimestamp();
            beforeGuaranteedWLTimestamp.should.not.be.bignumber.equal(afterGuaranteedWLTimestamp);
            afterGuaranteedWLTimestamp.should.be.bignumber.equal(newGuaranteedWLTimestamp);
            await expectRevert(
                quantArtsNFTcontract.setGuaranteedWLTimestamp(newGuaranteedWLTimestamp, { from: user }),
                ErrorMsgs.onlyOwner
            )
            await expectRevert(
                quantArtsNFTcontract.setGuaranteedWLTimestamp(0, { from: owner }),
                ErrorMsgs.incorrectGuaranteed
            );

            let beforeMintFinishTimestamp = await quantArtsNFTcontract.mintFinishTimestamp();
            await quantArtsNFTcontract.setMintFinishTimestamp(newMintFinishTimestamp, { from: owner });
            let afterMintFinishTimestamp = await quantArtsNFTcontract.mintFinishTimestamp();
            beforeMintFinishTimestamp.should.not.be.bignumber.equal(afterMintFinishTimestamp);
            afterMintFinishTimestamp.should.be.bignumber.equal(newMintFinishTimestamp);
            await expectRevert(
                quantArtsNFTcontract.setMintFinishTimestamp(newMintFinishTimestamp, { from: user }),
                ErrorMsgs.onlyOwner
            );
            await expectRevert(
                quantArtsNFTcontract.setMintFinishTimestamp(0, { from: owner }),
                ErrorMsgs.mintFinishBeforePublic
            );
        });

        it("Should get toke URI for whitelisted NFT minted", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await tokenContract.transfer(user, toWei('100000', 'ether'));
            let beforeMarketingBalance = await tokenContract.balanceOf(marketing);
            let beforeUserETHBalance = await tokenContract.balanceOf(user);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10010");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await quantArtsNFTcontract.mint(mintAmount, { from: user });
            let userBalance = await quantArtsNFTcontract.balanceOf(user);
            userBalance.should.be.bignumber.equal(mintAmount);
            let userETHBalance = await tokenContract.balanceOf(user);
            userETHBalance.should.be.bignumber.equal(beforeUserETHBalance.sub(mintCostTotal));
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let refundableAmount = (mintCostTotal.mul(DIV_FACTOR.sub(marketingPercentage))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let alreadyMintedAmount = await quantArtsNFTcontract.alreadyMintedAmount(user);
            alreadyMintedAmount.should.be.bignumber.equal(mintAmount);
            let mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(user);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
            let afterMarketingBalance = await tokenContract.balanceOf(marketing);
            afterMarketingBalance.should.be.bignumber.equal(beforeMarketingBalance.add(mintCostTotal.sub(refundableAmount)));

            let baseURI = await quantArtsNFTcontract.baseURI();
            let baseExtension = await quantArtsNFTcontract.baseExtension();
            for (let i = 0; i < mintAmount; i++){
                let tokenURI = await quantArtsNFTcontract.tokenURI(i);
                tokenURI.should.be.equal(baseURI + i + baseExtension);
            }
        });

        it("Should fail getting tokenURI because token doesn't exits", async () => {
            await expectRevert(
                quantArtsNFTcontract.tokenURI(1),
                ErrorMsgs.nonExistentToken
            );
        });
    });

    describe("Airdrop", () => {
        
        it("Should airdrop 1 to 3 accounts", async () => {
            const addresses = [restUsers[1], restUsers[2], restUsers[3]];
            const amounts = [new BN("1"), new BN("1"), new BN("1")];

            let beforeBalances =[]
            for (address of addresses) {
                let balance = await quantArtsNFTcontract.balanceOf(address);
                beforeBalances.push(balance);
            }
            await quantArtsNFTcontract.airdrop(addresses, amounts);
            for (let i = 0; i < addresses.length; i++) {
                let balance = await quantArtsNFTcontract.balanceOf(addresses[i]);
                balance.should.be.bignumber.equal(amounts[i])
            }
        });

        it("Should fail airdrop because arrays diferent length", async () => {
            const addresses = [restUsers[1], restUsers[2], restUsers[3]];
            const amounts = [new BN("1"), new BN("1")];

            let beforeBalances =[]
            for (address of addresses) {
                let balance = await quantArtsNFTcontract.balanceOf(address);
                beforeBalances.push(balance);
            }
            await expectRevert(
                quantArtsNFTcontract.airdrop(addresses, amounts),
                ErrorMsgs.arraysDifferentLength
            );
        });

        it("Should fail airdrop because one mint amount 0", async () => {
            const addresses = [restUsers[1], restUsers[2], restUsers[3]];
            const amounts = [new BN("1"), new BN("1"), ZERO_BN];

            let beforeBalances =[]
            for (address of addresses) {
                let balance = await quantArtsNFTcontract.balanceOf(address);
                beforeBalances.push(balance);
            }
            await expectRevert(
                quantArtsNFTcontract.airdrop(addresses, amounts),
                ErrorMsgs.airdropAmountZero
            );
        });

        it("Should fail airdrop because not owner", async () => {
            const addresses = [restUsers[1], restUsers[2], restUsers[3]];
            const amounts = [new BN("1"), new BN("1"), new BN("1")];

            let beforeBalances =[]
            for (address of addresses) {
                let balance = await quantArtsNFTcontract.balanceOf(address);
                beforeBalances.push(balance);
            }
            await expectRevert(
                quantArtsNFTcontract.airdrop(addresses, amounts, { from: user }),
                ErrorMsgs.onlyOwner
            );
        });

        it("Should fail airdrop because max supply reached", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("1")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let guaranteedAirdropSupply = await quantArtsNFTcontract.guaranteedAirdropSupply();
            let ownerMintAmount = ZERO_BN;
            await time.increase("10");
            for (let i = 0; i < parseInt(((maxSupply.sub(guaranteedAirdropSupply)).div(mintAmount)).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                await quantArtsNFTcontract.mint(mintAmount, { from: restUsers[i] });
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let refundableAmount = ((mintCost.mul((maxSupply.sub(guaranteedAirdropSupply)).sub(ownerMintAmount))).mul(DIV_FACTOR.sub(marketingPercentage))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            
            const addresses = [restUsers[1], restUsers[2], restUsers[3]];
            const amounts = [new BN("1"), new BN("1"), new BN("1")];

            let beforeBalances =[]
            for (address of addresses) {
                let balance = await quantArtsNFTcontract.balanceOf(address);
                beforeBalances.push(balance);
            }
            await quantArtsNFTcontract.airdrop(addresses, amounts);
            for (let i = 0; i < addresses.length; i++) {
                let balance = await quantArtsNFTcontract.balanceOf(addresses[i]);
                balance.should.be.bignumber.gt(beforeBalances[i])
            }

            await expectRevert(
                quantArtsNFTcontract.airdrop(addresses, amounts),
                ErrorMsgs.noSupplyLeft
            );
        });
    });

    describe("MintReferred", () => {
        
        it("Should mint three NFT for whitelisted", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await tokenContract.transfer(whitelisted, toWei('100000', 'ether'));
            let beforeUserETHBalance = await tokenContract.balanceOf(whitelisted);
            let beforeMarketingBalance = await tokenContract.balanceOf(marketing);
            let beforeOwnerBalance = await quantArtsNFTcontract.ownerBalance();
            let beforeReferralBalance = await tokenContract.balanceOf(referral);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10010");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            await quantArtsNFTcontract.mintReferred(mintAmount, referral, { from: whitelisted });
            let whitelistedBalance = await quantArtsNFTcontract.balanceOf(whitelisted);
            whitelistedBalance.should.be.bignumber.equal(mintAmount);
            let userETHBalance = await tokenContract.balanceOf(whitelisted);
            userETHBalance.should.be.bignumber.equal(beforeUserETHBalance.sub(mintCostTotal));
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let referralPercentage = await quantArtsNFTcontract.referralPercentage();
            let refundableAmount = (mintCostTotal.mul(DIV_FACTOR.sub(marketingPercentage.add(referralPercentage)))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let alreadyMintedAmount = await quantArtsNFTcontract.alreadyMintedAmount(whitelisted);
            alreadyMintedAmount.should.be.bignumber.equal(mintAmount);
            let mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(whitelisted);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
            let afterReferralBalance = await tokenContract.balanceOf(referral);
            afterReferralBalance.should.be.bignumber.equal(beforeReferralBalance.add((mintCostTotal.mul(referralPercentage)).div(DIV_FACTOR)));
            let afterOwnerBalance = await quantArtsNFTcontract.ownerBalance();
            afterOwnerBalance.should.be.bignumber.equal(beforeOwnerBalance.add(refundableAmount));
            let afterMarketingBalance = await tokenContract.balanceOf(marketing);
            afterMarketingBalance.should.be.bignumber.equal(beforeMarketingBalance.add((mintCostTotal.mul(marketingPercentage)).div(DIV_FACTOR)));
        });

        it("Should mint one NFT for non whitelisted", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("1");

            await tokenContract.transfer(user, toWei('100000', 'ether'));
            let beforeMarketingBalance = await tokenContract.balanceOf(marketing);
            let beforeUserETHBalance = await tokenContract.balanceOf(user);
            let beforeReferralBalance = await tokenContract.balanceOf(referral);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10010");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await quantArtsNFTcontract.mintReferred(mintAmount, referral, { from: user });
            let userBalance = await quantArtsNFTcontract.balanceOf(user);
            userBalance.should.be.bignumber.equal(mintAmount);
            let userETHBalance = await tokenContract.balanceOf(user);
            userETHBalance.should.be.bignumber.equal(beforeUserETHBalance.sub(mintCostTotal));
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let referralPercentage = await quantArtsNFTcontract.referralPercentage();
            let refundableAmount = (mintCostTotal.mul(DIV_FACTOR.sub(marketingPercentage.add(referralPercentage)))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(user);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
            let afterMarketingBalance = await tokenContract.balanceOf(marketing);
            afterMarketingBalance.should.be.bignumber.equal(beforeMarketingBalance.add((mintCostTotal.mul(marketingPercentage)).div(DIV_FACTOR)));
            let afterReferralBalance = await tokenContract.balanceOf(referral);
            afterReferralBalance.should.be.bignumber.equal(beforeReferralBalance.add((mintCostTotal.mul(referralPercentage)).div(DIV_FACTOR)));
        });

        it("Should mint one NFT for non whitelisted and then mint two for same person", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("1");

            await tokenContract.transfer(user, toWei('100000', 'ether'));
            let beforeMarketingBalance = await tokenContract.balanceOf(marketing);
            let beforeUserETHBalance = await tokenContract.balanceOf(user);
            let beforeReferralBalance = await tokenContract.balanceOf(referral);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10010");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await quantArtsNFTcontract.mintReferred(mintAmount, referral, { from: user });
            let userBalance = await quantArtsNFTcontract.balanceOf(user);
            userBalance.should.be.bignumber.equal(mintAmount);
            let userETHBalance = await tokenContract.balanceOf(user);
            userETHBalance.should.be.bignumber.equal(beforeUserETHBalance.sub(mintCostTotal));
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let referralPercentage = await quantArtsNFTcontract.referralPercentage();
            let refundableAmount = (mintCostTotal.mul(DIV_FACTOR.sub(marketingPercentage.add(referralPercentage)))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(user);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
            let afterMarketingBalance = await tokenContract.balanceOf(marketing);
            afterMarketingBalance.should.be.bignumber.equal(beforeMarketingBalance.add((mintCostTotal.mul(marketingPercentage)).div(DIV_FACTOR)));
            let afterReferralBalance = await tokenContract.balanceOf(referral);
            afterReferralBalance.should.be.bignumber.equal(beforeReferralBalance.add((mintCostTotal.mul(referralPercentage)).div(DIV_FACTOR)));

            const secondMintAmount = new BN("2");

            await tokenContract.transfer(user, toWei('100000', 'ether'));
            beforeUserETHBalance = await tokenContract.balanceOf(user);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            mintCost = await quantArtsNFTcontract.publicMintCost();
            mintCostTotal = mintCost.mul(secondMintAmount);
            await time.increase("10010");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await quantArtsNFTcontract.mintReferred(secondMintAmount, referral, { from: user });
            userBalance = await quantArtsNFTcontract.balanceOf(user);
            userBalance.should.be.bignumber.equal(secondMintAmount.add(mintAmount));
            userETHBalance = await tokenContract.balanceOf(user);
            userETHBalance.should.be.bignumber.equal(beforeUserETHBalance.sub(mintCostTotal));
            contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            referralPercentage = await quantArtsNFTcontract.referralPercentage();
            refundableAmount = ((mintCost.mul(mintAmount.add(secondMintAmount))).mul(DIV_FACTOR.sub(marketingPercentage.add(referralPercentage)))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            alreadyMintedAmount = await quantArtsNFTcontract.alreadyMintedAmount(user);
            alreadyMintedAmount.should.be.bignumber.equal(mintAmount.add(secondMintAmount));
            mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(user);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
            afterMarketingBalance = await tokenContract.balanceOf(marketing);
            afterMarketingBalance.should.be.bignumber.equal(beforeMarketingBalance.add(((mintCost.mul(mintAmount.add(secondMintAmount))).mul(marketingPercentage)).div(DIV_FACTOR)));
            afterReferralBalance = await tokenContract.balanceOf(referral);
            afterReferralBalance.should.be.bignumber.equal(beforeReferralBalance.add((((mintCost.mul(mintAmount.add(secondMintAmount)))).mul(referralPercentage)).div(DIV_FACTOR)));
        });

        it("Should fail mint three NFT because maxAmount reached", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await tokenContract.transfer(whitelisted, toWei('100000', 'ether'));
            let beforeUserETHBalance = await tokenContract.balanceOf(whitelisted);
            let beforeReferralBalance = await tokenContract.balanceOf(referral);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10010");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            await quantArtsNFTcontract.mintReferred(mintAmount, referral, { from: whitelisted });
            let whitelistedBalance = await quantArtsNFTcontract.balanceOf(whitelisted);
            whitelistedBalance.should.be.bignumber.equal(mintAmount);
            let userETHBalance = await tokenContract.balanceOf(whitelisted);
            userETHBalance.should.be.bignumber.equal(beforeUserETHBalance.sub(mintCostTotal));
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let referralPercentage = await quantArtsNFTcontract.referralPercentage();
            let refundableAmount = (mintCostTotal.mul(DIV_FACTOR.sub(marketingPercentage.add(referralPercentage)))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let alreadyMintedAmount = await quantArtsNFTcontract.alreadyMintedAmount(whitelisted);
            alreadyMintedAmount.should.be.bignumber.equal(mintAmount);
            let mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(whitelisted);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
            let afterReferralBalance = await tokenContract.balanceOf(referral);
            afterReferralBalance.should.be.bignumber.equal(beforeReferralBalance.add((mintCostTotal.mul(referralPercentage)).div(DIV_FACTOR)));
            await expectRevert(
                quantArtsNFTcontract.mintReferred(mintAmount, referral, { from: whitelisted }),
                ErrorMsgs.maximumMintedAmountReached
            );
        });

        it("Should fail mint because referral address zero", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            await time.increase("10010");
            await expectRevert(
                quantArtsNFTcontract.mintReferred(mintAmount, ADDRESS_ZERO, { from: whitelisted }),
                ErrorMsgs.notAddressZero
            );
        });

        it("Should fail mint because referral address is equal to msg sender", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            await time.increase("10010");
            await expectRevert(
                quantArtsNFTcontract.mintReferred(mintAmount, whitelisted, { from: whitelisted }),
                ErrorMsgs.notReferralEqSender
            );
        });

        it("Should fail mint because mint amount is zero", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = ZERO_BN;

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            await time.increase("10010");
            await expectRevert(
                quantArtsNFTcontract.mintReferred(mintAmount, referral, { from: whitelisted }),
                ErrorMsgs.mintAmountZero
            );
        });

        it("Should fail mint because mint time has finished", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("1")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("2")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            await time.increase("10");
            await expectRevert(
                quantArtsNFTcontract.mintReferred(mintAmount, referral, { from: whitelisted }),
                ErrorMsgs.mintHasFinished
            );
        });


        it("Should fail because already reached maxSupply", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            let beforeReferralBalance = await tokenContract.balanceOf(referral);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("1")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let guaranteedAirdropSupply = await quantArtsNFTcontract.guaranteedAirdropSupply();
            let ownerMintAmount = ZERO_BN;
            await time.increase("10");
            for (let i = 0; i < parseInt(((maxSupply.sub(guaranteedAirdropSupply)).div(mintAmount)).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                await quantArtsNFTcontract.mintReferred(mintAmount, referral, { from: restUsers[i] });
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let referralPercentage = await quantArtsNFTcontract.referralPercentage();
            let refundableAmount = ((mintCost.mul(maxSupply.sub(guaranteedAirdropSupply).sub(ownerMintAmount))).mul(DIV_FACTOR.sub(marketingPercentage.add(referralPercentage)))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let afterReferralBalance = await tokenContract.balanceOf(referral);
            afterReferralBalance.should.be.bignumber.equal(beforeReferralBalance.add(((mintCost.mul(maxSupply.sub(guaranteedAirdropSupply).sub(ownerMintAmount))).mul(referralPercentage)).div(DIV_FACTOR)));
            await tokenContract.transfer(user, toWei('100000', 'ether'));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await expectRevert(
                quantArtsNFTcontract.mint(mintAmount, { from: user }),
                ErrorMsgs.noSupplyLeft
            );
        });

        it("Should mint to last user because minimum sold needded reached even after mint time", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            let beforeReferralBalance = await tokenContract.balanceOf(referral);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("1")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let minimumSoldSuplyNeeded = await quantArtsNFTcontract.minimumSoldSuplyNeeded();
            await time.increase("10");
            for (let i = 5; i < parseInt(((minimumSoldSuplyNeeded.div(mintAmount)).add(new BN("5"))).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                await quantArtsNFTcontract.mint(mintAmount, { from: restUsers[i] });
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            await time.increase("1000000");
            await tokenContract.transfer(user, toWei('100000', 'ether'));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await quantArtsNFTcontract.mintReferred(mintAmount, referral,{ from: user });
            let userBalance = await quantArtsNFTcontract.balanceOf(user);
            userBalance.should.be.bignumber.equal(mintAmount);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let referralPercentage = await quantArtsNFTcontract.referralPercentage();
            let refundableAmount = (mintCostTotal.mul(DIV_FACTOR.sub(marketingPercentage.add(referralPercentage)))).div(DIV_FACTOR);
            let mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(user);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
            let afterReferralBalance = await tokenContract.balanceOf(referral);
            afterReferralBalance.should.be.bignumber.equal(beforeReferralBalance.add((mintCostTotal.mul(referralPercentage)).div(DIV_FACTOR)));
        });
    }); 

    describe("Mint", () => {

        it("Should mint one NFT for non whitelisted", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("1");

            await tokenContract.transfer(user, toWei('100000', 'ether'));
            let beforeMarketingBalance = await tokenContract.balanceOf(marketing);
            let beforeUserETHBalance = await tokenContract.balanceOf(user);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10010");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await quantArtsNFTcontract.mint(mintAmount, { from: user });
            let userBalance = await quantArtsNFTcontract.balanceOf(user);
            userBalance.should.be.bignumber.equal(mintAmount);
            let userETHBalance = await tokenContract.balanceOf(user);
            userETHBalance.should.be.bignumber.equal(beforeUserETHBalance.sub(mintCostTotal));
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let refundableAmount = (mintCostTotal.mul(DIV_FACTOR.sub(marketingPercentage))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let alreadyMintedAmount = await quantArtsNFTcontract.alreadyMintedAmount(user);
            alreadyMintedAmount.should.be.bignumber.equal(mintAmount);
            let mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(user);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
            let afterMarketingBalance = await tokenContract.balanceOf(marketing);
            afterMarketingBalance.should.be.bignumber.equal(beforeMarketingBalance.add(mintCostTotal.sub(refundableAmount)));
        });

        it("Should mint one NFT for non whitelisted and then mint two for same person", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("1");

            await tokenContract.transfer(user, toWei('100000', 'ether'));
            let beforeUserETHBalance = await tokenContract.balanceOf(user);
            let beforeMarketingBalance = await tokenContract.balanceOf(marketing);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10010");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await quantArtsNFTcontract.mint(mintAmount, { from: user });
            let userBalance = await quantArtsNFTcontract.balanceOf(user);
            userBalance.should.be.bignumber.equal(mintAmount);
            let userETHBalance = await tokenContract.balanceOf(user);
            userETHBalance.should.be.bignumber.equal(beforeUserETHBalance.sub(mintCostTotal));
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let refundableAmount = (mintCostTotal.mul(DIV_FACTOR.sub(marketingPercentage))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let alreadyMintedAmount = await quantArtsNFTcontract.alreadyMintedAmount(user);
            alreadyMintedAmount.should.be.bignumber.equal(mintAmount);
            let mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(user);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
            let afterMarketingBalance = await tokenContract.balanceOf(marketing);
            afterMarketingBalance.should.be.bignumber.equal(beforeMarketingBalance.add(mintCostTotal.sub(refundableAmount)));

            const secondMintAmount = new BN("2");

            beforeUserETHBalance = await tokenContract.balanceOf(user);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            mintCost = await quantArtsNFTcontract.publicMintCost();
            mintCostTotal = mintCost.mul(secondMintAmount);
            await time.increase("10010");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await quantArtsNFTcontract.mint(secondMintAmount, { from: user });
            userBalance = await quantArtsNFTcontract.balanceOf(user);
            userBalance.should.be.bignumber.equal(secondMintAmount.add(mintAmount));
            userETHBalance = await tokenContract.balanceOf(user);
            userETHBalance.should.be.bignumber.equal(beforeUserETHBalance.sub(mintCostTotal));
            contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            refundableAmount = ((mintCost.mul(mintAmount.add(secondMintAmount))).mul(DIV_FACTOR.sub(marketingPercentage))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            alreadyMintedAmount = await quantArtsNFTcontract.alreadyMintedAmount(user);
            alreadyMintedAmount.should.be.bignumber.equal(mintAmount.add(secondMintAmount));
            mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(user);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
            afterMarketingBalance = await tokenContract.balanceOf(marketing);
            afterMarketingBalance.should.be.bignumber.equal(beforeMarketingBalance.add((mintCost.mul(mintAmount.add(secondMintAmount))).sub(refundableAmount)));
        });

        it("Should fail mint three NFT because maxAmount reached", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await tokenContract.transfer(user, toWei('100000', 'ether'));
            let beforeMarketingBalance = await tokenContract.balanceOf(marketing);
            let beforeUserETHBalance = await tokenContract.balanceOf(user);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10010");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await quantArtsNFTcontract.mint(mintAmount, { from: user });
            let userBalance = await quantArtsNFTcontract.balanceOf(user);
            userBalance.should.be.bignumber.equal(mintAmount);
            let userETHBalance = await tokenContract.balanceOf(user);
            userETHBalance.should.be.bignumber.equal(beforeUserETHBalance.sub(mintCostTotal));
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let refundableAmount = (mintCostTotal.mul(DIV_FACTOR.sub(marketingPercentage))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let alreadyMintedAmount = await quantArtsNFTcontract.alreadyMintedAmount(user);
            alreadyMintedAmount.should.be.bignumber.equal(mintAmount);
            let mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(user);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
            let afterMarketingBalance = await tokenContract.balanceOf(marketing);
            afterMarketingBalance.should.be.bignumber.equal(beforeMarketingBalance.add(mintCostTotal.sub(refundableAmount)));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await expectRevert(
                quantArtsNFTcontract.mint(mintAmount, { from: user }),
                ErrorMsgs.maximumMintedAmountReached
            );
        });

        it("Should fail mint because not whitelisted in whitelisted time", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10");
            await expectRevert(
                quantArtsNFTcontract.mint(mintAmount, { from: user }),
                ErrorMsgs.mintInWLPeriod
            );
        });

        it("Should fail mint because whl mint in public time", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10010");
            let msgHash = await soliditySha3(whitelisted, referral, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: whitelisted }),
                ErrorMsgs.mintWLInNoWLPeriod
            );
        });

        it("Should fail mint because mint amount is zero", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = ZERO_BN;

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await time.increase("10010");
            await expectRevert(
                quantArtsNFTcontract.mint(mintAmount, { from: user }),
                ErrorMsgs.mintAmountZero
            );
        });

        it("Should fail mint because whitelist time has not started", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp.add(new BN("100")), { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await expectRevert(
                quantArtsNFTcontract.mint(mintAmount, { from: user }),
                ErrorMsgs.whiteListNotStarted
            );
        });

        it("Should fail mint because mint time has finished", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("1")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("2")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await expectRevert(
                quantArtsNFTcontract.mint(mintAmount, { from: user }),
                ErrorMsgs.mintHasFinished
            );
        });

        it("Should fail because already reached maxSupply", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("1")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let guaranteedAirdropSupply = await quantArtsNFTcontract.guaranteedAirdropSupply();
            let ownerMintAmount = ZERO_BN;
            await time.increase("10");
            for (let i = 0; i < parseInt(((maxSupply.sub(guaranteedAirdropSupply)).div(mintAmount)).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                await quantArtsNFTcontract.mint(mintAmount, { from: restUsers[i] });
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let refundableAmount = ((mintCost.mul((maxSupply.sub(guaranteedAirdropSupply)).sub(ownerMintAmount))).mul(DIV_FACTOR.sub(marketingPercentage))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            await tokenContract.transfer(user, toWei('100000', 'ether'));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await expectRevert(
                quantArtsNFTcontract.mint(mintAmount, { from: user }),
                ErrorMsgs.noSupplyLeft
            );
        });

        it("Should mint to last user because minimum sold needded reached even haster mint time", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("1")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let minimumSoldSuplyNeeded = await quantArtsNFTcontract.minimumSoldSuplyNeeded();
            await time.increase("10");
            for (let i = 5; i < parseInt(((minimumSoldSuplyNeeded.div(mintAmount)).add(new BN("5"))).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                await quantArtsNFTcontract.mint(mintAmount, { from: restUsers[i] });
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            await time.increase("1000000");
            await tokenContract.transfer(user, toWei('100000', 'ether'));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await quantArtsNFTcontract.mint(mintAmount, { from: user });
            let userBalance = await quantArtsNFTcontract.balanceOf(user);
            userBalance.should.be.bignumber.equal(mintAmount);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let refundableAmount = (mintCostTotal.mul(DIV_FACTOR.sub(marketingPercentage))).div(DIV_FACTOR);
            let mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(user);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
        });
    });

    describe("WhitelistMint", () => {
        
        it("Should mint three NFT for whitelisted", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("50");
            const maxAmount = new BN("50");

            await tokenContract.transfer(whitelisted, toWei('100000', 'ether'));
            let beforeUserETHBalance = await tokenContract.balanceOf(whitelisted);
            let beforeMarketingBalance = await tokenContract.balanceOf(marketing);
            let beforeOwnerBalance = await quantArtsNFTcontract.ownerBalance();
            let beforeReferralBalance = await tokenContract.balanceOf(referral);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            const msgHash = await soliditySha3(whitelisted, referral, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: whitelisted });
            let whitelistedBalance = await quantArtsNFTcontract.balanceOf(whitelisted);
            whitelistedBalance.should.be.bignumber.equal(mintAmount);
            let userETHBalance = await tokenContract.balanceOf(whitelisted);
            userETHBalance.should.be.bignumber.equal(beforeUserETHBalance.sub(mintCostTotal));
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let referralPercentage = await quantArtsNFTcontract.referralPercentage();
            let refundableAmount = (mintCostTotal.mul(DIV_FACTOR.sub(marketingPercentage.add(referralPercentage)))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let alreadyMintedAmount = await quantArtsNFTcontract.alreadyMintedAmount(whitelisted);
            alreadyMintedAmount.should.be.bignumber.equal(mintAmount);
            let mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(whitelisted);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
            let afterReferralBalance = await tokenContract.balanceOf(referral);
            afterReferralBalance.should.be.bignumber.equal(beforeReferralBalance.add((mintCostTotal.mul(referralPercentage)).div(DIV_FACTOR)));
            let afterOwnerBalance = await quantArtsNFTcontract.ownerBalance();
            afterOwnerBalance.should.be.bignumber.equal(beforeOwnerBalance.add(refundableAmount));
            let afterMarketingBalance = await tokenContract.balanceOf(marketing);
            afterMarketingBalance.should.be.bignumber.equal(beforeMarketingBalance.add((mintCostTotal.mul(marketingPercentage)).div(DIV_FACTOR)));
        });

        it("Should fail whitelist mint because already minted", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("1");
            const maxAmount = new BN("3");

            await tokenContract.transfer(whitelisted, toWei('100000', 'ether'));
            let beforeUserETHBalance = await tokenContract.balanceOf(whitelisted);
            let beforeMarketingBalance = await tokenContract.balanceOf(marketing);
            let beforeOwnerBalance = await quantArtsNFTcontract.ownerBalance();
            let beforeReferralBalance = await tokenContract.balanceOf(referral);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            let msgHash = await soliditySha3(whitelisted, referral, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: whitelisted });
            let whitelistedBalance = await quantArtsNFTcontract.balanceOf(whitelisted);
            whitelistedBalance.should.be.bignumber.equal(mintAmount);
            let userETHBalance = await tokenContract.balanceOf(whitelisted);
            userETHBalance.should.be.bignumber.equal(beforeUserETHBalance.sub(mintCostTotal));
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let referralPercentage = await quantArtsNFTcontract.referralPercentage();
            let refundableAmount = (mintCostTotal.mul(DIV_FACTOR.sub(marketingPercentage.add(referralPercentage)))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let alreadyMintedAmount = await quantArtsNFTcontract.alreadyMintedAmount(whitelisted);
            alreadyMintedAmount.should.be.bignumber.equal(mintAmount);
            let mintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(whitelisted);
            mintPaidAmounts.should.be.bignumber.equal(refundableAmount);
            let afterReferralBalance = await tokenContract.balanceOf(referral);
            afterReferralBalance.should.be.bignumber.equal(beforeReferralBalance.add((mintCostTotal.mul(referralPercentage)).div(DIV_FACTOR)));
            let afterOwnerBalance = await quantArtsNFTcontract.ownerBalance();
            afterOwnerBalance.should.be.bignumber.equal(beforeOwnerBalance.add(refundableAmount));
            let afterMarketingBalance = await tokenContract.balanceOf(marketing);
            afterMarketingBalance.should.be.bignumber.equal(beforeMarketingBalance.add((mintCostTotal.mul(marketingPercentage)).div(DIV_FACTOR)));

            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            msgHash = await soliditySha3(whitelisted, referral, maxAmount, mintCost, false);
            signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');

            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: whitelisted }),
                ErrorMsgs.alreadyMintWL
            );
        });

        it("Should fail mint because mint amount bigger than max amount", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("5");
            const maxAmount = new BN("3");

            await tokenContract.transfer(whitelisted, toWei('100000', 'ether'));
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            const msgHash = await soliditySha3(whitelisted, referral, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: whitelisted }),
                ErrorMsgs.mintAmountBiggerMaxMintAmount
            );
        });

        it("Should fail mint because mint price less than minimum", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            await tokenContract.transfer(whitelisted, toWei('100000', 'ether'));
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.minimumMintCost();
            mintCost = mintCost.sub(new BN("1"));
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            const msgHash = await soliditySha3(whitelisted, referral, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: whitelisted }),
                ErrorMsgs.unitPriceLessThanMinumum
            );
        });

        it("Should fail mint because referral address zero", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            await tokenContract.transfer(whitelisted, toWei('100000', 'ether'));
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            const msgHash = await soliditySha3(whitelisted, ADDRESS_ZERO, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, ADDRESS_ZERO, maxAmount, mintCost , false, signature, { from: whitelisted }),
                ErrorMsgs.notAddressZero
            );
        });

        it("Should fail mint because signatures not valid", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            await tokenContract.transfer(whitelisted, toWei('100000', 'ether'));
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            let msgHash = await soliditySha3(whitelisted, referral, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, user);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: whitelisted }),
                ErrorMsgs.notValidSign
            );

            msgHash = await soliditySha3(whitelisted, referral,1, maxAmount, mintCost, false);
            signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: whitelisted }),
                ErrorMsgs.notValidSign
            );
        });

        it("Should fail mint because referral address is equal to msg sender", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            await tokenContract.transfer(whitelisted, toWei('100000', 'ether'));
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            const msgHash = await soliditySha3(whitelisted, whitelisted, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, whitelisted, maxAmount, mintCost , false, signature, { from: whitelisted }),
                ErrorMsgs.notReferralEqSender
            );
        });

        it("Should fail mint because mint amount is zero", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("0");
            const maxAmount = new BN("3");

            await tokenContract.transfer(whitelisted, toWei('100000', 'ether'));
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            const msgHash = await soliditySha3(whitelisted, referral, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: whitelisted }),
                ErrorMsgs.mintAmountZero
            );
        });

        it("Should fail mint because whitelist time has not started", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp.add(new BN("100")), { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            const msgHash = await soliditySha3(whitelisted, referral, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: whitelisted }),
                ErrorMsgs.whitelistNotStarted
            );
        });

        it("Should fail mint because mint time has finished", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("1")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("2")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            await time.increase("10");
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            const msgHash = await soliditySha3(whitelisted, referral, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: whitelisted }),
                ErrorMsgs.mintHasFinished
            );
        });

        it("Should fail because already reached maxSupply", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            let beforeReferralBalance = await tokenContract.balanceOf(referral);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let guaranteedAirdropSupply = await quantArtsNFTcontract.guaranteedAirdropSupply();
            let ownerMintAmount = ZERO_BN;
            await time.increase("10");
            for (let i = 0; i < parseInt(((maxSupply.sub(guaranteedAirdropSupply)).div(mintAmount)).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                let msgHash = await soliditySha3(restUsers[i], referral, maxAmount, mintCost, false);
                let signature = await web3.eth.sign(msgHash, signer);
                signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
                await quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: restUsers[i] });
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let referralPercentage = await quantArtsNFTcontract.referralPercentage();
            let refundableAmount = ((mintCost.mul(maxSupply.sub(guaranteedAirdropSupply).sub(ownerMintAmount))).mul(DIV_FACTOR.sub(marketingPercentage.add(referralPercentage)))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let afterReferralBalance = await tokenContract.balanceOf(referral);
            afterReferralBalance.should.be.bignumber.equal(beforeReferralBalance.add(((mintCost.mul(maxSupply.sub(guaranteedAirdropSupply).sub(ownerMintAmount))).mul(referralPercentage)).div(DIV_FACTOR)));
            await tokenContract.transfer(user, toWei('100000', 'ether'));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            let msgHash = await soliditySha3(user, referral, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: user }),
                ErrorMsgs.noSupplyLeft
            );
        });

        it("Should mint after full supply beacuse guaranteed", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            let beforeReferralBalance = await tokenContract.balanceOf(referral);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setGuaranteedWLTimestamp(currentTimestamp.add(new BN("1000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let guaranteedAirdropSupply = await quantArtsNFTcontract.guaranteedAirdropSupply();
            let guaranteedWLSupply = await quantArtsNFTcontract.guaranteedWLSupply();
            let ownerMintAmount = ZERO_BN;
            await time.increase("10");
            for (let i = 0; i < parseInt(((maxSupply.sub(guaranteedAirdropSupply).sub(guaranteedWLSupply)).div(mintAmount)).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                let msgHash = await soliditySha3(restUsers[i], referral, maxAmount, mintCost, false);
                let signature = await web3.eth.sign(msgHash, signer);
                signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
                await quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: restUsers[i] });
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let referralPercentage = await quantArtsNFTcontract.referralPercentage();
            let refundableAmount = ((mintCost.mul(maxSupply.sub(guaranteedAirdropSupply).sub(ownerMintAmount).sub(guaranteedWLSupply))).mul(DIV_FACTOR.sub(marketingPercentage.add(referralPercentage)))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let afterReferralBalance = await tokenContract.balanceOf(referral);
            afterReferralBalance.should.be.bignumber.equal(beforeReferralBalance.add(((mintCost.mul(maxSupply.sub(guaranteedAirdropSupply).sub(ownerMintAmount).sub(guaranteedWLSupply))).mul(referralPercentage)).div(DIV_FACTOR)));
            await tokenContract.transfer(user, toWei('100000', 'ether'));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            let msgHash = await soliditySha3(user, referral, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: user }),
                ErrorMsgs.noSupplyLeft
            );
            await tokenContract.transfer(whitelisted, toWei('100000', 'ether'));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            msgHash = await soliditySha3(whitelisted, referral, maxAmount, mintCost, true);
            signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , true, signature, { from: whitelisted });
        });

        it("Should fail mint after full supply beacuse already guaranteed", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            let beforeReferralBalance = await tokenContract.balanceOf(referral);
            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setGuaranteedWLTimestamp(currentTimestamp.add(new BN("1000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let guaranteedAirdropSupply = await quantArtsNFTcontract.guaranteedAirdropSupply();
            let guaranteedWLSupply = await quantArtsNFTcontract.guaranteedWLSupply();
            let ownerMintAmount = ZERO_BN;
            await time.increase("10");
            for (let i = 0; i < parseInt(((maxSupply.sub(guaranteedAirdropSupply).sub(guaranteedWLSupply)).div(mintAmount)).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                let msgHash = await soliditySha3(restUsers[i], referral, maxAmount, mintCost, false);
                let signature = await web3.eth.sign(msgHash, signer);
                signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
                await quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: restUsers[i] });
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            let contractBalance = await tokenContract.balanceOf(quantArtsNFTcontract.address);
            let marketingPercentage = await quantArtsNFTcontract.marketingPercentage();
            let referralPercentage = await quantArtsNFTcontract.referralPercentage();
            let refundableAmount = ((mintCost.mul(maxSupply.sub(guaranteedAirdropSupply).sub(ownerMintAmount).sub(guaranteedWLSupply))).mul(DIV_FACTOR.sub(marketingPercentage.add(referralPercentage)))).div(DIV_FACTOR);
            contractBalance.should.be.bignumber.equal(refundableAmount);
            let afterReferralBalance = await tokenContract.balanceOf(referral);
            afterReferralBalance.should.be.bignumber.equal(beforeReferralBalance.add(((mintCost.mul(maxSupply.sub(guaranteedAirdropSupply).sub(ownerMintAmount).sub(guaranteedWLSupply))).mul(referralPercentage)).div(DIV_FACTOR)));
            await tokenContract.transfer(user, toWei('100000', 'ether'));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            let msgHash = await soliditySha3(user, referral, maxAmount, mintCost, false);
            let signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: user }),
                ErrorMsgs.noSupplyLeft
            );
            await tokenContract.transfer(whitelisted, toWei('100000', 'ether'));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            msgHash = await soliditySha3(whitelisted, referral, maxAmount, mintCost, true);
            signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , true, signature, { from: whitelisted });
            await tokenContract.transfer(whitelisted2, toWei('100000', 'ether'));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted2 });
            msgHash = await soliditySha3(whitelisted2, referral, maxAmount, mintCost, true);
            signature = await web3.eth.sign(msgHash, signer);
            signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
            await expectRevert(
                quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , true, signature, { from: whitelisted2 }),
                ErrorMsgs.noSupplyLeft
            );
        });

        it("Should mint to last user because minimum sold needded reached even after mint time", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let minimumSoldSuplyNeeded = await quantArtsNFTcontract.minimumSoldSuplyNeeded();
            await time.increase("10");
            for (let i = 5; i < parseInt(((minimumSoldSuplyNeeded.div(mintAmount)).add(new BN("5"))).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                let msgHash = await soliditySha3(restUsers[i], referral, maxAmount, mintCost, false);
                let signature = await web3.eth.sign(msgHash, signer);
                signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
                await quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: restUsers[i] });
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            await time.increase("1000000");
            await tokenContract.transfer(user, toWei('100000', 'ether'));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: user });
            await quantArtsNFTcontract.mint(mintAmount, { from: user });
        });
    }); 

    describe("RedeemOwner", () => {

        it("Should let owner redeem and referrals redeem all contract balance", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let minimumSoldSuplyNeeded = await quantArtsNFTcontract.minimumSoldSuplyNeeded();
            await time.increase("10");

            for (let i = 5; i < parseInt(((minimumSoldSuplyNeeded.div(mintAmount)).add(new BN("5"))).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                if (i % 2 === 0) {
                    let msgHash = await soliditySha3(restUsers[i], referral, maxAmount, mintCost, false);
                    let signature = await web3.eth.sign(msgHash, signer);
                    signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
                    await quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: restUsers[i] });
                } else {
                    let msgHash = await soliditySha3(restUsers[i], referral2, maxAmount, mintCost, false);
                    let signature = await web3.eth.sign(msgHash, signer);
                    signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
                    await quantArtsNFTcontract.whitelistMint(mintAmount, referral2, maxAmount, mintCost , false, signature, { from: restUsers[i] });
                }
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            await time.increase("1000000");

            let beforeOwnerBalance = await quantArtsNFTcontract.ownerBalance();
            let beforeUserETHBalance = await tokenContract.balanceOf(ownerReceiver);
            await quantArtsNFTcontract.redeemOwnerBalance(ownerReceiver, { from: owner });
            let afterOwnerBalance = await quantArtsNFTcontract.ownerBalance();
            let afterUserETHBalance = await tokenContract.balanceOf(ownerReceiver);
            afterOwnerBalance.should.be.bignumber.equal(ZERO_BN)
            afterUserETHBalance.should.be.bignumber.equal(beforeUserETHBalance.add(beforeOwnerBalance));
        });

        it("Should let owner redeem for a second time", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let minimumSoldSuplyNeeded = await quantArtsNFTcontract.minimumSoldSuplyNeeded();
            await time.increase("10");

            for (let i = 5; i < parseInt(((minimumSoldSuplyNeeded.div(mintAmount)).add(new BN("5"))).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                if (i % 2 === 0) {
                    let msgHash = await soliditySha3(restUsers[i], referral, maxAmount, mintCost, false);
                    let signature = await web3.eth.sign(msgHash, signer);
                    signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
                    await quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: restUsers[i] });
                } else {
                    let msgHash = await soliditySha3(restUsers[i], referral2, maxAmount, mintCost, false);
                    let signature = await web3.eth.sign(msgHash, signer);
                    signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
                    await quantArtsNFTcontract.whitelistMint(mintAmount, referral2, maxAmount, mintCost , false, signature, { from: restUsers[i] });
                }
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            await time.increase("1000000");
            await quantArtsNFTcontract.redeemOwnerBalance(ownerReceiver, { from: owner });

            await tokenContract.transfer(whitelisted, toWei('100000', 'ether'));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted });
            await quantArtsNFTcontract.mint(mintAmount, { from: whitelisted });
            await tokenContract.transfer(whitelisted2, toWei('100000', 'ether'));
            await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: whitelisted2 });
            await quantArtsNFTcontract.mint(mintAmount, { from: whitelisted2 });
        });

        it("Should failed owner redeem because not reached min supply sold", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let minimumSoldSuplyNeeded = await quantArtsNFTcontract.minimumSoldSuplyNeeded();
            await time.increase("10");

            for (let i = 20; i < parseInt(((minimumSoldSuplyNeeded.div(mintAmount)).add(new BN("5"))).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                if (i % 2 === 0) {
                    let msgHash = await soliditySha3(restUsers[i], referral, maxAmount, mintCost, false);
                    let signature = await web3.eth.sign(msgHash, signer);
                    signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
                    await quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: restUsers[i] });
                } else {
                    let msgHash = await soliditySha3(restUsers[i], referral2, maxAmount, mintCost, false);
                    let signature = await web3.eth.sign(msgHash, signer);
                    signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
                    await quantArtsNFTcontract.whitelistMint(mintAmount, referral2, maxAmount, mintCost , false, signature, { from: restUsers[i] });
                }
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            await expectRevert(
                quantArtsNFTcontract.redeemOwnerBalance(ownerReceiver, { from: owner }),
                ErrorMsgs.minSoldSupplyNotReached
            );
        });

        it("Should failed redeem owners balance because is not owner", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");
            const maxAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("10000")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let minimumSoldSuplyNeeded = await quantArtsNFTcontract.minimumSoldSuplyNeeded();
            await time.increase("10");

            for (let i = 20; i < parseInt(((minimumSoldSuplyNeeded.div(mintAmount)).add(new BN("5"))).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                if (i % 2 === 0) {
                    let msgHash = await soliditySha3(restUsers[i], referral, maxAmount, mintCost, false);
                    let signature = await web3.eth.sign(msgHash, signer);
                    signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
                    await quantArtsNFTcontract.whitelistMint(mintAmount, referral, maxAmount, mintCost , false, signature, { from: restUsers[i] });
                } else {
                    let msgHash = await soliditySha3(restUsers[i], referral2, maxAmount, mintCost, false);
                    let signature = await web3.eth.sign(msgHash, signer);
                    signature = signature.substr(0, 130) + (signature.substr(130) == '00' ? '1b' : '1c');
                    await quantArtsNFTcontract.whitelistMint(mintAmount, referral2, maxAmount, mintCost , false, signature, { from: restUsers[i] });
                }
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            await expectRevert(
                quantArtsNFTcontract.redeemOwnerBalance(ownerReceiver, { from: user }),
                ErrorMsgs.onlyOwner
            );
        });
    });

    describe("RefundMint", () => {

        it("Should let user refund", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("1")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let minimumSoldSuplyNeeded = await quantArtsNFTcontract.minimumSoldSuplyNeeded();
            await time.increase("10");
            for (let i = 20; i < parseInt(((minimumSoldSuplyNeeded.div(mintAmount)).add(new BN("5"))).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                await quantArtsNFTcontract.mint(mintAmount, { from: restUsers[i] });
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            await time.increase("1000000");
            
            let beforeMintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(restUsers[22]);

            let beforeUserETHBalance = await tokenContract.balanceOf(restUsers[22]);
            await quantArtsNFTcontract.refundMint({ from: restUsers[22] });

            let afterUserETHBalance = await tokenContract.balanceOf(restUsers[22]);
            let afterMintPaidAmounts = await quantArtsNFTcontract.mintPaidAmounts(restUsers[22]);
            afterUserETHBalance.should.be.bignumber.equal(beforeUserETHBalance.add(beforeMintPaidAmounts));
            afterMintPaidAmounts.should.be.bignumber.equal(ZERO_BN);
        });

        it("Should fail user refund because min sold supply reached", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("1")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let minimumSoldSuplyNeeded = await quantArtsNFTcontract.minimumSoldSuplyNeeded();
            await time.increase("10");
            for (let i = 5; i < parseInt(((minimumSoldSuplyNeeded.div(mintAmount)).add(new BN("5"))).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                await quantArtsNFTcontract.mint(mintAmount, { from: restUsers[i] });
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            await time.increase("1000000");
            await expectRevert(
                quantArtsNFTcontract.refundMint({ from: restUsers[22] }),
                ErrorMsgs.minSoldSupplyReached
            );
        });

        it("Should fail user refund because any mint", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("1")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let minimumSoldSuplyNeeded = await quantArtsNFTcontract.minimumSoldSuplyNeeded();
            await time.increase("10");
            for (let i = 20; i < parseInt(((minimumSoldSuplyNeeded.div(mintAmount)).add(new BN("5"))).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                await quantArtsNFTcontract.mint(mintAmount, { from: restUsers[i] });
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            await time.increase("1000000");
            await expectRevert(
                quantArtsNFTcontract.refundMint({ from: whitelisted }),
                ErrorMsgs.notMintedAnyToken
            );
        });

        it("Should fail user refund because mint has not finished yet", async () => {
            const currentTimestamp = await time.latest();
            const mintAmount = new BN("3");

            await quantArtsNFTcontract.setWhitelistStartTimestamp(currentTimestamp, { from: owner });
            await quantArtsNFTcontract.setPublicStartTimestamp(currentTimestamp.add(new BN("1")), { from: owner });
            await quantArtsNFTcontract.setMintFinishTimestamp(currentTimestamp.add(new BN("1000000")), { from: owner });
            let mintCost = await quantArtsNFTcontract.publicMintCost();
            let mintCostTotal = mintCost.mul(mintAmount);
            let maxSupply = await quantArtsNFTcontract.maxSupply();
            let minimumSoldSuplyNeeded = await quantArtsNFTcontract.minimumSoldSuplyNeeded();
            await time.increase("10");
            for (let i = 20; i < parseInt(((minimumSoldSuplyNeeded.div(mintAmount)).add(new BN("5"))).toString()); i++){
                await tokenContract.transfer(restUsers[i], toWei('100000', 'ether'));
                await tokenContract.approve(quantArtsNFTcontract.address, mintCostTotal, { from: restUsers[i] });
                await quantArtsNFTcontract.mint(mintAmount, { from: restUsers[i] });
                let userBalance = await quantArtsNFTcontract.balanceOf(restUsers[i]);
                userBalance.should.be.bignumber.equal(mintAmount);
            }
            await time.increase("100000");
            await expectRevert(
                quantArtsNFTcontract.refundMint({ from: restUsers[22] }),
                ErrorMsgs.mintHasNotFinished
            );
        });
    });
});