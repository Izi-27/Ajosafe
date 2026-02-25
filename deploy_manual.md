# Manual Contract Deployment Guide

Since the Flow CLI has Cadence 1.0 compatibility issues, here are alternative deployment methods:

## Method 1: Flow Playground (Easiest)

1. **Visit Flow Playground:**
   - Go to: https://play.flow.com/

2. **Create/Select Account:**
   - Click on "Account 0x01" or create a new account
   - Or connect your existing wallet

3. **Paste Contract Code:**
   - Copy the code from `contracts/AjoCircleSimple.cdc`
   - Paste it into the playground editor

4. **Deploy:**
   - Click the "Deploy" button
   - Confirm the transaction in your wallet
   - Copy the deployed contract address

5. **Update .env.local:**
   - Add the contract address to `NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS`

---

## Method 2: Flowscan Contract Deployment

1. **Go to Flowscan:**
   - Visit: https://testnet.flowscan.org/

2. **Navigate to Contract Deployment:**
   - Click "More" → "Deploy Contract"

3. **Fill in Details:**
   - Contract Name: `AjoCircle`
   - Contract Code: Paste from `contracts/AjoCircleSimple.cdc`
   - Connect your wallet

4. **Deploy and Confirm:**
   - Click "Deploy Contract"
   - Approve transaction in wallet
   - Copy the contract address

---

## Method 3: For Development - Use Pre-deployed Contract

For testing purposes, you can use the contract address:
```
0x8eb8c603de1620db
```

This is your testnet account address. Once you deploy the contract to this account, the contract will be accessible at:
```
0x8eb8c603de1620db.AjoCircle
```

---

## After Deployment

Once you have the contract address, update your `.env.local`:

```env
NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS=0xYOUR_CONTRACT_ADDRESS
```

Then run:
```bash
npm install
npm run dev
```

Your application will be fully functional!

---

## Troubleshooting

**If Flow Playground doesn't work:**
- Try using a different browser (Chrome recommended)
- Clear browser cache
- Make sure your wallet extension is updated

**If wallet connection fails:**
- Refresh the page
- Disconnect and reconnect wallet
- Check that you're on Flow Testnet

**Need help?**
- Flow Discord: https://discord.gg/flow
- Flow Documentation: https://developers.flow.com/
