access(all) contract AjoCircle {

    access(all) event CircleCreated(circleId: UInt64, creator: Address, name: String)
    access(all) event AgreementAcknowledged(circleId: UInt64, member: Address)
    access(all) event CircleActivated(circleId: UInt64, activatedAt: UFix64, firstDueAt: UFix64)
    access(all) event ContributionMade(circleId: UInt64, member: Address, round: UInt64, amount: UFix64)
    access(all) event PayoutExecuted(circleId: UInt64, recipient: Address, round: UInt64)
    access(all) event MemberDefaulted(circleId: UInt64, member: Address, missedRound: UInt64)
    access(all) event MemberExpelled(circleId: UInt64, member: Address, reason: String)
    access(all) event CircleCompleted(circleId: UInt64)

    access(all) enum CircleStatus: UInt8 {
        access(all) case ACTIVE
        access(all) case PAUSED
        access(all) case COMPLETED
        access(all) case DISSOLVED
        access(all) case PENDING_ACKNOWLEDGEMENT
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

        access(all) fun markAgreementAcknowledged() {
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
        access(all) let createdAt: UFix64
        access(all) var lastPayoutTime: UFix64?
        access(all) var nextPayoutTime: UFix64?
        access(all) var completionTime: UFix64?
        access(all) var roundContributions: {UInt64: {Address: Bool}}
        access(all) var roundPayouts: {UInt64: Address}

        init(id: UInt64, config: CircleConfig, creator: Address) {
            self.id = id
            self.config = config
            self.creator = creator
            self.members = {}
            self.status = CircleStatus.PENDING_ACKNOWLEDGEMENT
            self.currentRound = 0
            self.totalCollected = 0.0
            self.createdAt = getCurrentBlock().timestamp
            self.lastPayoutTime = nil
            self.nextPayoutTime = nil
            self.completionTime = nil
            self.roundContributions = {}
            self.roundPayouts = {}
        }

        access(all) fun addMember(member: Member) {
            self.members[member.address] = member
        }

        access(all) fun recordContribution(member: Address, round: UInt64, amount: UFix64) {
            if !self.roundContributions.containsKey(round) {
                self.roundContributions[round] = {}
            }

            var roundEntries = self.roundContributions[round]!
            roundEntries[member] = true
            self.roundContributions[round] = roundEntries
            self.totalCollected = self.totalCollected + amount
        }

        access(all) fun activate() {
            self.status = CircleStatus.ACTIVE
            self.lastPayoutTime = getCurrentBlock().timestamp
            self.nextPayoutTime = self.lastPayoutTime! + UFix64(self.config.contributionFrequency)
        }

        access(all) fun recordPayout(round: UInt64, recipient: Address, nextContributionDueAt: UFix64?) {
            self.roundPayouts[round] = recipient
            self.currentRound = round
            self.nextPayoutTime = nextContributionDueAt
        }

        access(all) fun complete() {
            self.status = CircleStatus.COMPLETED
            self.completionTime = getCurrentBlock().timestamp
            self.nextPayoutTime = nil
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
        creator: Address,
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
            memberAddresses.length > 1: "Need at least two members"
            memberAddresses.length == memberNames.length: "Member names length mismatch"
            memberAddresses.length == memberPhones.length: "Member phones length mismatch"
            memberAddresses.length == memberEmails.length: "Member emails length mismatch"
            UInt64(memberAddresses.length) == totalRounds: "Total rounds must equal member count"
            self.containsAddress(memberAddresses, address: creator): "Creator must be included in the member list"
            self.hasUniqueAddresses(memberAddresses): "Duplicate member addresses are not allowed"
        }

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
        var circle = Circle(id: circleId, config: config, creator: creator)

        var i = 0
        while i < memberAddresses.length {
            var member = Member(
                address: memberAddresses[i],
                name: memberNames[i],
                phone: memberPhones[i],
                email: memberEmails[i],
                depositAmount: securityDeposit
            )

            if memberAddresses[i] == creator {
                member.markAgreementAcknowledged()
            }

            circle.addMember(member: member)
            self.trackUserCircle(address: memberAddresses[i], circleId: circleId)
            i = i + 1
        }

        if !circle.members.containsKey(creator) {
            self.trackUserCircle(address: creator, circleId: circleId)
        }

        self.circles[circleId] = circle
        self.nextCircleId = self.nextCircleId + 1

        emit CircleCreated(circleId: circleId, creator: creator, name: name)
        return circleId
    }

    access(all) fun acknowledgeAgreement(circleId: UInt64, member: Address) {
        pre {
            self.circles.containsKey(circleId): "Circle not found"
        }

        let circle = self.circles[circleId]!
        assert(circle.members.containsKey(member), message: "Not a member of this circle")
        assert(circle.status == CircleStatus.PENDING_ACKNOWLEDGEMENT, message: "Circle is already active")

        var updatedCircle = circle
        var currentMember = updatedCircle.members[member]!
        assert(!currentMember.depositPaid, message: "Agreement already acknowledged")

        currentMember.markAgreementAcknowledged()
        updatedCircle.members[member] = currentMember

        emit AgreementAcknowledged(circleId: circleId, member: member)

        if self.checkAllMembersAcknowledged(circle: updatedCircle) {
            updatedCircle.activate()
            emit CircleActivated(
                circleId: circleId,
                activatedAt: updatedCircle.lastPayoutTime!,
                firstDueAt: updatedCircle.nextPayoutTime!
            )
        }

        self.circles[circleId] = updatedCircle
    }

    access(all) fun contribute(circleId: UInt64, member: Address, round: UInt64, amount: UFix64) {
        pre {
            self.circles.containsKey(circleId): "Circle not found"
        }

        let circle = self.circles[circleId]!
        assert(circle.members.containsKey(member), message: "Not a member of this circle")
        assert(circle.status == CircleStatus.ACTIVE, message: "Circle is not active")
        let contributionDueAt = self.getCurrentContributionDueAt(circle: circle)
        assert(contributionDueAt != nil, message: "Contribution schedule is not active yet")
        assert(getCurrentBlock().timestamp >= contributionDueAt!, message: "Cannot make payment until the due date")
        assert(round == circle.currentRound + 1, message: "Invalid round")
        assert(amount == circle.config.contributionAmount, message: "Incorrect contribution amount")

        var updatedCircle = circle
        var currentMember = updatedCircle.members[member]!
        currentMember.markPaid(round: round)

        if currentMember.status == MemberStatus.GRACE_PERIOD {
            currentMember.setStatus(status: MemberStatus.ACTIVE)
        }

        updatedCircle.members[member] = currentMember
        updatedCircle.recordContribution(member: member, round: round, amount: amount)
        self.circles[circleId] = updatedCircle

        emit ContributionMade(circleId: circleId, member: member, round: round, amount: amount)

        if self.checkAllContributionsPaid(circleId: circleId, round: round) {
            self.executePayout(circleId: circleId, round: round)
        }
    }

    access(all) fun reportMissedPayment(circleId: UInt64, round: UInt64, member: Address) {
        pre {
            self.circles.containsKey(circleId): "Circle not found"
        }

        let circle = self.circles[circleId]!
        assert(circle.members.containsKey(member), message: "Member not found")
        assert(circle.status == CircleStatus.ACTIVE, message: "Circle is not active")
        assert(round == circle.currentRound + 1, message: "Can only report the current round")

        let contributionDueAt = self.getCurrentContributionDueAt(circle: circle)
        assert(contributionDueAt != nil, message: "No contribution is due yet")

        let missedPaymentDeadline = contributionDueAt! + UFix64(circle.config.gracePeriod)
        assert(getCurrentBlock().timestamp > missedPaymentDeadline, message: "Grace period has not ended")

        if !circle.roundContributions.containsKey(round) || !circle.roundContributions[round]!.containsKey(member) {
            var updatedCircle = circle
            var currentMember = updatedCircle.members[member]!
            currentMember.markMissed(round: round)

            if currentMember.missedCount >= updatedCircle.config.maxMissesBeforeExpulsion {
                currentMember.setStatus(status: MemberStatus.EXPELLED)
                emit MemberExpelled(circleId: circleId, member: member, reason: "Exceeded maximum missed payments")
            } else {
                currentMember.setStatus(status: MemberStatus.GRACE_PERIOD)
            }

            updatedCircle.members[member] = currentMember
            self.circles[circleId] = updatedCircle

            emit MemberDefaulted(circleId: circleId, member: member, missedRound: round)
        }
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

    access(self) fun executePayout(circleId: UInt64, round: UInt64) {
        let circle = self.circles[circleId]!
        let recipientIndex = Int((round - 1) % UInt64(circle.config.payoutOrder.length))
        let recipient = circle.config.payoutOrder[recipientIndex]

        var updatedCircle = circle
        var nextContributionDueAt: UFix64? = nil

        if round < updatedCircle.config.totalRounds {
            nextContributionDueAt = self.getRoundDueAt(circle: updatedCircle, round: round + 1)
        }

        updatedCircle.recordPayout(
            round: round,
            recipient: recipient,
            nextContributionDueAt: nextContributionDueAt
        )

        if round == updatedCircle.config.totalRounds {
            updatedCircle.complete()
            emit CircleCompleted(circleId: circleId)
        }

        self.circles[circleId] = updatedCircle
        emit PayoutExecuted(circleId: circleId, recipient: recipient, round: round)
    }

    access(self) fun checkAllContributionsPaid(circleId: UInt64, round: UInt64): Bool {
        let circle = self.circles[circleId]!

        if !circle.roundContributions.containsKey(round) {
            return false
        }

        for memberAddress in circle.members.keys {
            let member = circle.members[memberAddress]!
            if member.status == MemberStatus.EXPELLED {
                continue
            }

            if !circle.roundContributions[round]!.containsKey(memberAddress) {
                return false
            }
        }

        return true
    }

    access(self) view fun checkAllMembersAcknowledged(circle: Circle): Bool {
        for memberAddress in circle.members.keys {
            let member = circle.members[memberAddress]!
            if !member.depositPaid {
                return false
            }
        }

        return true
    }

    access(self) view fun getRoundDueAt(circle: Circle, round: UInt64): UFix64 {
        let scheduleAnchor = circle.lastPayoutTime ?? circle.createdAt
        return scheduleAnchor + UFix64(circle.config.contributionFrequency * round)
    }

    access(self) view fun getCurrentContributionDueAt(circle: Circle): UFix64? {
        if circle.status != CircleStatus.ACTIVE {
            return nil
        }

        if circle.nextPayoutTime != nil {
            return circle.nextPayoutTime
        }

        return self.getRoundDueAt(circle: circle, round: circle.currentRound + 1)
    }

    access(self) fun generatePayoutOrder(_ members: [Address]): [Address] {
        var payoutOrder = members
        var i = payoutOrder.length - 1

        while i > 0 {
            let j = Int(UInt64(getCurrentBlock().height) % UInt64(i + 1))
            let tmp = payoutOrder[i]
            payoutOrder[i] = payoutOrder[j]
            payoutOrder[j] = tmp
            i = i - 1
        }

        return payoutOrder
    }

    access(self) view fun hasUniqueAddresses(_ members: [Address]): Bool {
        var seen: {Address: Bool} = {}

        for member in members {
            if seen.containsKey(member) {
                return false
            }

            seen[member] = true
        }

        return true
    }

    access(self) view fun containsAddress(_ members: [Address], address: Address): Bool {
        for member in members {
            if member == address {
                return true
            }
        }

        return false
    }

    access(self) fun trackUserCircle(address: Address, circleId: UInt64) {
        if self.userCircles.containsKey(address) {
            self.userCircles[address]!.append(circleId)
        } else {
            self.userCircles[address] = [circleId]
        }
    }
}
