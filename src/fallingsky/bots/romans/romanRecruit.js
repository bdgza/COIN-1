import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import CommandIDs from '../../config/commandIds';
import Rally from '../../commands/rally';
import RemoveResources from 'fallingsky/actions/removeResources';
import FactionActions from '../../../common/factionActions';


class RomanRecruit {
    static recruit(state, modifiers) {
        const executableRallyRegions = this.getExecutableRallyRegions(state, modifiers);
        if (!this.isRallyEffective(state, executableRallyRegions)) {
            return false;
        }

        // BUILD BEFORE

        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.RALLY);
        _.each(executableRallyRegions, (rallyRegion) => {
            if (!modifiers.free && rallyRegion.cost > 0 && !rallyRegion.inSupplyLine) {
                RemoveResources.execute(state, {factionId: state.romans.id, count: rallyRegion.cost});
            }
            Rally.execute(state, {faction: state.romans, regionResult: rallyRegion});
        });

        state.turnHistory.getCurrentTurn().commitCommand();

        // SCOUT AFTER

        const usedSpecialAbility = modifiers.canDoSpecial() && false;
        return usedSpecialAbility ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getAllyRegions(state, modifiers, ralliedRegionIds) {
        const regions = _.filter(state.regions, region => _.indexOf(ralliedRegionIds, region.id) < 0);
        const rallyRegionResults = Rally.test(state, {
            factionId: FactionIDs.ROMANS,
            regions: regions
        });
        const allyRegions = _(rallyRegionResults).filter({canAddAlly: true}).shuffle().value();
        _.each(allyRegions, (regionResult) => {
            regionResult.addAlly = true;
        });
        return _.take(allyRegions, state.romans.availableAlliedTribes().length);
    }

    static getAuxiliaRegions(state, modifiers, ralliedRegionIds) {
        const regions = _.filter(state.regions, region => _.indexOf(ralliedRegionIds, region.id) < 0);
        const rallyRegionResults = Rally.test(state, {
            factionId: FactionIDs.ROMANS,
            regions: regions
        });


        // Order by supply line

        let auxiliaRemaining = state.romans.availableAuxilia().length;
        _.each(rallyRegionResults, (regionResult) => {
            regionResult.addNumAuxilia = Math.min(regionResult.canAddNumAuxilia, auxiliaRemaining);
            auxiliaRemaining -= regionResult.addNumAuxilia;
            if(auxiliaRemaining === 0) {
                return false;
            }
        });

        return _(rallyRegionResults).filter(result => result.addNumAuxilia > 0).shuffle().value();
    }

    static isRallyEffective(state, executableRallyRegions) {
        const romans = state.romans;
        let numAlliesAdded = false;
        let numPiecesAdded = 0;
        _.each(
            executableRallyRegions, (regionResult) => {

                if (regionResult.addAlly && romans.availableAlliedTribes().length > 0) {
                    numAlliesAdded += 1;
                    numPiecesAdded += 1;
                    return;
                }

                numPiecesAdded += regionResult.addNumAuxilia;
            });
        return numAlliesAdded >= 2 || numPiecesAdded >= 3;
    }

    static getExecutableRallyRegions(state, modifiers, faction) {
        const ralliedRegions = [];
        const allyRegions = this.getAllyRegions(state, modifiers, ralliedRegions);
        ralliedRegions.push.apply(ralliedRegions, _.map(allyRegions, rallyRegion => rallyRegion.region.id));
        const auxiliaRegions = this.getAuxiliaRegions(state, modifiers, ralliedRegions);

        const allRegions = _(allyRegions).concat(auxiliaRegions).value();

        _.each(allRegions, (regionResult) => {
            const agreementsForSupplyLine = regionResult.region.getAgreementsNeededForSupplyLine(FactionIDs.ROMANS);
            if (agreementsForSupplyLine.length === 0) {
                regionResult.inSupplyLine = true;
            }
            regionResult.agreementsNeeded = agreementsForSupplyLine;
        });

        const affordableRegions = modifiers.free ? allRegions : _.reduce(allRegions, (accumulator, rallyRegion) => {
            if (accumulator.resourcesRemaining >= rallyRegion.cost) {
                accumulator.resourcesRemaining -= rallyRegion.cost;
                accumulator.rallies.push(rallyRegion);
            }
            return accumulator
        }, {resourcesRemaining: state.romans.resources(), rallies: []}).rallies;

        return modifiers.limited ? _.take(affordableRegions, 1) : affordableRegions;
    }

}

export default RomanRecruit