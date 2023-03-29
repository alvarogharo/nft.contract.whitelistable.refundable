# Whitelistable, refundable, airdropable NFT contract
This repository contains a Solidity smart contract for minting Non-Fungible Tokens (NFTs) with various sale phases, signature-based whitelisting, airdrop functionality, and a refund mechanism if the required amount of sales is not reached.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Testing](#testing)
- [Contributing](#contributing)

## Features
- Multiple sale phases with adjustable pricing and duration
- Signature-based whitelisting for exclusive access to sales
- Airdrop functionality for promotional or reward purposes
- Refund mechanism if a minimum sale requirement is not met

## Installation
1. Clone the repository

```bash
git clone https://github.com/username/nft-minting-smart-contract.git
```

2. Navigate to the repository folder

```bash
cd nft-minting-smart-contract
```

3. Install the required dependencies

```bash
npm install
```

or

```bash
yarn
```

## Testing

### With gas estimation
This testing mode will geneate report with the gas compsumption of each method of the smart contract

1. Start ganache

```bash   
yarn ganache
```

2. Run the tests in another terminal

```bash
yarn test
```

### With coverage
This testing mode measures code coverage adn creates a report on a `./coverage` folder

1. Run coverage tests

```bash
yarn coverage
```

## Contributing
Contributions are welcome! Create a pr for the code to be reviewed and start a conversation for the merge.