import FactionIDs from '../../../config/factionIds';
import CommonEvent48 from 'fallingsky/bots/events/commonEvent48';

class Event48 {
    static handleEvent(state) {
        return CommonEvent48.handleEvent(state, FactionIDs.AEDUI);
    }
}

export default Event48;