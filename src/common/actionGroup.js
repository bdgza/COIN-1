class ActionGroup {
    constructor(definition) {
        this.type = definition.type;
        this.factionId = definition.factionId;
        this.id = definition.id;
        this.actionStartIndex = definition.actionStartIndex;
        this.actionEndIndex = definition.actionEndIndex;
        this.interactions = definition.interactions || [];
    }

    toJSON() {
        return {
            type: this.type,
            factionId: this.factionId,
            id: this.id,
            actionStartIndex: this.actionStartIndex,
            actionEndIndex: this.actionEndIndex,
            interactions: this.interactions
        };
    }
}

export default ActionGroup;
