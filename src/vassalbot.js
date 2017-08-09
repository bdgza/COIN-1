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
import * as tempy from 'tempy';

JSON.stringifyOnce = function(obj, replacer, indent){
  var printedObjects = [];
  var printedObjectKeys = [];

  function printOnceReplacer(key, value) {
    if (printedObjects.length > 2000) { // browsers will not print more than 20K, I don't see the point to allow 2K.. algorithm will not be fast anyway if we have too many objects
      return 'object too long';
    }
    var printedObjIndex = false;
    printedObjects.forEach(function(obj, index){
      if(obj===value){
        printedObjIndex = index;
      }
    });

    if (key == '') { //root element
      printedObjects.push(obj);
      printedObjectKeys.push("root");
      return value;
    }
    else if (printedObjIndex+"" != "false" && typeof(value) == "object") {
      if (printedObjectKeys[printedObjIndex] == "root"){
        return "(pointer to root)";
      } else {
        return "(see " + ((!!value && !!value.constructor) ? value.constructor.name.toLowerCase()  : typeof(value)) + " with key " + printedObjectKeys[printedObjIndex] + ")";
      }
    } else {
      var qualifiedKey = key || "(empty key)";
      printedObjects.push(value);
      printedObjectKeys.push(qualifiedKey);
      if (replacer) {
        return replacer(key, value);
      } else {
        return value;
      }
    }
  }
  return JSON.stringify(obj, printOnceReplacer, indent);
};

function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

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
      else if (json.action == 'action:JSON') {
        game.playTurn();

        var newdata = JSON.stringifyOnce(game, function (key, val) {
          if (isFunction(val)) return undefined;
          //var removed = ["factionsById", "tribes", "tribesById", "regionsById", "vassal", "aedui", "arverni", "belgae", "germanic", "romans"];
          //if (removed.includes(key)) return undefined;

          //console.log('M*Replacer', key, val);
          return val;
        }, 1);

        var newdatafile = tempy.file({extension: 'json'});
        fs.writeFileSync(newdatafile, newdata);
        console.log('M*File written to ', newdatafile);
      }
    });
  }
};

console.log('JS Bot Engine Script Loaded');
