import Action from './action';

class PlaceAlliedTribe extends Action {

    constructor(args) {
        super(args);

        this.factionId = args.factionId;
        this.regionId = args.regionId;
        this.tribeId = args.tribeId;
    }

    doExecute(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const tribe = state.tribesById[this.tribeId];

        if(!tribe) {
            debugger;
        }

        if(!region.inPlay() || !faction.hasAvailableAlliedTribe() || !tribe.isSubdued()) {
            debugger;
            throw 'Invalid PlaceAlliedTribe Action';
        }

        const alliedTribe = faction.removeAlliedTribe();
        tribe.makeAllied(alliedTribe);
        region.addPiece(alliedTribe);
        console.log('Placing ' + faction.name + ' Ally in ' + tribe.name);
    }

    doUndo(state) {
        throw 'Unable to undo PlaceAlliedTribe Action';
    }

    instructions(state) {
        const faction = state.factionsById[this.factionId];
        const region = state.regionsById[this.regionId];
        const tribe = state.tribesById[this.tribeId];
        return ['Place ' + faction.name + ' Ally in ' + tribe.name + ' in region ' + region.name];
    }

}

export default PlaceAlliedTribe;