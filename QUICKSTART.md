# AjoSafe - Quick Start Guide

Get AjoSafe running locally in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Flow CLI (optional, for contract deployment)

## Installation

### 1. Navigate to Project Directory

```bash
cd C:\Users\shelby\CascadeProjects\ajosafe
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

```env
# Flow Configuration
NEXT_PUBLIC_FLOW_NETWORK=testnet
NEXT_PUBLIC_FLOW_ACCESS_NODE=https://rest-testnet.onflow.org
NEXT_PUBLIC_FLOW_DISCOVERY_WALLET=https://fcl-discovery.onflow.org/testnet/authn
NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS

# Web3Auth (Get from https://dashboard.web3auth.io/)
NEXT_PUBLIC_WEB3AUTH_CLIENT_ID=YOUR_CLIENT_ID

# Lighthouse (Get from https://files.lighthouse.storage/)
LIGHTHOUSE_API_KEY=YOUR_API_KEY

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=AjoSafe
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## Getting API Keys

### Web3Auth

1. Go to [Web3Auth Dashboard](https://dashboard.web3auth.io/)
2. Sign up/Login
3. Create a new project
4. Copy the Client ID
5. Add to `.env.local`

### Lighthouse (Filecoin)

1. Go to [Lighthouse](https://files.lighthouse.storage/)
2. Sign up with your wallet
3. Generate API key
4. Copy the key
5. Add to `.env.local`

## Deploying the Smart Contract

### Option 1: Use Pre-deployed Contract (Recommended for Testing)

Use the testnet contract address provided in the documentation.

### Option 2: Deploy Your Own

1. **Install Flow CLI:**

```bash
# macOS/Linux
sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"

# Windows (PowerShell)
iex "& { $(irm 'https://storage.googleapis.com/flow-cli/install.ps1') }"
```

2. **Generate Flow Keys:**

```bash
flow keys generate
```

Save the private key and public key.

3. **Create Flow Testnet Account:**

Go to [Flow Testnet Faucet](https://testnet-faucet.onflow.org/) and create an account with your public key.

4. **Create flow.json:**

```json
{
  "contracts": {
    "AjoCircle": "./contracts/AjoCircle.cdc"
  },
  "networks": {
    "testnet": "access.devnet.nodes.onflow.org:9000"
  },
  "accounts": {
    "testnet-account": {
      "address": "YOUR_TESTNET_ADDRESS",
      "key": "YOUR_PRIVATE_KEY"
    }
  },
  "deployments": {
    "testnet": {
      "testnet-account": ["AjoCircle"]
    }
  }
}
```

5. **Deploy Contract:**

```bash
flow project deploy --network=testnet
```

6. **Update .env.local:**

Add your contract address to `NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS`.

## Testing the Application

### Create a Test Circle

1. Connect wallet (use email login)
2. Click "Create Circle"
3. Fill in details:
   - Name: "Test Circle"
   - Amount: $50
   - Frequency: Weekly
   - Rounds: 4
4. Add test members (use different Flow addresses)
5. Review and deploy

### Make a Contribution

1. Go to Dashboard
2. Click on your circle
3. Click "Make Contribution"
4. Confirm transaction
5. View updated status

## Troubleshooting

### Port Already in Use

```bash
# Kill process on port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Flow Connection Issues

- Check that Flow testnet is accessible
- Verify your contract address is correct
- Ensure you have testnet FLOW tokens

### Filecoin Upload Fails

- Verify your Lighthouse API key
- Check file size (max 100MB on free tier)
- Ensure internet connection is stable

## Development Tips

### Hot Reload

The dev server supports hot reload. Changes to files will automatically refresh the browser.

### View Logs

```bash
# Frontend logs
npm run dev

# Contract events
flow events get A.CONTRACT_ADDRESS.AjoCircle.CircleCreated
```

### Reset State

To start fresh:

```bash
# Clear browser storage
# In browser: DevTools > Application > Clear Storage

# Redeploy contract
flow project deploy --network=testnet --update
```

## Next Steps

- Read the [full documentation](./README.md)
- Explore the [smart contract](./contracts/AjoCircle.cdc)
- Check out [user flows](./docs/USER_FLOWS.md)
- Join our [Discord community](#)

## Need Help?

- **Documentation:** [README.md](./README.md)
- **Issues:** [GitHub Issues](#)
- **Discord:** [Join our server](#)
- **Email:** hello@ajosafe.com

---

**Happy Building! 🚀**
