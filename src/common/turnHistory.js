import _ from '../lib/lodash';
import Turn from './turn';


class TurnHistory {
    constructor(state) {
        this.state = state;
        this.turns = [];
        this.currentTurn = null;
    }

    startTurn(factionId) {
        this.currentTurn = new Turn(this.state, { number: this.nextTurnNumber(), factionId: factionId, actionStartIndex: this.state.actionHistory.currentIndex()});
    }

    commitTurn(action) {
        this.currentTurn.commandAction = action;
        this.currentTurn.actionEndIndex = this.state.actionHistory.currentIndex();
        this.turns.push(this.currentTurn);
        this.currentTurn = null;
    }

    undoLastTurn() {
        const turn = this.turns.pop();
        turn.undo();
    }

    getCurrentTurn() {
        return this.currentTurn;
    }

    lastTurn() {
        return _.last(this.turns);
    }

    nextTurnNumber() {
        return this.turns.length + 1;
    }

}

export default TurnHistory;