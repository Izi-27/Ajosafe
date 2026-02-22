const fcl = require('@onflow/fcl');
const fs = require('fs');
const path = require('path');

fcl.config({
  'accessNode.api': 'https://rest-testnet.onflow.org',
  'discovery.wallet': 'https://fcl-discovery.onflow.org/testnet/authn',
});

async function deployAjoCircle() {
  console.log('🚀 Deploying AjoCircle contract to Flow Testnet...\n');

  try {
    const contractPath = path.join(__dirname, '../contracts/AjoCircle.cdc');
    const contractCode = fs.readFileSync(contractPath, 'utf8');

    console.log('📄 Contract loaded from:', contractPath);
    console.log('📏 Contract size:', contractCode.length, 'bytes\n');

    console.log('⚠️  IMPORTANT: You need to deploy this contract manually using Flow CLI');
    console.log('   Follow these steps:\n');
    console.log('   1. Install Flow CLI: sh -ci "$(curl -fsSL https://storage.googleapis.com/flow-cli/install.sh)"');
    console.log('   2. Create a testnet account: flow keys generate');
    console.log('   3. Fund your account: https://testnet-faucet.onflow.org/');
    console.log('   4. Create flow.json config file');
    console.log('   5. Deploy: flow project deploy --network=testnet\n');

    console.log('📋 Sample flow.json configuration:\n');
    console.log(`{
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
}\n`);

    console.log('✅ Contract ready for deployment!');
    console.log('📝 After deployment, update NEXT_PUBLIC_FLOW_CONTRACT_ADDRESS in .env.local\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deployAjoCircle();
