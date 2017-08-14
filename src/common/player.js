class Player {
    constructor(definition = {}) {
        this.isNonPlayer = definition.isNonPlayer;
        this.factionId = definition.factionId;
    }

    toJSON() {
        return {
            isNonPlayer: this.isNonPlayer,
            factionId: this.factionId
        };
    }
}

export default Player;