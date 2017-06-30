import _ from '../../lib/lodash';
import CommandIDs from '../config/commandIds';
import RegionIDs from '../config/regionIds';

class CommandModifiers {
    constructor(definition = {}) {
        this.agreements = definition.agreements || [];
        this.limited = definition.limited;
        this.allowLimitedSpecial = definition.allowLimitedSpecial;
        this.noSpecial = definition.noSpecial;
        this.free = definition.free;
        this.winter = definition.winter;
        this.commandSpecific = definition.commandSpecific || {};
        this.allowedRegions = _(RegionIDs).values().filter(function(regionId) {
            return !definition.allowedRegions || _.indexOf(definition.allowedRegions , regionId) >= 0;
        }).reject(function(regionId) {
            return definition.restrictedRegions && _.indexOf(definition.restrictedRegions, regionId) >= 0;
        }).value();

        this.allowedCommands = _(CommandIDs).values().filter(function(commandId) {
            return !definition.allowedCommands || _.indexOf(definition.allowedCommands , commandId) >= 0;
        }).reject(function(commandId) {
            return definition.restrictedCommands && _.indexOf(definition.restrictedCommands, commandId) >= 0;
        }).value();
    }

    canDoSpecial() {
        return !this.noSpecial && (!this.limited || this.allowLimitedSpecial);
    }

    isCommandAllowed(commandId) {
        return _.indexOf(this.allowedCommands, commandId) >= 0;
    }

    isRegionAllowed(regionId) {
        return _.indexOf(this.allowedRegions, regionId) >= 0;
    }

    getCommandSpecificModifier( modifierId ) {
        return this.commandSpecific[modifierId];
    }

    asTest() {
        const testVersion = _.cloneDeep(this);
        testVersion.test = true;
        return testVersion;
    }
}

export default CommandModifiers;