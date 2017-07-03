import ActionGroup from './actionGroup';
import _ from '../lib/lodash';
import Checkpoint from './checkpoint';

class Turn extends ActionGroup {

    constructor(state, definition) {
        definition.type = 'turn';
        super(definition);
        this.state = state;
        this.number = definition.number;
        this.commandAction = definition.commandAction;
        this.actionGroups = [];
        this.inProgress = [];
        this.checkpoints = definition.checkpoints || [];
        this.contexts = definition.contexts || [];
        this.currentContext = null;
    }

    undo() {
        this.state.actionHistory.undoRange(this.actionStartIndex, this.actionEndIndex);
    }

    resume() {
        this.currentContext = _.first(this.contexts);
    }

    getContext() {
        return this.currentContext;
    }

    pushContext(context) {
        const existingContext = _.find(this.contexts, {id : context.id });
        if(!existingContext) {
            this.contexts.push(context);
        }
        this.currentContext = existingContext || context;
    }

    popContext() {
        this.contexts.pop();
        this.currentContext = _.last(this.contexts);
    }

    commitActionGroup(type) {
        const last = _.last(this.inProgress);
        if (!last || last.type !== type) {
            throw Error('Tried to commit ' + type + ' that was not in progress');
        }
        console.log('Committing ' + type + ' ' + last.id);
        const actionGroup = this.inProgress.pop();
        actionGroup.actionEndIndex = this.state.actionHistory.currentIndex();
        this.actionGroups.push(actionGroup);
    }

    rollbackActionGroup(type) {
        const last = _.last(this.inProgress);
        if (!last || (type && last.type !== type)) {
            throw Error('Tried to rollback ' + type + ' that was not in progress');
        }
        console.log('Rolling back ' + last.type + ' ' + last.id);
        const actionGroup = this.inProgress.pop();
        this.state.actionHistory.undoRange(actionGroup.actionStartIndex);
    }

    startActionGroup(id, type) {
        const current = _.last(this.inProgress);
        if(current && current.id === id && current.type === type) {
            return;
        }
        console.log('Starting ' + type + ' ' + id);
        const actionGroup = new ActionGroup({
            type: type,
            id: id,
            factionId: this.factionId,
            actionStartIndex: this.state.actionHistory.currentIndex()
        });
        this.inProgress.push(actionGroup);
    }

    startCommand(id) {
        this.startActionGroup(id, 'command');
    }

    commitCommand() {
        this.commitActionGroup('command');
    }

    rollbackCommand() {
        this.rollbackActionGroup('command');
    }

    startSpecialAbility(id) {
        this.startActionGroup(id, 'sa');
    }

    commitSpecialAbility() {
        this.commitActionGroup('sa');
    }

    rollbackSpecialAbility() {
        this.rollbackActionGroup('sa');
    }

    startEvent(id) {
        this.startActionGroup(id, 'event');
    }

    commitEvent() {
        this.commitActionGroup('event');
    }

    rollbackEvent() {
        this.rollbackActionGroup('event');
    }

    getFixedDecimalPlaces(number, places) {
        const re = new RegExp("(\\d+\\.\\d{" + places + "})(\\d)"),
            m = number.toString().match(re);
        return m ? parseFloat(m[1]) : number.valueOf();
    }

    calculateCheckpointValue(checkpoint, level = 0) {
        const actualLevel = this.inProgress.length + level;
        const currentCheckpointBase = level > 0 ? this.getFixedDecimalPlaces(this.checkpoint, actualLevel-1): 0;
        return currentCheckpointBase + (checkpoint / (10 ** actualLevel));
    }

    markCheckpoint(id) {
        const checkpoint = new Checkpoint({ id: this.currentContext.id + '-' +id });
        this.checkpoints.push(checkpoint);
    }

    getCheckpoint(id) {
        const contextId = this.currentContext.id + '-' +id;
        return _.find(this.checkpoints, checkpoint => checkpoint.id === contextId);
    }

    clearCheckpoints() {
        this.checkpoints = [];
    }

    addAgreement(agreement) {
        const actionGroup = _.last(this.inProgress);
        if(actionGroup) {
            actionGroup.agreements.push(agreement);
        }
    }

    getCurrentAgreements() {
        const actionGroup = _.last(this.inProgress);
        return actionGroup ? actionGroup.agreements : [];
    }

    getInstructions(state) {
        if (this.actionEndIndex <= this.actionStartIndex) {
            return [];
        }

        const actionInstructions = _(
            state.actionHistory.getActionRange(this.actionStartIndex, this.actionEndIndex))
            .invokeMap('instructions', state).map(
                (instructions, index) => {
                    return _.map(instructions, (instruction) => {
                        return {
                            index: this.actionStartIndex + index,
                            type: 'action',
                            instruction
                        }
                    });
                }).flatten().value();

        const actionGroupsByType = _.groupBy(this.actionGroups, 'type');

        _.each(actionGroupsByType.sa, (sa) => {
            const insertIndex = _.findIndex(actionInstructions,
                                            actionInstruction => actionInstruction.index >= sa.actionStartIndex);
            actionInstructions.splice(insertIndex, 0,
                                      {
                                          index: sa.actionStartIndex,
                                          type: 'sa',
                                          instruction: this.factionId + ' chose to ' + sa.id
                                      });
        });

        _.each(actionGroupsByType.command, (command) => {
            const insertIndex = _.findIndex(actionInstructions,
                                            actionInstruction => actionInstruction.index >= command.actionStartIndex);
            actionInstructions.splice(insertIndex, 0,
                                      {
                                          index: command.actionStartIndex,
                                          type: 'command',
                                          instruction: this.factionId + ' chose to ' + command.id
                                      });
        });

        if (actionGroupsByType.event) {
            const event = actionGroupsByType.event[0];
            const insertIndex = _.findIndex(actionInstructions,
                                            actionInstruction => actionInstruction.index >= event.actionStartIndex);
            actionInstructions.splice(insertIndex, 0,
                                      {
                                          index: event.actionStartIndex,
                                          type: 'event',
                                          instruction: this.factionId + ' chose to play Event'
                                      });
        }

        return actionInstructions;
    }

}

export default Turn;