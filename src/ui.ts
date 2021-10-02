import {AntGame, AntColony, Place, Hive} from './game';
import {Ant, EaterAnt, GuardAnt} from './ants';

import vorpal = require('vorpal'); //Vorpal API - used for command line
import chalk = require('chalk');   //Chalk API - add color on command line: In this case, highlighting Bees
import _ = require('lodash');      //Load full build of lodash: Used for working wtih arrays, providing modules to help iterate arrays, objects, and strings

/**
 * The Vorpal library for command-line interaction.
 */
const Vorpal = vorpal();

/**
 * Displays the gameboard of an AntGame.
 * 
 * @param game the AntGame whose map is to be viewed
 */
export function showMapOf(game:AntGame){
  console.log(getMap(game));
}

/**
 * Generates the current gameboard of an AntGame.
 * 
 * @param game the current AntGame
 * @returns a string representing the current Gameboard state
 */
function getMap(game:AntGame) {
  let places:Place[][] = game.getPlaces(); //Get all tunnels (locations) in a colony
  let tunnelLength = places[0].length;     //Get length of a ttunnel
  let beeIcon = chalk.bgYellow.black('B'); //Chalk API method for setting the background color of Bees to yellow. Gives the yellow box to bees on the CLI.
   
  let map = ''; //Create an empty map

  map += chalk.bold('The Colony is under attack!\n'); //Add "The Colony is under attack" in bold. Chalk bolds this string on the command line.
  map += `Turn: ${game.getTurn()}, Food: ${game.getFood()}, Boosts available: [${game.getBoostNames()}]\n`; //Display turn #, food supply, and available boosts.
  
  
  //Prints table header (the column numbers & "Hive"). 
  //Utilizes Lo's _.range function to create an array of 0 to tunnelLength 
  //to hold the column numbers.
  map += '     '+_.range(0,tunnelLength).join('    ')+'      Hive'+'\n'; 
   
  /*
   * Logic to create tunnel borders, place Bee Icons, place Ant Icons, place Water.
   */
  for(let i=0; i<places.length; i++){
    map += '    '+Array(tunnelLength+1).join('====='); //Create tunnel borders
    
    //If first tunnel, Add Bee count under "Hive"
    if(i===0){

      map += '    '; //Spacing from the gameboard

      //Set Bee Count
      let hiveBeeCount = game.getHiveBeesCount();

      //If Bees in Hive, add a Bee Icon. (Yellow B because of Chalk API)
      //Display the current Hive count, or empty string if no Bees.
      if(hiveBeeCount > 0){
        map += beeIcon;
        map += (hiveBeeCount > 1 ? hiveBeeCount : ' ');
      }
    }

    //Set up new tunnel Row
    map += '\n'; 

    //Tunnel Row numbers
    map += i+')  '; 
      
    /* for each location in the tunnel, 
     * either place an Ant Icon, Bee Icon, or Leave Blank.
     * Iterates one tunnel at a time, i.e one column at a time
     */
    for(let j=0; j<places[i].length; j++){ 
      let place:Place = places[i][j];
      
      map += iconFor(place.getAnt());
      map += ' '; 

      //Place Bee Icon if there are Bee's in the Hive. 
      if(place.getBees().length > 0){
        map += beeIcon;
        map += (place.getBees().length > 1 ? place.getBees().length : ' ');
      } else {
        map += '  ';
      }

      map += ' '; 
    }

    map += '\n    '; //Move to next Row.

    /*
     * For each location in the tunnel, checks to see if the place should be flooded.
     * If a location should be flooded, add ~~~~ in that space & give a Cyan background.
     * The Cyan Background is given through Chalk's API.
     */
    for(let j=0; j<places[i].length; j++){
      let place = places[i][j]; 

      //Check if location places[i][j] should be flooded.
      if(place.isWater()){
        map += chalk.bgCyan('~~~~')+' '; //Chalk API to color plces[i][j] with Cyan Background
      } else {
        map += '==== '; //If not flooded, print one section of unflooded tunnel
      }
    }
    map += '\n'; //New row
  }

  //Using Lo's _.range function to create an array holding the column numbers.
  //Prints the column numbers at the end of the map.
  map += '     '+_.range(0,tunnelLength).join('    ')+'\n' 

  return map; //Return completed colony board
}

/**
 * Generates an assigns colored icons for Ants & Bees on the gameboard.
 * Chalk API gives coloring to Insects.
 * 
 * @param ant the Ant's icon to be styled
 * @returns a string, representingthe colored icon for an Insect
 */
function iconFor(ant:Ant){

  //If no ant, return empty string
  if(ant === undefined){ return ' ' };
  let icon:string;

  //Assign icon a color based on conditions using Chalk API.
  switch(ant.name){
    case "Grower":
      icon = chalk.green('G'); break; //Assign Green styling to Grower Ants, using Chalk API.
    case "Thrower":
      icon = chalk.red('T'); break;   //Assign Red styling to Thrower Ants, using Chalk API.
    case "Eater":
      if((<EaterAnt>ant).isFull())
        icon = chalk.yellow.bgMagenta('E'); //ASsign Yellow Stayling and Magenta Background to Eater Ant if full, using Chalk API.
      else
        icon = chalk.magenta('E'); //Assign Mangenta styling to Eater Ants, using Chalk API.
      break;
    case "Scuba":
      icon = chalk.cyan('S'); break; //Assign Cyan styling to Scuba Ants, using Chalk API.
    case "Guard":
      let guarded:Ant = (<GuardAnt>ant).getGuarded();
      if(guarded){
        icon = chalk.underline(iconFor(guarded)); break; //Assign Underline to the Icon of Ant to be guarded, using Chalk API.
      } else {
        icon = chalk.underline('x'); break; //Assign an Underline under X, using Chalk API 
      }
    default:
      icon = '?';
  }
  return icon; //Return the approrpiate icon
}

/**
 * Setup the command line commands, arguments, aliases, and stying.
 * Styling provided by Chalk APi. Command Line Syntax handled using
 * Vorpal API.
 * 
 * @param game the Antgame intended to be played
 */
export function play(game:AntGame) {
  Vorpal
    //Sets the prompt delimiter for the given Vorpal Instance, will be displayed in Green due to Chalk API
    .delimiter(chalk.green('AvB $')) 

    //Logs to stdout, replaces console.log
    .log(getMap(game)) 

    //Parses the process's process.argv, then executes the matching command on CL
    .show(); 


  Vorpal
    //Adds the show command and its description to the command line API.
    .command('show', 'Shows the current game board.') 
    
    //Exposes a commandInstnace object, makes sure that all stdout for Vorpal command is properly
    //routed through piped commands, and correctly renders to terminal. 
    //Makes sure board gets displayed. (e.g. executes the show command)
    .action(function(args, callback){
      Vorpal.log(getMap(game));
      callback();
    });


  Vorpal
    //Adds the deploy command and its description to the command line API.
    .command('deploy <antType> <tunnel>', 'Deploys an ant to tunnel (as "row,col" eg. "0,6").') 

    //Provide an alias for the vorlap command, user can enter add or d instead of deploy
    .alias('add', 'd') 

    //Give autocomplete options for Ant types
    .autocomplete(['Grower','Thrower','Eater','Scuba','Guard']) 

    //Exposes a commandInstnace object, makes sure that all stdout for Vorpal command is properly
    //routed through piped commands, and correctly renders to terminal. 
    //This instance makes sure the Ant gets deployed in right spot. Then shows the updated gameboard.
    //(e.g. executes the deploy command and its arguments)
    .action(function(args, callback) {
      let error = game.deployAnt(args.antType, args.tunnel)
      if(error){
        Vorpal.log(`Invalid deployment: ${error}.`);
      }
      else {
        Vorpal.log(getMap(game));
      }
      callback();
    });


  Vorpal
    //Adds the remove command and its description to the command line API.
    .command('remove <tunnel>', 'Removes the ant from the tunnel (as "row,col" eg. "0,6").') 

    //Provide an alias for the vorlap command, user can enter rm instead of remove
    .alias('rm') 

    //Exposes a commandInstance object, makes sure that all stdout for Vorpal command is properly
    //routed through piped commands, and correctly renders to terminal. 
    //This instance makes sure an ant gets removed. Then shows the updated gameboard. 
    //(e.g. executes the remove command and its arguments).
    .action(function(args, callback){
      let error = game.removeAnt(args.tunnel);
      if(error){
        Vorpal.log(`Invalid removal: ${error}.`);
      }
      else {
        Vorpal.log(getMap(game));
      }
      callback();
    });


  Vorpal
    //Adds the boost command and its description to the command line API.
    .command('boost <boost> <tunnel>', 'Applies a boost to the ant in a tunnel (as "row,col" eg. "0,6")') 

    //Provide an alias for the vorlap command, user can enter b instead of boost
    .alias('b') 

    //Provide autocomplete neames for the boost, usingnames in getBoostsNames()'s filtered list.
    .autocomplete({data:() => game.getBoostNames()}) 

    //Exposes a commandInstance object, makes sure that all stdout for Vorpal command is properly
    //routed through piped commands, and correctly renders to terminal. 
    //This instance makes sure an Ant gets its boost, if boost is invalid then shows an error. 
    //Then shows the updated gameboard. (e.g executes boost command and its arguments)
    .action(function(args, callback){
      let error = game.boostAnt(args.boost, args.tunnel);
      if(error){
        Vorpal.log(`Invalid boost: ${error}`);
      }
      callback();
    })

  Vorpal
    //Adds the turn command and its description to the command line API.
    .command('turn', 'Ends the current turn. Ants and bees will act.') 

    //Provide an alias for the vorlap command, user can enter b instead of boost
    .alias('end turn', 'take turn','t') 

    //Exposes a commandInstance object, makes sure that all stdout for Vorpal command is properly
    //routed through piped commands, and correctly renders to terminal. 
    //This instance checks to see if the game has been won. Displays win or lose message
    //based on game condition. Those message are styled using Chalk API. 
    //(e.g executes turn command)
    .action(function(args, callback){
      game.takeTurn();
      Vorpal.log(getMap(game));
      let won:boolean = game.gameIsWon();
      if(won === true){
        Vorpal.log(chalk.green('Yaaaay---\nAll bees are vanquished. You win!\n')); //Display winning message in Green, using Chalk API
      }
      else if(won === false){
        Vorpal.log(chalk.yellow('Bzzzzz---\nThe ant queen has perished! Please try again.\n')); //Display Losing message in Yellow, using Chalk API
      }
      else {
        callback();
      }
    });
}
