const { soliditySha3, toWei } = require("web3-utils");
const Web3 = require("web3");
const dotenv = require('dotenv');
const path = require('path');
const { BN } = require('@openzeppelin/test-helpers');
const csvToJson = require('convert-csv-to-json');
const fs = require("fs");

dotenv.config({
    path: path.resolve(__dirname, process.env.NODE_ENV)
});

const web3 = new Web3("https://mainnet.infura.io/v3/");
const QA_REFERRER = '0x6dD95fC28D5eCa89E8170E609E46414a829b0457';

sign = async () => {

    let signaturesJSON = {};
    let json = csvToJson.fieldDelimiter(',').getJsonFromCsv(path.resolve(__dirname, "./all.csv"));
    let i = 0;
    let scCount = 0;
    let invalidCount = 0;
    let guaranteed = 0;
    for (tuple of json) {
        try {
            let code = await web3.eth.getCode(tuple.address);
            if (code === "0x") {
                tuple.isGuaranteed = tuple.isGuaranteed === "TRUE";
                tuple.unitPrice = toWei(tuple.unitPrice, "lovelace");
                tuple.maxAmount = parseInt(tuple.maxAmount);
                let msgHash = soliditySha3({ type: "address", value: tuple.address }, { type: "address", value: tuple.referrer },
                    { type: "uint256", value: tuple.maxAmount },
                    { type: "uint256", value: tuple.unitPrice },
                    { type: "bool", value: tuple.isGuaranteed });
                tuple.msgHash = msgHash;
                tuple.signature = await web3.eth.accounts.sign(msgHash, process.env.PRIVATE_KEY).signature;
                if (!signaturesJSON[tuple.address] || signaturesJSON[tuple.address].referrer === QA_REFERRER || (signaturesJSON[tuple.address].isGuaranteed === false && tuple.isGuaranteed === true) || (tuple.when !== '' && signaturesJSON[tuple.address] && signaturesJSON[tuple.address].when && signaturesJSON[tuple.address].when > tuple.when)) {
                    signaturesJSON[tuple.address] = tuple;
                    if (tuple.isGuaranteed) {
                        guaranteed += tuple.maxAmount;
                    }
                }
            } else {
                scCount++;
            }
        } catch (error) {
            invalidCount++;
            console.log(error);
        }
        console.log(i++ / json.length);
    }

    fs.writeFileSync(path.resolve(__dirname, "./signaturesAll.json"), JSON.stringify(signaturesJSON, null, 4));

    console.log('---------------------------')
    console.log('Invalid: ' + invalidCount);
    console.log('SmartContracts: ' + scCount);
    console.log('Guaranteed: ' + guaranteed);
    console.log('Count: ' + Object.keys(signaturesJSON).length);

    process.exit();
}

sign();