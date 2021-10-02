import {Insect, Bee, Ant, GrowerAnt, ThrowerAnt, EaterAnt, ScubaAnt, GuardAnt} from './ants';

/**
 * Concrete Class used to create individual
 * spaces in the Colony (i.g. gameboard).
 */
class Place {
  protected ant:Ant;
  protected guard:GuardAnt;
  protected bees:Bee[] = [];

  /**
   * Sets up a location in the colony.
   * 
   * @param name a string represetning the name of current location
   * @param water a boolean representing if current location is flooded
   * @param exit a Place representing if an object needs to retreat (undefined by default)
   * @param entrance a Place represetning if an object needs to enter the colony (undefined by default)
   */
  constructor(readonly name:string,
              protected readonly water = false,
              private exit?:Place, 
              private entrance?:Place) {}

  /**
   * Gets the exit location of a Place.
   * 
   * @returns the Place of a location's exit
   */
  getExit():Place { return this.exit; }

  /**
   * Sets a Place's entrance location.
   * 
   * @param place the location to set a place's entrance
   */
  setEntrance(place:Place){ this.entrance = place; }

  /**
   * Checks to see if the current location is flooded.
   * 
   * @returns a boolean representing the water status of a location in tunnel
   */
  isWater():boolean { return this.water; }

  /**
   * Gets an Ant at a certain location. Checks to see
   * if the Ant is a guard ant or not. 
   * 
   * @returns the Ant at the current location
   */
  getAnt():Ant { 
    if(this.guard) 
      return this.guard;
    else 
      return this.ant;
  }

  /**
   * Gets the guarded ant from current location.
   * 
   * @returns the currently guarded Ant
   */
  getGuardedAnt():Ant {
    return this.ant;
  }

  /**
   * Gets all currently placed Bees on the gameboard.
   * 
   * @returns the currently placed Bees
   */
  getBees():Bee[] { return this.bees; }

  /**
   * Cycles through the Bee's currently on the board, 
   * and returns the Bee. Returns undefined if no Bee
   * exists in the tunnel. 
   * 
   * @param maxDistance the furthest distance a Bee can be located
   * @param minDistance the least distance a Bee can be located, default to zero.
   * @returns the closest Bee in a valid Place
   */
  getClosestBee(maxDistance:number, minDistance:number = 0):Bee {
		let p:Place = this;
		for(let dist = 0; p!==undefined && dist <= maxDistance; dist++) {
			if(dist >= minDistance && p.bees.length > 0) {
				return p.bees[0];
      }
			p = p.entrance;
		}
		return undefined;
  }

  /**
   * Adds an Ant to the gameboard at the current location.
   * Checks to see if the Ant is a Guard ant or another type.
   * If an Ant already exists at the current location, returns 
   * false. 
   * 
   * @param ant the type of Ant to be added to the gameboard
   * @returns a boolean representing if the Ant was succesfully placed or not
   */
  addAnt(ant:Ant):boolean {
    if(ant instanceof GuardAnt) {
      if(this.guard === undefined){
        this.guard = ant;
        this.guard.setPlace(this);
        return true;
      }
    }
    else 
      if(this.ant === undefined) {
        this.ant = ant;
        this.ant.setPlace(this);
        return true;
      }
    return false;
  }

  /**
   * Removes an Ant from current location on the gameboard.
   * Checks to see if the Ant is a Guard ant or another type.
   * 
   * @returns the Ant that was removed from current location
   */
  removeAnt():Ant {
    if(this.guard !== undefined){
      let guard = this.guard;
      this.guard = undefined;
      return guard;
    }
    else {
      let ant = this.ant;
      this.ant = undefined;
      return ant;
    }
  }

  /**
   * Adds a Bee to the gameboard at a specified location.
   * Adds the Bee to the location's bees array.
   * 
   * @param Bee the Bee to add
   */
  addBee(bee:Bee):void {
    this.bees.push(bee);
    bee.setPlace(this);
  }

  /**
   * Removes a Bee from the gameboard at a specified location.
   * Removes the Bee from the location's bees array.
   * If no Bee exists, does nothing. 
   * 
   * @param bee the bee to remove
   */
  removeBee(bee:Bee):void {
    var index = this.bees.indexOf(bee);
    if(index >= 0){
      this.bees.splice(index,1);
      bee.setPlace(undefined);
    }
  }

  /**
   * Removes all Bee's from a location's bee array.
   */
  removeAllBees():void {
    this.bees.forEach((bee) => bee.setPlace(undefined) );
    this.bees = [];
  }

  /**
   * Removes a Bee from it's current location.
   * Adds the Bee to the list of bees to leave 
   * at end turn.
   * 
   * @param bee the Bee to retreat
   */
  exitBee(bee:Bee):void {
    this.removeBee(bee);
    this.exit.addBee(bee);  
  }

  /**
   * Removes an Insect from its current location.
   * 
   * @param insect the Ant or Bee to be removed.
   */
  removeInsect(insect:Insect) {
    if(insect instanceof Ant){
      this.removeAnt();
    }
    else if(insect instanceof Bee){
      this.removeBee(insect);
    }
  }

  /**
   * Performs Places's functionality during a turn.
   * 
   * If a location is flooded, removes all Ants unless
   * the ant's type is Scuba.
   * 
   * If the location has a Guard Ant, remove the Guard
   * first.
   * 
   */
  act() {
    if(this.water){
      if(this.guard){
        this.removeAnt();
      }
      if(!(this.ant instanceof ScubaAnt)){
        this.removeAnt();
      }
    }
  }
}

/**
 * Concrete Child class of Place. Sets up a Hive of Bees,
 * additionally controlling the waves and invading of bees.
 */
class Hive extends Place {
  private waves:{[index:number]:Bee[]} = {}

  /**
   * Creates a new Bee Hive, giving each Bee
   * a set number of armor and damage.
   * 
   * @param beeArmor the amount of armor a Bee should have
   * @param beeDamage the amount of damage a Bee should deal
   */
  constructor(private beeArmor:number, private beeDamage:number){
    super('Hive');
  }

  /**
   * Creates a new wave of Bees, intializing them with set armor
   * and damage values. Adds the bee to the Hive, then adds the Bee
   * to the wave.
   * 
   * @param attackTurn - the wave's attack turn index (.e.g turn 3, turn 4, etc.)
   * @param numBees the number of Bees to be put in new wave
   * @returns the newly created wave of Bees.
   */
  addWave(attackTurn:number, numBees:number):Hive {
    let wave:Bee[] = [];
    for(let i=0; i<numBees; i++) {
      let bee = new Bee(this.beeArmor, this.beeDamage, this);
      this.addBee(bee);
      wave.push(bee);
    }
    this.waves[attackTurn] = wave;
    return this;
  }
  
  /**
   * If the Bee wave from the Hive is not empty, randomly 
   * assigns each Bee to a colony's tunnel entrances. If 
   * no wave, returns an empty array.
   * 
   * @param colony the AntColony to invade
   * @param currentTurn the current turn
   * @returns the wave of Bees who are invading
   */
  invade(colony:AntColony, currentTurn:number): Bee[]{

    //If Wave isn't empty, randomly assign Bee's go tunnel entrances
    if(this.waves[currentTurn] !== undefined) {
      this.waves[currentTurn].forEach((bee) => {
        this.removeBee(bee);
        let entrances:Place[] = colony.getEntrances();
        let randEntrance:number = Math.floor(Math.random()*entrances.length);
        entrances[randEntrance].addBee(bee);
      });
      return this.waves[currentTurn];
    }
    
    //If no wave, return nothing
    else{
      return [];
    }    
  }
}

/**
 * Concrete class controlling the Ant Colony. Contains
 * information concerning food supply, tunnel entrances,
 * the queen's location, boosts supply, and locations 
 * in the colony. 
 */
class AntColony {
  private food:number; //Total food resources
  private places:Place[][] = []; //Gameboard
  private beeEntrances:Place[] = []; //Tunnel entraces
  private queenPlace:Place = new Place('Ant Queen'); //Queens location
  private boosts:{[index:string]:number} = {'FlyingLeaf':1,'StickyLeaf':1,'IcyLeaf':1,'BugSpray':0} //Default inventory of boosts

  /**
   * Sets up an a AntColony with an inital number of  tunnels, 
   * food storage, varing tunnel lengths and the rate at which 
   * a location floods.
   *
   * @param startingFood amount of food colony should start with
   * @param numTunnels number of tunnels in a colony (entrances)
   * @param tunnelLength the length of a tunnel (e.g. how many places in each tunnel)
   * @param moatFrequency the requency in which a location should flood
   */
  constructor(startingFood:number, numTunnels:number, tunnelLength:number, moatFrequency=0){
    this.food = startingFood;

    let prev:Place;

    //
		for(let tunnel=0; tunnel < numTunnels; tunnel++)
		{
			let curr:Place = this.queenPlace;
      this.places[tunnel] = [];

      //Sets up individual tunnels, flooding specific locations when necessary.
			for(let step=0; step < tunnelLength; step++)
			{
        let typeName = 'tunnel';
        
        //Calulat the moat frequency
        if(moatFrequency !== 0 && (step+1)%moatFrequency === 0){
          typeName = 'water';
				}
				
				prev = curr;
        let locationId:string = tunnel+','+step;
        curr = new Place(typeName+'['+locationId+']', typeName=='water', prev);
        prev.setEntrance(curr);
				this.places[tunnel][step] = curr;
			}
			this.beeEntrances.push(curr);
		}
  }

  /**
   * Gets the current food supply in a colony.
   * 
   * @returns the current food supply
   */
  getFood():number { return this.food; }

  /**
   * Increase the food supply of a quality by the passed amount.
   * 
   * @param amount the number to increase food by
   */
  increaseFood(amount:number):void { this.food += amount; }

  /**
   * Gets all locations in the colony.
   * 
   * @returns the colony's location
   */
  getPlaces():Place[][] { return this.places; }

  /**
   * Returns the number of entraces in a colony.
   * 
   * @returns the valid entrances for Bees
   */
  getEntrances():Place[] { return this.beeEntrances; }

  /**
   * Get the Queen's current location in the colony.
   * 
   * @returns the Queen's current position.
   */
  getQueenPlace():Place { return this.queenPlace; }

  /**
   * Checks to see if the Queen is being attacked by Bees.
   * 
   * @returns a boolean representing the Queen's state (i.e. under attack or okay)
   */
  queenHasBees():boolean { return this.queenPlace.getBees().length > 0; }

  /**
   * Gets the boost inventory of the colony.
   * 
   * @returns the boosts currenly available
   */
  getBoosts():{[index:string]:number} { return this.boosts; }

  /**
   * Add a boost to the colony's inventory. If no
   * boost is provided, leave the boost inventory
   * at zero. Notifies user is a boost has been 
   * found.
   * 
   * @param boost the name of the boost to add to colony's inventory
   */
  addBoost(boost:string){
    if(this.boosts[boost] === undefined){
      this.boosts[boost] = 0;
    }
    this.boosts[boost] = this.boosts[boost]+1;
    console.log('Found a '+boost+'!');
  }

  /**
   * Deploys an Ant at a specified location depending on
   * food supply and tunnel status. Subtracts the Ant's
   * food cost from food supply. 
   * 
   * If not enough food, let user know there is a shortage.
   * If location already occupied, let user know there 
   * is not enough room in the tunnel to place the Ant.
   * 
   * @param ant the Ant to be placed
   * @param place the location in the tunnel the Ant should be placed
   * @returns undefined if successful or erorr messages to the user depending on colony status.
   */
  deployAnt(ant:Ant, place:Place):string {
    if(this.food >= ant.getFoodCost()){
      let success = place.addAnt(ant);
      if(success){
        this.food -= ant.getFoodCost();
        return undefined;
      }
      return 'tunnel already occupied';
    }
    return 'not enough food';
  }

  /**
   * Removes an Ant from a specified place.
   * @param place the location an Ant should be removed from.
   */
  removeAnt(place:Place){
    place.removeAnt();
  }

  /**
   * Checks to see if there are any Boosts in the colony.
   * If there are available boosts, attempts to give an 
   * Ant at a specific location a boost. 
   * 
   * If there is no Ant at the location, then notify user. 
   * If there are not boosts in inventory, then nofity user.
   * 
   * @param boost the boost to give to the Ant
   * @param place the location of the Ant in which to give the boost
   * @returns undefined if a boost is given or error messages depending on colony state
   */
  applyBoost(boost:string, place:Place):string {
    if(this.boosts[boost] === undefined || this.boosts[boost] < 1) {
      return 'no such boost';
    }
    let ant:Ant = place.getAnt();
    if(!ant) {
      return 'no Ant at location' 
    }
    ant.setBoost(boost);
    return undefined;
  }

  /**
   * Initiates functionality for all Ants currently
   * in the colony.
   */
  antsAct() {
    this.getAllAnts().forEach((ant) => {
      if(ant instanceof GuardAnt) {
        let guarded = ant.getGuarded();
        if(guarded)
          guarded.act(this);
      }
      ant.act(this);
    });    
  }

  /**
   * Initiates functionality for each Bee currently
   * in the colony.
   */
  beesAct() {
    this.getAllBees().forEach((bee) => {
      bee.act();
    });
  }

  /**
   * Intiaites functionality for Places (each location)
   * in the colony. Removing Ants that need to be retreated
   * or Ants that have been flooded.
   */
  placesAct() {
    for(let i=0; i<this.places.length; i++) {
      for(let j=0; j<this.places[i].length; j++) {
        this.places[i][j].act();
      }
    }    
  }

  /**
   * Gets the remaining Ants in the colony (i.g. suriving Ants, unflooded Ants).
   * Iterates through each tunnel's locations, adding surviving Ants to an array.
   * 
   * @returns an arry of all surviving ants in the colony.
   */
  getAllAnts():Ant[] {
    let ants = [];
    for(let i=0; i<this.places.length; i++) {
      for(let j=0; j<this.places[i].length; j++) {
        if(this.places[i][j].getAnt() !== undefined) {
          ants.push(this.places[i][j].getAnt());
        }
      }
    }
    return ants;
  }

  /**
   * Gets the remaining Bees in the colony. Iterates through each tunnel's 
   * locations, adding surviving Bees to an array.
   * 
   * @returns an array of all surviving Bees
   */
  getAllBees():Bee[] {
    var bees = [];
    for(var i=0; i<this.places.length; i++){
      for(var j=0; j<this.places[i].length; j++){
        bees = bees.concat(this.places[i][j].getBees());
      }
    }
    return bees;
  }
}

/**
 * Concrete class to control the gameplay.
 */
class AntGame {
  private turn:number = 0;
  constructor(private colony:AntColony, private hive:Hive){}

  takeTurn() {
    console.log('');
    this.colony.antsAct();
    this.colony.beesAct();
    this.colony.placesAct();
    this.hive.invade(this.colony, this.turn);
    this.turn++;
    console.log('');
  }

  getTurn() { return this.turn; }

  gameIsWon():boolean|undefined {
    if(this.colony.queenHasBees()){
      return false;
    }
    else if(this.colony.getAllBees().length + this.hive.getBees().length === 0) {
      return true;
    }   
    return undefined;
  }

  deployAnt(antType:string, placeCoordinates:string):string {
    let ant;
    switch(antType.toLowerCase()) {
      case "grower":
        ant = new GrowerAnt(); break;
      case "thrower":
        ant = new ThrowerAnt(); break;
      case "eater":
        ant = new EaterAnt(); break;
      case "scuba":
        ant = new ScubaAnt(); break;
      case "guard":
        ant = new GuardAnt(); break;
      default:
        return 'unknown ant type';
    }

    try {
      let coords = placeCoordinates.split(',');
      let place:Place = this.colony.getPlaces()[coords[0]][coords[1]];
      return this.colony.deployAnt(ant, place);
    } catch(e) {
      return 'illegal location';
    }
  }

  removeAnt(placeCoordinates:string):string {
    try {
      let coords = placeCoordinates.split(',');
      let place:Place = this.colony.getPlaces()[coords[0]][coords[1]];
      place.removeAnt();
      return undefined;
    }catch(e){
      return 'illegal location';
    }    
  }

  boostAnt(boostType:string, placeCoordinates:string):string {
    try {
      let coords = placeCoordinates.split(',');
      let place:Place = this.colony.getPlaces()[coords[0]][coords[1]];
      return this.colony.applyBoost(boostType,place);
    }catch(e){
      return 'illegal location';
    }    
  }

  getPlaces():Place[][] { return this.colony.getPlaces(); }
  getFood():number { return this.colony.getFood(); }
  getHiveBeesCount():number { return this.hive.getBees().length; }
  getBoostNames():string[] { 
    let boosts = this.colony.getBoosts();
    return Object.keys(boosts).filter((boost:string) => {
      return boosts[boost] > 0;
    }); 
  }
}

export { AntGame, Place, Hive, AntColony }