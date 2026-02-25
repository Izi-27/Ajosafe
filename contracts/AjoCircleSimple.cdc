// Simplified AjoCircle Contract for Cadence 1.0
access(all) contract AjoCircle {
    
    // Events
    access(all) event CircleCreated(circleId: UInt64, creator: Address, name: String)
    access(all) event ContributionMade(circleId: UInt64, member: Address, amount: UFix64)
    
    // Simple Circle struct
    access(all) struct Circle {
        access(all) let id: UInt64
        access(all) let name: String
        access(all) let creator: Address
        access(all) var totalCollected: UFix64
        
        init(id: UInt64, name: String, creator: Address) {
            self.id = id
            self.name = name
            self.creator = creator
            self.totalCollected = 0.0
        }
    }
    
    // Storage
    access(all) var circles: {UInt64: Circle}
    access(all) var nextCircleId: UInt64
    
    init() {
        self.circles = {}
        self.nextCircleId = 1
    }
    
    // Create a new circle
    access(all) fun createCircle(name: String): UInt64 {
        let circleId = self.nextCircleId
        let creator = self.account.address
        
        let circle = Circle(
            id: circleId,
            name: name,
            creator: creator
        )
        
        self.circles[circleId] = circle
        self.nextCircleId = self.nextCircleId + 1
        
        emit CircleCreated(circleId: circleId, creator: creator, name: name)
        
        return circleId
    }
    
    // Get circle info
    access(all) fun getCircle(circleId: UInt64): Circle? {
        return self.circles[circleId]
    }
    
    // Get total circles
    access(all) fun getTotalCircles(): UInt64 {
        return self.nextCircleId - 1
    }
}
