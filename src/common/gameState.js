
class GameState {
    constructor() {

    }

    toJSON() {
        return {};
    }

    serializeGameState(state) {
        return JSON.stringify(state, function (key, val) {
            var getType = {};
            if (val && getType.toString.call(val) === '[object Function]') return undefined;
            return val;
          }, 1);
    }
}

export default GameState;