# Overview

AlgoPotato is a community-driven, non-commercial decentralized game built on Algorand that implements a "Hot Potato" mechanic using verifiable random functions (VRF). This frontend repository provides the user interface for interacting with the AlgoPotato smart contract, developed purely as a public good for the blockchain gaming community and educational purposes. All development efforts are volunteer-based with no profit motive, ensuring that the platform remains accessible to everyone without hidden fees or monetization strategies.

For a more detailed explanation of the game mechanics please refer to the [Smart Contract repo](https://github.com/atsoc1993/Hot-Potato-Contract-AVM)

## Current State

- Testnet only
- No cancel game
- No disabling of 'play game' button 15 rounds after the vrf round
- Asset game hooks are implemented but not yet integrated with frontend

## Getting Started

You can visit the [Testnet deployment](https://algo-potato-frontend.vercel.app/) to play the game or you can run the front end locally by doing the following.

First install the package dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

then, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
