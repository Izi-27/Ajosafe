// Cadence 1.0 compatible deployment transaction
transaction(contractName: String, contractCode: String) {
    prepare(signer: auth(AddContract) &Account) {
        signer.contracts.add(
            name: contractName,
            code: contractCode.utf8
        )
    }
}
