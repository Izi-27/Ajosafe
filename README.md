# AjoSafe - Ajo That Can't Run Away With Your Money

**Tagline:** Transform traditional Nigerian savings circles into automated, theft-proof smart contracts.

**Hackathon:** PL_Genesis: Frontiers of Collaboration  
**Track:** Flow: The Future of Finance  
**Additional Tracks:** Crypto Track, Filecoin, Infrastructure & Digital Rights

---

## 🎯 Problem

Traditional savings circles (Ajo/Esusu/Thrift) in Nigeria and across Africa face critical challenges:

- **38% experience theft** by collectors who abscond with funds
- **No enforcement** when members default after receiving payouts
- **60% of Nigerians are unbanked** - limited access to formal savings
- **Complex crypto onboarding** prevents adoption of blockchain solutions
- **Disputes over rules** lead to circle dissolution

## ✨ Solution

AjoSafe solves these problems through:

1. **Smart Contract Escrow** - No single person holds funds
2. **Automated Payouts** - Code executes on schedule, no human discretion
3. **Walletless Auth** - Email/passkey login via Web3Auth
4. **Immutable Rules** - Agreements stored on Filecoin, signed by all
5. **Forward Commitment** - Security deposits ensure future participation

---

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14 (React framework)
- Tailwind CSS (styling)
- Zustand (state management)
- React Query (data fetching)

**Blockchain:**
- Flow Blockchain (Testnet)
- Cadence (smart contract language)
- Flow Client Library (FCL)

**Storage:**
- Filecoin (via Lighthouse SDK)
- IPFS (via Web3.Storage)

**Authentication:**
- Web3Auth (walletless login)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Flow CLI (for contract deployment)

### Installation

1. **Clone the repository:**
```bash
cd C:\Users\shelby\CascadeProjects\ajosafe
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` and add:
- `NEXT_PUBLIC_WEB3AUTH_CLIENT_ID` - Get from [Web3Auth Dashboard](https://dashboard.web3auth.io/)
- `LIGHTHOUSE_API_KEY` - Get from [Lighthouse](https://files.lighthouse.storage/)
- `NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS` - Your deployed contract address

4. **Run development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📜 Smart Contract Deployment

### Deploy to Flow Testnet

1. **Install Flow CLI:**
```bash
sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"
```

2. **Create Flow account:**
```bash
flow keys generate
```

3. **Deploy contract:**
```bash
npm run deploy:contract
```

The contract will be deployed to Flow Testnet and the address will be displayed.

---

## 🎨 Features

### For Users

- **Create Circles** - Set contribution amount, frequency, and invite members
- **Join Circles** - Receive invite links via SMS/WhatsApp/Email
- **Make Contributions** - Pay on schedule with USDC or card
- **Receive Payouts** - Automatic transfers when it's your turn
- **Track Progress** - Real-time dashboard with all circle activity

### For Developers

- **Cadence Smart Contracts** - Resource-oriented programming
- **Filecoin Storage** - Decentralized agreement storage
- **Flow Authentication** - Seamless wallet integration
- **Event Monitoring** - Real-time blockchain events

---

## 📊 User Flows

### Creating a Circle

1. Connect wallet (email/passkey)
2. Fill in circle details (name, amount, frequency)
3. Add members (name, address, contact)
4. Review and deploy smart contract
5. Share invite links with members

### Making a Contribution

1. Receive notification (payment due)
2. Click "Pay Now" in dashboard
3. Choose payment method (USDC/card)
4. Confirm transaction
5. Receive receipt

### Receiving a Payout

1. System checks all contributions for the round
2. If complete, smart contract auto-executes payout
3. Funds sent to your wallet
4. Notification sent
5. Option to withdraw or reinvest

---

## 🔐 Security Features

- **Security Deposits** - 2x contribution amount locked upfront
- **Penalty System** - 10% penalty for late payments (configurable)
- **Grace Periods** - 24-hour grace before penalties
- **Expulsion Mechanism** - Auto-expel after 3 missed payments
- **Immutable Rules** - On-chain enforcement, no human override

---

## 🌍 Sponsor Integrations

### Flow Blockchain
- Walletless authentication via FCL
- Cadence smart contracts for circle logic
- Scheduled transactions for automated payouts
- Event system for real-time updates

### Filecoin
- Agreement storage (JSON + PDF)
- Member signatures
- Transaction history
- Verification via CID

### Web3Auth (Optional)
- Email/passkey login
- Social login support
- No seed phrases needed

---

## 📁 Project Structure

```
ajosafe/
├── contracts/              # Cadence smart contracts
│   └── AjoCircle.cdc
├── src/
│   ├── components/         # React components
│   │   ├── circles/
│   │   └── layout/
│   ├── lib/               # Utilities and integrations
│   │   ├── flow/          # Flow blockchain
│   │   ├── filecoin/      # Filecoin storage
│   │   └── utils/         # Helpers
│   ├── pages/             # Next.js pages
│   │   ├── index.js       # Landing page
│   │   ├── dashboard.js   # User dashboard
│   │   └── circles/       # Circle pages
│   ├── store/             # State management
│   └── styles/            # CSS
├── scripts/               # Deployment scripts
└── tests/                 # Test files
```

---

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run integration tests
npm run test:integration

# Run e2e tests
npm run test:e2e
```

---

## 🚢 Deployment

### Frontend (Vercel)

```bash
vercel deploy
```

### Smart Contract (Flow Testnet)

```bash
npm run deploy:contract
```

---

## 📈 Roadmap

### Phase 1 (Hackathon) ✅
- [x] Core smart contract
- [x] Circle creation flow
- [x] Contribution functionality
- [x] Filecoin integration
- [x] Basic UI

### Phase 2 (Post-Hackathon)
- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Fiat on-ramp integration
- [ ] Multi-currency support
- [ ] Reputation system

### Phase 3 (Future)
- [ ] Insurance pool
- [ ] Yield generation
- [ ] Cross-chain support
- [ ] DAO governance

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👥 Team

Built for PL_Genesis Hackathon

---

## 🔗 Links

- **Demo:** [https://ajosafe.vercel.app](https://ajosafe.vercel.app)
- **Contract:** [Flow Testnet Explorer](https://testnet.flowscan.org/)
- **Filecoin:** [Lighthouse Gateway](https://gateway.lighthouse.storage/)
- **Documentation:** [Docs](https://docs.ajosafe.com)

---

## 💡 Inspiration

AjoSafe is inspired by the millions of Africans who participate in informal savings groups but face risks of theft and default. We believe blockchain technology can preserve the community aspect of traditional Ajo while eliminating the trust issues.

---

## 🙏 Acknowledgments

- Flow Foundation for the amazing blockchain infrastructure
- Filecoin for decentralized storage
- Web3Auth for seamless authentication
- The Nigerian fintech community for inspiration

---

**Built with ❤️ for PL_Genesis Hackathon**
