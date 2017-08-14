import ko from '../lib/knockout';

class SequenceForCard {
    constructor(definition = {}) {
        this.actions = ko.observableArray(definition.actions || []);
        this.eligible = definition.eligible || [];
        this.ineligible = definition.ineligible || [];
    }

    toJSON() {
        return {
            actions: this.actions(),
            eligible: this.eligible,
            ineligible: this.ineligible
        }
    }

    addAction(factionId, actionId) {
        this.actions.push( { factionId, actionId });
    }

    numActionsTaken() {
        return this.actions().length;
    }

    popAction() {
        return this.actions.pop();
    }

}

export default SequenceForCard;