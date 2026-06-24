# Privacy-Preserving AI Bounty Judge

A decentralized bounty platform built on the **Ritual Chain**, utilizing a **Commit-Reveal** scheme to prevent answer-copying. Participants submit hashed commitments before the deadline, and only reveal their plaintext answers once the submission window closes. After the reveal phase, an AI agent (via Ritual's Precompile infrastructure) evaluates all eligible submissions according to a custom rubric, and the bounty owner finalizes a winner.

**Developers:** Cranky and Oreganoflakes

---

## Architecture Overview

The platform solves the common "free-rider" problem in public blockchain bounties:
1. **Commit Phase**: Participants hash their `answer + salt + address + bountyId` and submit only the hash to the smart contract. The actual answer remains private.
2. **Reveal Phase**: Once the commit deadline passes, participants submit their plaintext answer and salt. The contract verifies the hash matches the commitment.
3. **AI Judging Phase**: The bounty owner triggers a Ritual AI inference request. The AI evaluates all valid (revealed) submissions against the bounty's rubric.
4. **Finalization Phase**: The bounty owner reviews the AI's advisory evaluation and selects the final winner. The smart contract distributes the locked reward.

---

## Tech Stack

- **Smart Contracts**: Solidity, Hardhat, Ignition
- **AI Integration**: Ritual LLM Precompile
- **Frontend**: Next.js, React, Tailwind CSS, Wagmi, Viem

---

## Getting Started

### 1. Smart Contract Deployment

**Option A: Local Hardhat Node**
Start a local Hardhat node (which simulates the Ritual Precompile):
```bash
cd hardhat
pnpm install
npx hardhat node
```

In a new terminal, deploy the Commit-Reveal contract to your local node:
```bash
cd hardhat
npx hardhat ignition deploy ignition/modules/AIJudgeCommitReveal.ts --network localhost
```

**Option B: Ritual Testnet Deployment**
To deploy to the live Ritual Testnet, ensure you have your private key configured in `hardhat.config.ts`, then run:
```bash
cd hardhat
npx hardhat ignition deploy ignition/modules/AIJudgeCommitReveal.ts --network ritual
```

### 2. Frontend Setup

Navigate to the `web` directory and install dependencies:
```bash
cd web
pnpm install
```

Copy the example environment file:
```bash
cp .env.example .env.local
```

Edit `.env.local` to include your newly deployed contract address:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS="0xYourContractAddressHere"
```
*(Note: If testing on the Ritual Testnet, ensure the Wagmi configuration in `web/src/config/wagmi.ts` points to Chain ID 1979).*

Start the development server:
```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

---

## Important Quirks to Note

- **Ritual Testnet Timestamps**: The Ritual public testnet currently uses millisecond-precision `block.timestamp` values, unlike the EVM standard of seconds. The frontend automatically detects if you are connected to Ritual Chain (ID 1979) and scales the timestamps accordingly to ensure deadlines are processed correctly by the smart contract.

## Deploying to Vercel

Because this repository is a **monorepo** (it contains both `hardhat` and `web` directories), you need to configure Vercel properly to build the Next.js frontend.

1. **Import Project**: Go to [Vercel](https://vercel.com/new) and import your GitHub repository.
2. **Set the Root Directory**: In the "Configure Project" screen, look for **Root Directory**. Click **Edit** and select the **`web`** folder. (This tells Vercel where the Next.js app lives).
3. **Add Environment Variables**: Expand the "Environment Variables" section and add the following keys so the UI can connect to the Ritual Testnet:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` = `0xYourDeployedContractAddress`
   - `NEXT_PUBLIC_RITUAL_RPC_URL` = `https://rpc.ritualfoundation.org`
   - `NEXT_PUBLIC_RITUAL_CHAIN_ID` = `1979`
   - `NEXT_PUBLIC_RITUAL_EXECUTOR_ADDRESS` = `0xB42e435c4252A5a2E7440e37B609F00c61a0c91B`
4. **Deploy**: Click the Deploy button. Vercel will automatically run `pnpm install` and `pnpm build` inside the `web` folder.

---

## Acknowledgments
Built during the Ritual Chain Workshop.
