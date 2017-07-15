import _ from 'lib/lodash';
import Enlist from 'fallingsky/commands/belgae/enlist';
import Rampage from 'fallingsky/commands/belgae/rampage';
import Battle from 'fallingsky/commands/battle';
import FactionIDs from 'fallingsky/config/factionIds';

class RomanUtils {

    static getWorstLossesForAllEnemyInitiatedBattlesInRegion(state, region, defendingPieces) {
        return _.reduce(state.factionsById, (losses, faction) => {
            const factionLosses = this.getWorstLossesForEnemyInitiatedBattle(state, region, faction.id, defendingPieces);
            return Math.max(factionLosses, losses);
        }, 0);
    }

    static getWorstLossesForEnemyInitiatedBattle(state, region, factionId, defendingPieces) {
        let canEnlist = false;
        let rampageLosses = 0;

        if (factionId === FactionIDs.BELGAE) {
            const rampageResults = Rampage.test(state);
            const resultForRegion = _.find(rampageResults, result => result.region.id === region.id);
            rampageLosses = resultForRegion ? resultForRegion.numWarbands : 0;
            const enlistResults = Enlist.test(state);
            canEnlist = _.find(enlistResults, result => result.region.id === region.id);
        }

        const battleResult = Battle.test(state, {
            region: region,
            attackingFactionId: factionId,
            defendingFactionId: FactionIDs.ROMANS,
            defendingPieces: defendingPieces
        });

        let worstLosses = rampageLosses + battleResult.mostDefenderLosses();
        if (canEnlist) {
            const enlistBattleResult = Battle.test(state, {
                region: region,
                attackingFactionId: factionId,
                defendingFactionId: FactionIDs.ROMANS,
                defendingPieces: defendingPieces,
                enlistingGermans: true
            });

            worstLosses = Math.max(worstLosses, enlistBattleResult.mostDefenderLosses())
        }

        return worstLosses;
    }

    static canEnemyTurnInflictCriticalLoss(state, region, factionId) {

        // First vanilla battle:
        const battleResult = Battle.test(state, {
            region: region,
            attackingFactionId: factionId,
            defendingFactionId: FactionIDs.ROMANS
        });

        if (battleResult.willInflictLossAgainstLegion(battleResult.ambush) ||
            battleResult.willInflictLossAgainstLeader(battleResult.ambush)) {
            return true;
        }

        // Check rampage / enlist:
        if (factionId === FactionIDs.BELGAE) {

            // Rampage alone first
            const rampageResults = Rampage.test(state);
            const resultForRegion = _.find(rampageResults, result => result.region.id === region.id);
            const rampageLosses = resultForRegion ? resultForRegion.numWarbands : 0;
            if (!battleResult.defenderCanGuaranteeSafeRetreat && region.getLegions().length > 0 &&
                region.getWarbandsOrAuxiliaForFaction(FactionIDs.ROMANS).length < rampageLosses) {
                return true;
            }

            // Apply rampage results and re-test battle:
            const groupedPieces = _.groupBy(region.getPiecesForFaction(FactionIDs.ROMANS), 'type');
            groupedPieces.auxilia = _.drop(groupedPieces.auxilia, rampageLosses);
            const defendingPieces = _(groupedPieces).values().flatten().value();

            const postRampageBattleResult = Battle.test(state, {
                region: region,
                attackingFactionId: factionId,
                defendingFactionId: FactionIDs.ROMANS,
                defendingPieces: defendingPieces
            });

            if (postRampageBattleResult.willInflictLossAgainstLegion(postRampageBattleResult.ambush) ||
                postRampageBattleResult.willInflictLossAgainstLeader(postRampageBattleResult.ambush)) {
                return true;
            }

            // Check enlist:
            const enlistResults = Enlist.test(state);
            const canEnlist = _.find(enlistResults, result => result.region.id === region.id);

            if (canEnlist) {
                const enlistBattleResult = Battle.test(state, {
                    region: region,
                    attackingFactionId: factionId,
                    defendingFactionId: FactionIDs.ROMANS,
                    enlistingGermans: true
                });
                if (enlistBattleResult.willInflictLossAgainstLegion(enlistBattleResult.ambush) ||
                    enlistBattleResult.willInflictLossAgainstLeader(enlistBattleResult.ambush)) {
                    return true;
                }
            }

        }

        return false;
    }
}

export default RomanUtils;