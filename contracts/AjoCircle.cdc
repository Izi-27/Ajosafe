access(all) contract AjoCircle {
    
    access(all) event CircleCreated(circleId: UInt64, creator: Address, name: String)
    access(all) event MemberJoined(circleId: UInt64, member: Address)
    access(all) event ContributionMade(circleId: UInt64, member: Address, round: UInt64, amount: UFix64)
    access(all) event PayoutExecuted(circleId: UInt64, recipient: Address, round: UInt64, amount: UFix64)
    access(all) event MemberDefaulted(circleId: UInt64, member: Address, missedRound: UInt64)
    access(all) event MemberExpelled(circleId: UInt64, member: Address, reason: String)
    access(all) event CircleCompleted(circleId: UInt64)
    access(all) event CirclePaused(circleId: UInt64, reason: String)
    
    access(all) enum CircleStatus: UInt8 {
        access(all) case ACTIVE
        access(all) case PAUSED
        access(all) case COMPLETED
        access(all) case DISSOLVED
    }
    
    access(all) enum MemberStatus: UInt8 {
        access(all) case ACTIVE
        access(all) case GRACE_PERIOD
        access(all) case DEFAULTED
        access(all) case EXPELLED
    }
    
    access(all) struct Member {
        access(all) let address: Address
        access(all) let name: String
        access(all) let phone: String?
        access(all) let email: String?
        access(all) let joinedAt: UFix64
        access(all) var status: MemberStatus
        access(all) var roundsPaid: [UInt64]
        access(all) var missedRounds: [UInt64]
        access(all) var depositAmount: UFix64
        access(all) var depositPaid: Bool
        access(all) var missedCount: UInt64
        
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
        
        access(all) fun markPaid(round: UInt64) {
            self.roundsPaid.append(round)
        }
        
        access(all) fun markMissed(round: UInt64) {
            self.missedRounds.append(round)
            self.missedCount = self.missedCount + 1
        }
        
        access(all) fun setStatus(status: MemberStatus) {
            self.status = status
        }
        
        access(all) fun setDepositPaid() {
            self.depositPaid = true
        }
    }
    
    access(all) struct CircleConfig {
        access(all) let name: String
        access(all) let description: String
        access(all) let contributionAmount: UFix64
        access(all) let contributionFrequency: UInt64
        access(all) let totalRounds: UInt64
        access(all) let securityDeposit: UFix64
        access(all) let penaltyRate: UFix64
        access(all) let gracePeriod: UInt64
        access(all) let maxMissesBeforeExpulsion: UInt64
        access(all) let agreementCID: String
        access(all) let payoutOrder: [Address]
        
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
    
    access(all) struct Circle {
        access(all) let id: UInt64
        access(all) let config: CircleConfig
        access(all) let creator: Address
        access(all) var members: {Address: Member}
        access(all) var status: CircleStatus
        access(all) var currentRound: UInt64
        access(all) var totalCollected: UFix64
        access(all) let startTime: UFix64
        access(all) var lastPayoutTime: UFix64?
        access(all) var nextPayoutTime: UFix64?
        access(all) var pausedUntil: UFix64?
        access(all) var pauseReason: String?
        access(all) var completionTime: UFix64?
        access(all) var roundContributions: {UInt64: {Address: Bool}}
        access(all) var roundPayouts: {UInt64: Address}
        access(all) var pauseVotes: {Address: Bool}
        access(all) var dissolveVotes: {Address: Bool}
        
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
        
        access(all) fun addMember(member: Member) {
            self.members[member.address] = member
        }
        
        access(all) fun recordContribution(member: Address, round: UInt64, amount: UFix64) {
            if !self.roundContributions.containsKey(round) {
                self.roundContributions[round] = {}
            }
            self.roundContributions[round]!.insert(key: member, true)
            self.totalCollected = self.totalCollected + amount
        }
        
        access(all) fun recordPayout(round: UInt64, recipient: Address) {
            self.roundPayouts[round] = recipient
            self.lastPayoutTime = getCurrentBlock().timestamp
            self.nextPayoutTime = self.lastPayoutTime! + UFix64(self.config.contributionFrequency)
            self.currentRound = round
        }
        
        access(all) fun setStatus(status: CircleStatus) {
            self.status = status
        }
        
        access(all) fun complete() {
            self.status = CircleStatus.COMPLETED
            self.completionTime = getCurrentBlock().timestamp
        }
    }
    
    access(all) var circles: {UInt64: Circle}
    access(all) var nextCircleId: UInt64
    access(all) var userCircles: {Address: [UInt64]}
    
    init() {
        self.circles = {}
        self.nextCircleId = 1
        self.userCircles = {}
    }
    
    access(all) fun createCircle(
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
        let circle = Circle(id: circleId, config: config, creator: creator)
        
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
        
        self.circles[circleId] = circle
        self.nextCircleId = self.nextCircleId + 1
        
        emit CircleCreated(circleId: circleId, creator: creator, name: name)
        
        return circleId
    }
    
    access(all) fun contribute(circleId: UInt64, round: UInt64, amount: UFix64) {
        pre {
            self.circles.containsKey(circleId): "Circle not found"
        }
        
        let memberAddress = self.account.address
        let circle = self.circles[circleId]!
        
        assert(circle.members.containsKey(memberAddress), message: "Not a member")
        assert(circle.status == CircleStatus.ACTIVE, message: "Circle not active")
        assert(amount == circle.config.contributionAmount, message: "Incorrect amount")
        
        var member = circle.members[memberAddress]!
        member.markPaid(round: round)
        if member.status == MemberStatus.GRACE_PERIOD {
            member.setStatus(status: MemberStatus.ACTIVE)
        }
        
        var updatedCircle = circle
        updatedCircle.members[memberAddress] = member
        updatedCircle.recordContribution(member: memberAddress, round: round, amount: amount)
        self.circles[circleId] = updatedCircle
        
        emit ContributionMade(circleId: circleId, member: memberAddress, round: round, amount: amount)
        
        if self.checkAllContributionsPaid(circleId: circleId, round: round) {
            self.executePayout(circleId: circleId, round: round)
        }
    }
    
    access(all) fun executePayout(circleId: UInt64, round: UInt64) {
        pre {
            self.circles.containsKey(circleId): "Circle not found"
        }
        
        let circle = self.circles[circleId]!
        
        assert(self.checkAllContributionsPaid(circleId: circleId, round: round), message: "Not all contributions received")
        
        let recipientIndex = Int((round - 1) % UInt64(circle.config.payoutOrder.length))
        let recipient = circle.config.payoutOrder[recipientIndex]
        
        let payoutAmount = UFix64(circle.members.length) * circle.config.contributionAmount
        
        var updatedCircle = circle
        updatedCircle.recordPayout(round: round, recipient: recipient)
        if round == updatedCircle.config.totalRounds {
            updatedCircle.complete()
        }
        self.circles[circleId] = updatedCircle
        
        emit PayoutExecuted(circleId: circleId, recipient: recipient, round: round, amount: payoutAmount)
        
        if round == circle.config.totalRounds {
            emit CircleCompleted(circleId: circleId)
        }
    }
    
    access(all) fun reportMissedPayment(circleId: UInt64, round: UInt64, member: Address) {
        pre {
            self.circles.containsKey(circleId): "Circle not found"
        }
        
        let circle = self.circles[circleId]!
        assert(circle.members.containsKey(member), message: "Member not found")
        
        if !circle.roundContributions.containsKey(round) ||
           !circle.roundContributions[round]!.containsKey(member) {
            
            var mem = circle.members[member]!
            mem.markMissed(round: round)
            
            var updatedCircle = circle
            if mem.missedCount >= circle.config.maxMissesBeforeExpulsion {
                mem.setStatus(status: MemberStatus.EXPELLED)
                updatedCircle.members[member] = mem
                self.circles[circleId] = updatedCircle
                emit MemberExpelled(circleId: circleId, member: member, reason: "Exceeded maximum missed payments")
            } else {
                mem.setStatus(status: MemberStatus.GRACE_PERIOD)
                updatedCircle.members[member] = mem
                self.circles[circleId] = updatedCircle
            }
            
            emit MemberDefaulted(circleId: circleId, member: member, missedRound: round)
        }
    }
    
    access(all) fun expelMember(circleId: UInt64, member: Address, reason: String) {
        pre {
            self.circles.containsKey(circleId): "Circle not found"
        }
        
        let circle = self.circles[circleId]!
        assert(self.account.address == circle.creator, message: "Only creator can expel")
        assert(circle.members.containsKey(member), message: "Member not found")
        
        var mem = circle.members[member]!
        mem.setStatus(status: MemberStatus.EXPELLED)
        var updatedCircle = circle
        updatedCircle.members[member] = mem
        self.circles[circleId] = updatedCircle
        
        emit MemberExpelled(circleId: circleId, member: member, reason: reason)
    }
    
    access(self) fun generatePayoutOrder(_ members: [Address]): [Address] {
        var shuffled = members
        var i = shuffled.length - 1
        while i > 0 {
            let j = Int(UInt64(getCurrentBlock().height) % UInt64(i + 1))
            let temp = shuffled[i]
            shuffled[i] = shuffled[j]
            shuffled[j] = temp
            i = i - 1
        }
        return shuffled
    }
    
    access(self) fun checkAllContributionsPaid(circleId: UInt64, round: UInt64): Bool {
        let circle = self.circles[circleId]!
        
        if !circle.roundContributions.containsKey(round) {
            return false
        }
        
        for memberAddr in circle.members.keys {
            let member = circle.members[memberAddr]!
            if member.status == MemberStatus.EXPELLED {
                continue
            }
            if !circle.roundContributions[round]!.containsKey(memberAddr) {
                return false
            }
        }
        
        return true
    }
    
    access(all) fun getCircle(circleId: UInt64): Circle? {
        return self.circles[circleId]
    }
    
    access(all) fun getUserCircles(address: Address): [UInt64]? {
        return self.userCircles[address]
    }
    
    access(all) fun getMemberInfo(circleId: UInt64, member: Address): Member? {
        if let circle = self.circles[circleId] {
            return circle.members[member]
        }
        return nil
    }
    
    access(all) fun getNextPayout(circleId: UInt64): Address? {
        if let circle = self.circles[circleId] {
            if circle.status != CircleStatus.ACTIVE {
                return nil
            }
            
            let nextRound = circle.currentRound + 1
            if nextRound > circle.config.totalRounds {
                return nil
            }
            
            let recipientIndex = Int((nextRound - 1) % UInt64(circle.config.payoutOrder.length))
            return circle.config.payoutOrder[recipientIndex]
        }
        return nil
    }
}
