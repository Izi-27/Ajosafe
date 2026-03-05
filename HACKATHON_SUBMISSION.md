# AjoSafe - PL_Genesis Hackathon Submission

> Historical submission snapshot. For the corrected current status, use `README.md`.

## 🏆 Project Information

**Project Name:** AjoSafe  
**Tagline:** Ajo that can't run away with your money  
**Hackathon:** PL_Genesis: Frontiers of Collaboration  
**Primary Track:** Flow: The Future of Finance  
**Additional Tracks:** Crypto Track, Filecoin, Infrastructure & Digital Rights

---

## 📝 Executive Summary

AjoSafe transforms traditional Nigerian savings circles (Ajo/Esusu/Thrift) into automated, theft-proof smart contracts on Flow blockchain. We solve the critical problem of trust in informal savings groups by using smart contract escrow, automated payouts, and immutable agreements stored on Filecoin.

**The Problem:** 38% of traditional Ajo groups experience theft by collectors who abscond with funds. Members have no recourse when someone defaults after receiving their payout.

**Our Solution:** Smart contracts hold all funds in escrow, payouts execute automatically on schedule, and all rules are immutably stored on Filecoin. No single person can run away with the money.

---

## 🎯 Problem Statement

### Traditional Ajo Challenges

1. **Theft by Collectors** - 38% of groups lose money when collectors disappear
2. **Post-Payout Defaults** - Members stop contributing after receiving their share
3. **No Bank Access** - 60% of Nigerians are unbanked
4. **Complex Crypto** - Wallet management scares away users
5. **Dispute Resolution** - Verbal agreements lead to conflicts

### Market Size

- **200M+ people** participate in rotating savings groups globally
- **$50B+** flows through informal savings annually in Africa
- **60%** of Nigerians lack access to formal banking
- **Growing diaspora** sending money home needs better solutions

---

## ✨ Solution Overview

### Core Features

1. **Smart Contract Escrow**
   - All contributions held in Flow smart contract
   - No single person controls funds
   - Automatic payout execution

2. **Immutable Rules**
   - Circle agreements stored on Filecoin
   - All members digitally sign
   - Rules cannot be changed mid-cycle

3. **Walletless Authentication**
   - Email/passkey login via Web3Auth
   - No seed phrases needed
   - Familiar UX for non-crypto users

4. **Automated Enforcement**
   - Security deposits (2x contribution)
   - Penalty system for late payments
   - Auto-expulsion after 3 misses

5. **Transparent History**
   - All transactions on-chain
   - Real-time dashboard
   - Complete audit trail

---

## 🏗️ Technical Architecture

### Technology Stack

**Blockchain Layer:**
- Flow Blockchain (Testnet)
- Cadence smart contracts
- Flow Client Library (FCL)

**Storage Layer:**
- Filecoin (via Synapse SDK)
- Server-side agreement upload/download adapter

**Frontend:**
- Next.js 14
- Tailwind CSS
- Zustand (state management)

**Authentication:**
- Web3Auth (walletless login)

### Smart Contract Design

```cadence
access(all) contract AjoCircle {
    access(all) struct Circle {
        access(all) let config: CircleConfig
        access(all) var members: {Address: Member}
        access(all) var currentRound: UInt64
        access(all) var roundContributions: {UInt64: {Address: Bool}}
        access(all) var roundPayouts: {UInt64: Address}
    }

    access(all) fun createCircle(...)
    access(all) fun contribute(circleId: UInt64, member: Address, round: UInt64, amount: UFix64)
    access(all) fun reportMissedPayment(circleId: UInt64, round: UInt64, member: Address)
}
```

### Filecoin Integration

**Stored on Filecoin:**
- Circle agreements (JSON + PDF)
- Member signatures
- Transaction history
- Circle metadata

**Benefits:**
- Immutable proof of agreement
- Decentralized storage
- Verifiable via CID
- No central authority

---

## 🎨 User Experience

### Creating a Circle (3 Steps)

1. **Basic Info**
   - Circle name, description
   - Contribution amount & frequency
   - Total rounds, penalty rate

2. **Add Members**
   - Name, Flow address, contact info
   - Bulk import via CSV
   - Generate invite links

3. **Review & Deploy**
   - Preview all settings
   - Deploy smart contract
   - Agreement stored on Filecoin

### Making Contributions

1. Receive notification (payment due)
2. Click "Pay Now" in dashboard
3. Choose payment method (USDC/card)
4. Confirm transaction
5. Receive receipt

### Receiving Payouts

1. All members contribute for the round
2. Smart contract auto-executes payout
3. Funds sent to recipient's wallet
4. Notification sent
5. Next round begins

---

## 🔐 Security & Trust

### Security Deposits
- 2x contribution amount locked upfront
- Ensures future participation
- Covers potential defaults

### Penalty System
- 10% penalty for late payments (configurable)
- 24-hour grace period
- Penalties taken from security deposit

### Expulsion Mechanism
- Auto-expel after 3 missed payments
- Remaining deposit distributed to active members
- Circle continues with remaining members

### Immutable Rules
- All rules stored on Filecoin
- Cannot be changed after deployment
- Cryptographic proof of agreement

---

## 🌟 Sponsor Technology Usage

### Flow Blockchain

**Why Flow:**
- Fast, low-cost transactions
- Resource-oriented programming (Cadence)
- Built-in account abstraction
- Excellent developer experience

**Flow Features Used:**
- Cadence smart contracts for circle logic
- FCL for authentication and transactions
- Event system for real-time updates
- Scheduled transactions for automated payouts

**Code Example:**
```cadence
access(all) fun contribute(circleId: UInt64, member: Address, round: UInt64, amount: UFix64) {
    let circle = self.circles[circleId]!
    assert(circle.members.containsKey(member), message: "Not a member of this circle")
    assert(amount == circle.config.contributionAmount, message: "Incorrect contribution amount")
}
```

### Filecoin

**Why Filecoin:**
- Decentralized, permanent storage
- Cryptographic verification
- No central point of failure
- Perfect for legal agreements

**Filecoin Features Used:**
- Agreement storage (JSON documents)
- Member signature proofs
- Transaction history archival
- CID-based verification

**Code Example:**
```javascript
export async function storeAgreementOnFilecoin(agreementData) {
  const response = await fetch('/api/filecoin/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'agreement',
      payload: agreementData,
    }),
  });

  return response.json();
}
```

### Web3Auth (Optional)

**Why Web3Auth:**
- Familiar login experience
- No seed phrases needed
- Social login support
- Reduces onboarding friction

---

## 📊 Impact & Use Cases

### Primary Users

1. **Nigerian Women's Groups**
   - Traditional Ajo participants
   - Market women associations
   - Church/mosque savings groups

2. **African Diaspora**
   - Sending money home
   - Supporting family circles
   - Cross-border savings

3. **Global Tontines**
   - ROSCAs worldwide
   - Community savings groups
   - Microfinance participants

### Expected Impact

- **Reduce theft** from 38% to near 0%
- **Increase participation** through trust
- **Enable unbanked** to access DeFi
- **Preserve culture** while adding safety
- **Scale globally** to 200M+ users

---

## 🚀 Demo & Links

**Live Demo:** https://ajosafe.vercel.app (to be deployed)  
**GitHub:** https://github.com/yourusername/ajosafe  
**Video Demo:** [YouTube Link]  
**Pitch Deck:** [Google Slides Link]

### Demo Credentials

```
Test Account 1: 0x... (Flow Testnet)
Test Account 2: 0x... (Flow Testnet)
```

### Demo Flow

1. Visit landing page
2. Connect wallet (email login)
3. Create a test circle
4. Add test members
5. Make contribution
6. View automated payout

---

## 🛣️ Roadmap

### Phase 1 - Hackathon (Current) ✅
- [x] Core smart contract
- [x] Circle creation flow
- [x] Contribution functionality
- [x] Filecoin integration
- [x] Basic UI/UX

### Phase 2 - Post-Hackathon (Q2 2026)
- [ ] Mobile app (React Native)
- [ ] SMS notifications
- [ ] Fiat on-ramp integration
- [ ] Multi-currency support
- [ ] Reputation system

### Phase 3 - Scale (Q3-Q4 2026)
- [ ] Insurance pool for defaults
- [ ] Yield generation on deposits
- [ ] Cross-chain support
- [ ] DAO governance
- [ ] Partnership with MFIs

### Phase 4 - Global (2027)
- [ ] Expand to other markets
- [ ] White-label solution
- [ ] Enterprise features
- [ ] Regulatory compliance

---

## 💼 Business Model

### Revenue Streams

1. **Transaction Fees** - 0.5% on contributions
2. **Premium Features** - Advanced analytics, insurance
3. **White-Label** - License to MFIs and banks
4. **Yield Sharing** - Interest on pooled deposits

### Go-to-Market

1. **Pilot** - 10 circles in Lagos (100 users)
2. **Community** - Partner with women's groups
3. **Influencers** - Nigerian fintech advocates
4. **Scale** - Expand to other African cities

---

## 👥 Team

**Solo Developer** - Built for PL_Genesis Hackathon

**Skills:**
- Full-stack development
- Blockchain/smart contracts
- UI/UX design
- Product management

**Looking For:**
- Co-founder (Business/Operations)
- Nigerian market expert
- Community manager

---

## 🙏 Acknowledgments

Special thanks to:
- **Flow Foundation** for amazing blockchain infrastructure
- **Filecoin** for decentralized storage solutions
- **Web3Auth** for seamless authentication
- **PL_Genesis** for hosting this hackathon
- **Nigerian fintech community** for inspiration

---

## 📄 Additional Resources

### Documentation
- [Technical Documentation](./docs/TECHNICAL.md)
- [API Reference](./docs/API.md)
- [Smart Contract Spec](./contracts/README.md)

### Research
- [Market Research](./docs/MARKET_RESEARCH.md)
- [User Interviews](./docs/USER_RESEARCH.md)
- [Competitive Analysis](./docs/COMPETITION.md)

### Legal
- [Terms of Service](./docs/TERMS.md)
- [Privacy Policy](./docs/PRIVACY.md)
- [Smart Contract Audit](./docs/AUDIT.md) (pending)

---

## 🔗 Contact

**Project Lead:** [Your Name]  
**Email:** hello@ajosafe.com  
**Twitter:** @ajosafe  
**Discord:** ajosafe#1234

---

**Built with ❤️ for PL_Genesis Hackathon**

*"Preserving African savings culture with blockchain technology"*
