pub contract AjoCircle {
    
    pub event CircleCreated(circleId: UInt64, creator: Address, name: String)
    pub event MemberJoined(circleId: UInt64, member: Address)
    pub event ContributionMade(circleId: UInt64, member: Address, round: UInt64, amount: UFix64)
    pub event PayoutExecuted(circleId: UInt64, recipient: Address, round: UInt64, amount: UFix64)
    pub event MemberDefaulted(circleId: UInt64, member: Address, missedRound: UInt64)
    pub event MemberExpelled(circleId: UInt64, member: Address, reason: String)
    pub event CircleCompleted(circleId: UInt64)
    pub event CirclePaused(circleId: UInt64, reason: String)
    
    pub enum CircleStatus: UInt8 {
        pub case ACTIVE
        pub case PAUSED
        pub case COMPLETED
        pub case DISSOLVED
    }
    
    pub enum MemberStatus: UInt8 {
        pub case ACTIVE
        pub case GRACE_PERIOD
        pub case DEFAULTED
        pub case EXPELLED
    }
    
    pub struct Member {
        pub let address: Address
        pub let name: String
        pub let phone: String?
        pub let email: String?
        pub let joinedAt: UFix64
        pub var status: MemberStatus
        pub var roundsPaid: [UInt64]
        pub var missedRounds: [UInt64]
        pub var depositAmount: UFix64
        pub var depositPaid: Bool
        pub var missedCount: UInt64
        
        init(address: Address, name: String, phone: String?, email: String?, depositAmount: UFix64) {
            self.address = address
            self.name = name
            self.phone = phone
            self.email = email
            self.joinedAt = getCurrentBlock().timestamp
            self.status = MemberStatus.ACTIVE
            self.roundsPaid = []
            self.missedRounds = []
            self.depositAmount = depositAmount
            self.depositPaid = false
            self.missedCount = 0
        }
        
        pub fun markPaid(round: UInt64) {
            self.roundsPaid.append(round)
        }
        
        pub fun markMissed(round: UInt64) {
            self.missedRounds.append(round)
            self.missedCount = self.missedCount + 1
        }
        
        pub fun setStatus(status: MemberStatus) {
            self.status = status
        }
        
        pub fun setDepositPaid() {
            self.depositPaid = true
        }
    }
    
    pub struct CircleConfig {
        pub let name: String
        pub let description: String
        pub let contributionAmount: UFix64
        pub let contributionFrequency: UInt64
        pub let totalRounds: UInt64
        pub let securityDeposit: UFix64
        pub let penaltyRate: UFix64
        pub let gracePeriod: UInt64
        pub let maxMissesBeforeExpulsion: UInt64
        pub let agreementCID: String
        pub let payoutOrder: [Address]
        
        init(
            name: String,
            description: String,
            contributionAmount: UFix64,
            contributionFrequency: UInt64,
            totalRounds: UInt64,
            securityDeposit: UFix64,
            penaltyRate: UFix64,
            gracePeriod: UInt64,
            maxMissesBeforeExpulsion: UInt64,
            agreementCID: String,
            payoutOrder: [Address]
        ) {
            self.name = name
            self.description = description
            self.contributionAmount = contributionAmount
            self.contributionFrequency = contributionFrequency
            self.totalRounds = totalRounds
            self.securityDeposit = securityDeposit
            self.penaltyRate = penaltyRate
            self.gracePeriod = gracePeriod
            self.maxMissesBeforeExpulsion = maxMissesBeforeExpulsion
            self.agreementCID = agreementCID
            self.payoutOrder = payoutOrder
        }
    }
    
    pub struct Circle {
        pub let id: UInt64
        pub let config: CircleConfig
        pub let creator: Address
        pub var members: {Address: Member}
        pub var status: CircleStatus
        pub var currentRound: UInt64
        pub var totalCollected: UFix64
        pub let startTime: UFix64
        pub var lastPayoutTime: UFix64?
        pub var nextPayoutTime: UFix64?
        pub var pausedUntil: UFix64?
        pub var pauseReason: String?
        pub var completionTime: UFix64?
        pub var roundContributions: {UInt64: {Address: Bool}}
        pub var roundPayouts: {UInt64: Address}
        pub var pauseVotes: {Address: Bool}
        pub var dissolveVotes: {Address: Bool}
        
        init(id: UInt64, config: CircleConfig, creator: Address) {
            self.id = id
            self.config = config
            self.creator = creator
            self.members = {}
            self.status = CircleStatus.ACTIVE
            self.currentRound = 0
            self.totalCollected = 0.0
            self.startTime = getCurrentBlock().timestamp
            self.lastPayoutTime = nil
            self.nextPayoutTime = nil
            self.pausedUntil = nil
            self.pauseReason = nil
            self.completionTime = nil
            self.roundContributions = {}
            self.roundPayouts = {}
            self.pauseVotes = {}
            self.dissolveVotes = {}
        }
        
        pub fun addMember(member: Member) {
            self.members[member.address] = member
        }
        
        pub fun recordContribution(member: Address, round: UInt64, amount: UFix64) {
            if !self.roundContributions.containsKey(round) {
                self.roundContributions[round] = {}
            }
            self.roundContributions[round]!.insert(key: member, true)
            self.totalCollected = self.totalCollected + amount
        }
        
        pub fun recordPayout(round: UInt64, recipient: Address) {
            self.roundPayouts[round] = recipient
            self.lastPayoutTime = getCurrentBlock().timestamp
            self.nextPayoutTime = self.lastPayoutTime! + self.config.contributionFrequency
            self.currentRound = round
        }
        
        pub fun setStatus(status: CircleStatus) {
            self.status = status
        }
        
        pub fun complete() {
            self.status = CircleStatus.COMPLETED
            self.completionTime = getCurrentBlock().timestamp
        }
    }
    
    pub var circles: @{UInt64: Circle}
    pub var nextCircleId: UInt64
    pub var userCircles: {Address: [UInt64]}
    
    init() {
        self.circles <- {}
        self.nextCircleId = 1
        self.userCircles = {}
    }
    
    pub fun createCircle(
        name: String,
        description: String,
        contributionAmount: UFix64,
        contributionFrequency: UInt64,
        totalRounds: UInt64,
        penaltyRate: UFix64,
        agreementCID: String,
        memberAddresses: [Address],
        memberNames: [String],
        memberPhones: [String?],
        memberEmails: [String?]
    ): UInt64 {
        pre {
            memberAddresses.length == memberNames.length: "Member data length mismatch"
            memberAddresses.length > 1: "Need at least 2 members"
        }
        
        let creator = self.account.address
        let securityDeposit = contributionAmount * 2.0
        let payoutOrder = self.generatePayoutOrder(memberAddresses)
        
        let config = CircleConfig(
            name: name,
            description: description,
            contributionAmount: contributionAmount,
            contributionFrequency: contributionFrequency,
            totalRounds: totalRounds,
            securityDeposit: securityDeposit,
            penaltyRate: penaltyRate,
            gracePeriod: 86400,
            maxMissesBeforeExpulsion: 3,
            agreementCID: agreementCID,
            payoutOrder: payoutOrder
        )
        
        let circleId = self.nextCircleId
        let circle <- create Circle(id: circleId, config: config, creator: creator)
        
        var i = 0
        while i < memberAddresses.length {
            let member = Member(
                address: memberAddresses[i],
                name: memberNames[i],
                phone: memberPhones[i],
                email: memberEmails[i],
                depositAmount: securityDeposit
            )
            circle.addMember(member: member)
            
            if self.userCircles.containsKey(memberAddresses[i]) {
                self.userCircles[memberAddresses[i]]!.append(circleId)
            } else {
                self.userCircles[memberAddresses[i]] = [circleId]
            }
            
            i = i + 1
        }
        
        self.circles[circleId] <-! circle
        self.nextCircleId = self.nextCircleId + 1
        
        emit CircleCreated(circleId: circleId, creator: creator, name: name)
        
        return circleId
    }
    
    pub fun contribute(circleId: UInt64, round: UInt64, amount: UFix64) {
        pre {
            self.circles.containsKey(circleId): "Circle not found"
        }
        
        let circleRef = &self.circles[circleId] as &Circle
        let memberAddress = self.account.address
        
        assert(circleRef.members.containsKey(memberAddress), message: "Not a member")
        assert(circleRef.status == CircleStatus.ACTIVE, message: "Circle not active")
        assert(amount == circleRef.config.contributionAmount, message: "Incorrect amount")
        
        let memberRef = &circleRef.members[memberAddress] as &Member
        memberRef.markPaid(round: round)
        
        if memberRef.status == MemberStatus.GRACE_PERIOD {
            memberRef.setStatus(status: MemberStatus.ACTIVE)
        }
        
        circleRef.recordContribution(member: memberAddress, round: round, amount: amount)
        
        emit ContributionMade(circleId: circleId, member: memberAddress, round: round, amount: amount)
        
        if self.checkAllContributionsPaid(circleId: circleId, round: round) {
            self.executePayout(circleId: circleId, round: round)
        }
    }
    
    pub fun executePayout(circleId: UInt64, round: UInt64) {
        pre {
            self.circles.containsKey(circleId): "Circle not found"
        }
        
        let circleRef = &self.circles[circleId] as &Circle
        
        assert(self.checkAllContributionsPaid(circleId: circleId, round: round), message: "Not all contributions received")
        
        let recipientIndex = Int((round - 1) % UInt64(circleRef.config.payoutOrder.length))
        let recipient = circleRef.config.payoutOrder[recipientIndex]
        
        let payoutAmount = UFix64(circleRef.members.length) * circleRef.config.contributionAmount
        
        circleRef.recordPayout(round: round, recipient: recipient)
        
        emit PayoutExecuted(circleId: circleId, recipient: recipient, round: round, amount: payoutAmount)
        
        if round == circleRef.config.totalRounds {
            circleRef.complete()
            emit CircleCompleted(circleId: circleId)
        }
    }
    
    pub fun reportMissedPayment(circleId: UInt64, round: UInt64, member: Address) {
        pre {
            self.circles.containsKey(circleId): "Circle not found"
        }
        
        let circleRef = &self.circles[circleId] as &Circle
        
        assert(circleRef.members.containsKey(member), message: "Member not found")
        
        let memberRef = &circleRef.members[member] as &Member
        
        if !circleRef.roundContributions.containsKey(round) || 
           !circleRef.roundContributions[round]!.containsKey(member) {
            
            memberRef.markMissed(round: round)
            
            if memberRef.missedCount >= circleRef.config.maxMissesBeforeExpulsion {
                self.expelMember(circleId: circleId, member: member, reason: "Exceeded maximum missed payments")
            } else {
                memberRef.setStatus(status: MemberStatus.GRACE_PERIOD)
            }
            
            emit MemberDefaulted(circleId: circleId, member: member, missedRound: round)
        }
    }
    
    pub fun expelMember(circleId: UInt64, member: Address, reason: String) {
        pre {
            self.circles.containsKey(circleId): "Circle not found"
        }
        
        let circleRef = &self.circles[circleId] as &Circle
        
        assert(self.account.address == circleRef.creator, message: "Only creator can expel")
        assert(circleRef.members.containsKey(member), message: "Member not found")
        
        let memberRef = &circleRef.members[member] as &Member
        memberRef.setStatus(status: MemberStatus.EXPELLED)
        
        emit MemberExpelled(circleId: circleId, member: member, reason: reason)
    }
    
    access(self) fun generatePayoutOrder(_ members: [Address]): [Address] {
        var shuffled = members
        var i = shuffled.length - 1
        while i > 0 {
            let j = Int(getCurrentBlock().timestamp % UInt64(i + 1))
            let temp = shuffled[i]
            shuffled[i] = shuffled[j]
            shuffled[j] = temp
            i = i - 1
        }
        return shuffled
    }
    
    access(self) fun checkAllContributionsPaid(circleId: UInt64, round: UInt64): Bool {
        let circleRef = &self.circles[circleId] as &Circle
        
        if !circleRef.roundContributions.containsKey(round) {
            return false
        }
        
        for memberAddr in circleRef.members.keys {
            let member = circleRef.members[memberAddr]!
            if member.status == MemberStatus.EXPELLED {
                continue
            }
            
            if !circleRef.roundContributions[round]!.containsKey(memberAddr) {
                return false
            }
        }
        
        return true
    }
    
    pub fun getCircle(circleId: UInt64): Circle? {
        return self.circles[circleId]
    }
    
    pub fun getUserCircles(address: Address): [UInt64]? {
        return self.userCircles[address]
    }
    
    pub fun getMemberInfo(circleId: UInt64, member: Address): Member? {
        if let circleRef = &self.circles[circleId] as &Circle? {
            return circleRef.members[member]
        }
        return nil
    }
    
    pub fun getNextPayout(circleId: UInt64): Address? {
        if let circleRef = &self.circles[circleId] as &Circle? {
            if circleRef.status != CircleStatus.ACTIVE {
                return nil
            }
            
            let nextRound = circleRef.currentRound + 1
            if nextRound > circleRef.config.totalRounds {
                return nil
            }
            
            let recipientIndex = Int((nextRound - 1) % UInt64(circleRef.config.payoutOrder.length))
            return circleRef.config.payoutOrder[recipientIndex]
        }
        return nil
    }
}
