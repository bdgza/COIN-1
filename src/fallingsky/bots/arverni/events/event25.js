import FactionIDs from '../../../config/factionIds';
import {CapabilityIDs, CapabilityStates} from '../../../config/capabilities';
import AddCapability from '../../../actions/addCapability';

class Event25 {
    static handleEvent(state) {
        AddCapability.execute(state,
            {
                id: CapabilityIDs.AQUITANI,
                state: CapabilityStates.SHADED,
                factionId: FactionIDs.ARVERNI
            });
        return true;
    }
}

export default Event25
