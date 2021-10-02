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
 * 
 */
class Hive extends Place {
  private waves:{[index:number]:Bee[]} = {}

  constructor(private beeArmor:number, private beeDamage:number){
    super('Hive');
  }

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
  
  invade(colony:AntColony, currentTurn:number): Bee[]{
    if(this.waves[currentTurn] !== undefined) {
      this.waves[currentTurn].forEach((bee) => {
        this.removeBee(bee);
        let entrances:Place[] = colony.getEntrances();
        let randEntrance:number = Math.floor(Math.random()*entrances.length);
        entrances[randEntrance].addBee(bee);
      });
      return this.waves[currentTurn];
    }
    else{
      return [];
    }    
  }
}

/**
 * 
 */
class AntColony {
  private food:number;
  private places:Place[][] = [];
  private beeEntrances:Place[] = [];
  private queenPlace:Place = new Place('Ant Queen');
  private boosts:{[index:string]:number} = {'FlyingLeaf':1,'StickyLeaf':1,'IcyLeaf':1,'BugSpray':0}

  constructor(startingFood:number, numTunnels:number, tunnelLength:number, moatFrequency=0){
    this.food = startingFood;

    let prev:Place;
		for(let tunnel=0; tunnel < numTunnels; tunnel++)
		{
			let curr:Place = this.queenPlace;
      this.places[tunnel] = [];
			for(let step=0; step < tunnelLength; step++)
			{
        let typeName = 'tunnel';
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

  getFood():number { return this.food; }

  increaseFood(amount:number):void { this.food += amount; }

  getPlaces():Place[][] { return this.places; }

  getEntrances():Place[] { return this.beeEntrances; }

  getQueenPlace():Place { return this.queenPlace; }

  queenHasBees():boolean { return this.queenPlace.getBees().length > 0; }

  getBoosts():{[index:string]:number} { return this.boosts; }

  addBoost(boost:string){
    if(this.boosts[boost] === undefined){
      this.boosts[boost] = 0;
    }
    this.boosts[boost] = this.boosts[boost]+1;
    console.log('Found a '+boost+'!');
  }

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

  removeAnt(place:Place){
    place.removeAnt();
  }

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

  beesAct() {
    this.getAllBees().forEach((bee) => {
      bee.act();
    });
  }

  placesAct() {
    for(let i=0; i<this.places.length; i++) {
      for(let j=0; j<this.places[i].length; j++) {
        this.places[i][j].act();
      }
    }    
  }

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