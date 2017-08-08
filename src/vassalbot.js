import _ from 'lib/lodash';
import FallingSkyVassalGameState from 'fallingsky/vassal/fallingSkyVassalGameState';
import CommandIDs from 'fallingsky/config/commandIds';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import FactionActions from 'common/factionActions';
import TribeIDs from 'fallingsky/config/tribeIds';
import HumanPlayer from 'fallingsky/player/humanPlayer';
import PlaceWarbands from 'fallingsky/actions/placeWarbands';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import PlaceFort from 'fallingsky/actions/placeFort';
import PlaceLeader from 'fallingsky/actions/placeLeader';
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia';
import PlaceLegions from 'fallingsky/actions/placeLegions';
import RevealPieces from 'fallingsky/actions/revealPieces';
import AeduiBattle from 'fallingsky/bots/aedui/aeduiBattle';
import TurnContext from 'common/turnContext';

import * as fs from 'fs';

module.exports = {
  start: function(gameStateFile) {
    console.log('vassalbot.start(' + gameStateFile + ')');

    fs.readFile(gameStateFile, function (err, data) {
      console.log('vassalbot.readFile()');

      if (err) {
        console.log('M*ERROR READING GAMESTATE ' + err.message);
        throw err;
      }

      var json = JSON.parse(data.toString());
      const game = new FallingSkyVassalGameState(json);
      
      console.log('Action: ' + json.action);

      if (json.action == 'action:Play-Next')
        game.playTurn();
      else if (json.action == 'action:Game-State') {
        console.log('@ECHO ON');
        game.logState();
        console.log('@ECHO OFF');
      }
    });
  }
};

console.log('JS Bot Engine Script Loaded');

//const game = new Game({scenario: TheGreatRevolt});
//game.start();
//game.state().logState();