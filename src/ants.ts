import {AntColony, Place} from './game';


/**
 * Abstract class providing framework for creating
 * Bee & Ant objects.
 */
export abstract class Insect {
  readonly name:string;

  /**
   * Superclass constructor for Insect objects.
   * 
   * @param armor a number representing how much armor the Insect should have
   * @param place a Place object representing a location of the Insect
   */
  constructor(protected armor:number, protected place:Place){}

  /**
   * Get the name of an Insect.
   * 
   * @returns a string representing the Insect's name
   */
  getName():string { return this.name; }

  /**
   * Gets the amount of armor for an Insect.
   * 
   * @returns a number representing the Insect's armor quantity
   */
  getArmor():number { return this.armor; }

  /**
   * Gets the current location of an Insect.
   * 
   * @returns the current location of an Insect
   */
  getPlace() { return this.place; }

  /**
   * Sets or readjusts an Insect's position on the board. 
   * 
   * @param place a Place object representing the location to move the Insect to.
   */
  setPlace(place:Place){ this.place = place; }

  /**
   *  Reduces the armor of an Insect. 
   * 
   *  If the armor is 0 or less, prints to the console that 
   *  the respective Insect's armor has expired and then removes 
   *  the Insect from the gameboard. 
   *  
   * @param amount a number representing how much armor an Insect currently has
   * @returns a boolean representing if the Insect has retreated or not based on armor amount
   */
  reduceArmor(amount:number):boolean {
    this.armor -= amount;
    if(this.armor <= 0){
      console.log(this.toString()+' ran out of armor and expired');
      this.place.removeInsect(this);
      return true;
    }
    return false;
  }

  /**
   * Abstract method used to provide functionality for Insects on gameboard.
   * 
   * @param colony the current AntColony
   */
  abstract act(colony?:AntColony):void;

  /**
   * Displays information about an Insect. Shows
   * the Insect's name and current place.
   * 
   * @returns string representing Insect's information
   */
  toString():string {
    return this.name + '('+(this.place ? this.place.name : '')+')';
  }
}

/**
 * Concrete child class of Insect. Provides
 * framework for Bee obejects.
 */
export class Bee extends Insect {
  readonly name:string = 'Bee';
  private status:string;

  /**
   * Creates a new Bee Object.
   * 
   * @param armor a number representing the quantity of armor the new Bee should have
   * @param damage a number presenting the damage the new Bee should do to an Ant
   * @param place a Place that determines where the Bee should be located on the board (optional)
   */
  constructor(armor:number, private damage:number, place?:Place){
    super(armor, place);
  }

  /**
   * Attack functionality for a Bee to do damage to an Ant. Checks to see 
   * if the Ant needs to retreat or not.
   * 
   * @param ant an Ant object represetning an Ant to take damage
   * @returns a boolean representing if damage calculation happened
   */
  sting(ant:Ant):boolean{
    console.log(this+ ' stings '+ant+'!');
    return ant.reduceArmor(this.damage);
  }

  /**
   * Checks to see if the Bee is currently blocked by an Ant.
   * Additionally checks to see if the Ant is a Guard.
   * 
   * @returns a boolean representing if the Bee is blocked or not
   */
  isBlocked():boolean {
    return this.place.getAnt() !== undefined;
  }

  /**
   * Sets the status of a Bee object.
   * 
   * @param status condition of a Bee object (e.g. stuck, frozen, etc.)
   */
  setStatus(status:string) { this.status = status; }

  /**
   * Performs a Bee's sting action during the turn. 
   * 
   * Checks to see if an Ant is blocking the Bee's path. If an 
   * Ant is present, and the Bee is not under the cold special 
   * condition it deals damage to the Ant that is blocking it.
   * If no applicable condition, status is left undefined.
   * 
   * Additionally checks to see if the Bee needs to retreat 
   * (i.g. removed from tunnel)
   */
  act() {
    if(this.isBlocked()){
      if(this.status !== 'cold') {
        this.sting(this.place.getAnt());
      }
    }
    else if(this.armor > 0) {
      if(this.status !== 'stuck'){
        this.place.exitBee(this);
      }
    }    
    this.status = undefined;
  }
}

/**
 * Abstract child class of Insect, providing framework 
 * for various Ant Types (e.g. Thrower, Grower, etc.)
 */
export abstract class Ant extends Insect {
  protected boost:string;

  /**
   * Parent constuctor for Ant child objects.
   * 
   * @param armor a number representing the amount of armor a new Ant should have
   * @param foodCost a number representing the food cost of a new Ant, defaults to 0
   * @param place a Place representing the location where an Ant should be set (optional)
   */
  constructor(armor:number, private foodCost:number = 0, place?:Place) {
    super(armor, place);
  }

  /**
   * Gets the food cost of a particular Ant object.
   * 
   * @returns a number representing the food cost of the Ant
   */
  getFoodCost():number { return this.foodCost; }

  /**
   * Displays to console that the current Ant has been 
   * given a specific boost.
   * 
   * @param boost a string represeting the boost's name
   */
  setBoost(boost:string) { 
    this.boost = boost; 
      console.log(this.toString()+' is given a '+boost);
  }
}

/**
 * Concrete child class of Ant. Provides framework
 * for setting up a GrowerAnt object.
 */
export class GrowerAnt extends Ant {
  readonly name:string = "Grower";

  /**
   * Creates a new Grower Ant with 1 armor and food cost of 1.
   */
  constructor() {
    super(1,1)
  }

  /**
   * Performs a GrowerAnt's functionality during the turn. 
   * 
   * Simulates a die roll for a turn using Math.random(). Based on roll, 
   * the GrowerAnt will either produce one food for the colony or add one 
   * special boost (e.g. FlyingLeaf, StickyLeaf, IcyLeaf, BugSpray).
   *  
   * If roll is less than 0.60, adds one food to the colony.
   * If roll is less than 0.70, adds one FlyingLeaf to colony's boost.
   * If roll is less than 0.80, adds one StickyLeaf to colony's boost
   * If roll is less than 0.90, adds one IcyLeaf to colony's boost.
   * If roll is less than 0.95, adds one BugSpray to colony's boost.
   * 
   * @param colony the current AntColony
   */
  act(colony:AntColony) {
    let roll = Math.random();
    if(roll < 0.6){
      colony.increaseFood(1);
    } else if(roll < 0.7) {
      colony.addBoost('FlyingLeaf');
    } else if(roll < 0.8) {
      colony.addBoost('StickyLeaf');
    } else if(roll < 0.9) {
      colony.addBoost('IcyLeaf');
    } else if(roll < 0.95) {
      colony.addBoost('BugSpray');
    }
  }  
}

/**
 * Concrete child class of Ant. Provides framework
 * for setting up a ThrowerAnt object.
 */
export class ThrowerAnt extends Ant {
  readonly name:string = "Thrower";
  private damage:number = 1;

  /**
   * Creates a new ThrowerAnt object with 1 armor and food cost of 4.
   */
  constructor() {
    super(1,4);
  }

  /**
   * Performs a ThrowerAnt's functionality during the turn. 
   * 
   * Runs initial check to see if the BugSpray boost has been activated. 
   * If BugSpray boost has not been activated, then checks for FlyingLeaf
   * boost activation. ThrowerAnt then attacks the targeted Bee, notifying 
   * the user. After damage is calcalulated, checks to see if a Bee has 
   * been affected by the StickyLeaf or IcyLeaf -- setting that status for
   * the targeted Bee. Will notify user based which effect has been applied.
   * 
   * If no boosts were activated, leave boost as undefined. 
   * 
   * If BugSpray boost has been activated, destroyes all Bees (and calling Ant)
   * in the tunnel.
   * 
   * If FlyingLeaf boost has been activated, increases the range a ThrowerAnt 
   * can throw its leaf by 2 distances. 
   * 
   * If StickyLeaf boost has been activated, sets targeted Bee's status to stuck
   * preventing its movement next turn.
   * 
   * If IcyLeaf boost has been activated, sets targeted Bee's status to cold,
   * preventing it from stinging an Ant next turn.
   */
  act() {

    //Non-BugSpray attack patterns. 
    if(this.boost !== 'BugSpray'){
      let target;
      if(this.boost === 'FlyingLeaf')
        target = this.place.getClosestBee(5);
      else
        target = this.place.getClosestBee(3);

      if(target){
        console.log(this + ' throws a leaf at '+target);
        target.reduceArmor(this.damage);
    
        if(this.boost === 'StickyLeaf'){
          target.setStatus('stuck');
          console.log(target + ' is stuck!');
        }
        if(this.boost === 'IcyLeaf') {
          target.setStatus('cold');
          console.log(target + ' is cold!');
        }
        this.boost = undefined;
      }
    }
    
    //BugSpray attack pattern
    else {
      console.log(this + ' sprays bug repellant everywhere!');
      let target = this.place.getClosestBee(0);
      while(target){
        target.reduceArmor(10);
        target = this.place.getClosestBee(0);
      }
      this.reduceArmor(10);
    }
  }
}

/**
 * Concrete child class of Ant. Provides framework
 * for setting up an EaterAnt object.
 */
export class EaterAnt extends Ant {
  readonly name:string = "Eater";
  private turnsEating:number = 0;
  private stomach:Place = new Place('stomach');

  /**
   * Creates a new EaterAnt object with 2 armor and food cost of 4.
   */
  constructor() {
    super(2,4)
  }

  /**
   * Checks to see if an EaterAnt's stomach is currently fully.
   * 
   * @returns a boolean representing the EaterAnt's stomach status (e.g. full or not full)
   */
  isFull():boolean {
    return this.stomach.getBees().length > 0;
  }

  /**
   * Performs an EaterAnt's functionality during the turn. 
   * 
   * Notify user of how many turns since an EaterAnt has last ate a Bee. 
   * Checks to see if a Bee has been eaten. If no Bee has been ate, targets
   * the closest Bee to the EaterAnt for eating and removes that Bee from 
   * the map and places it in the EaterAnt's stomach. If no Bee exists, then '
   * nothing happens. 
   * 
   * If the EaterAnt has a Bee in it's stomach currently, increments 
   * the turns since last eating the Bee by one. If turns is greater than 
   * three, removes that Bee from the EaterAnt's stomach and resets
   * turns since last eating a Bee to 0.
   * 
   */
  act() {

    //Log turns since eating a Bee.
    console.log("eating: "+this.turnsEating);

    //If no Bee ate, try to eat closet Bee.
    if(this.turnsEating == 0){
      console.log("try to eat");
      let target = this.place.getClosestBee(0);
      if(target) {
        console.log(this + ' eats '+target+'!');
        this.place.removeBee(target);
        this.stomach.addBee(target);
        this.turnsEating = 1;
      }
    } 
    
    //Handles Eating Cooldown
    else {
      if(this.turnsEating > 3){
        this.stomach.removeBee(this.stomach.getBees()[0]);
        this.turnsEating = 0;
      } 
      else 
        this.turnsEating++;
    }
  }  


  /**
   * Notify user of the damage taken, display curent armor levels.
   * 
   * If armor EaterAnt takes damage, coughs up the currently ate
   * Bee and places it on the map. Notify user that the EaterAnt 
   * has coughed up the Bee. Sets turns since last eating a Bee
   * to three, preparring for next turn reset.
   * 
   * If armor is less than zero (e.g. EaterAnt has retreated) and 
   * turns since last eating is between 1 and 2, AntEater coughs
   * up currently ate Bee. Does not reset turns since last eating
   * a Bee to 0 (since Ant has retreated). Notify user the Bee 
   * has been placed back on the board.
   * 
   * @param amount the amount in which to reduce armor (e.g. damage)
   * @returns a boolean representing if the EaterAnt has to retreat or not 
   */
  reduceArmor(amount:number):boolean {
    this.armor -= amount;
    console.log('armor reduced to: '+this.armor);
    if(this.armor > 0){
      if(this.turnsEating == 1){
        let eaten = this.stomach.getBees()[0];
        this.stomach.removeBee(eaten);
        this.place.addBee(eaten);
        console.log(this + ' coughs up '+eaten+'!');
        this.turnsEating = 3;
      }
    }
    else if(this.armor <= 0){
      if(this.turnsEating > 0 && this.turnsEating <= 2){
        let eaten = this.stomach.getBees()[0];
        this.stomach.removeBee(eaten);
        this.place.addBee(eaten);
        console.log(this + ' coughs up '+eaten+'!');
      }
      return super.reduceArmor(amount);
    }
    return false;
  }
}

/**
 * Concrete child class of Ant. Provides framework
 * for setting up a ScubaAnt object.
 */
export class ScubaAnt extends Ant {
  readonly name:string = "Scuba";
  private damage:number = 1;

  /**
   * Creates a new ScubaAnt object with 1 armor and food cost of 5.
   */
  constructor() {
    super(1,5)
  }

  /**
   * Performs a ScubaAnt's functionality during the turn. 
   * 
   * Runs initial check to see if the BugSpray boost has been activated. 
   * If BugSpray boost has not been activated, then checks for FlyingLeaf
   * boost activation. ScubaAnt then attacks the targeted Bee, notifying 
   * the user. After damage is calcalulated, checks to see if a Bee has 
   * been affected by the StickyLeaf or IcyLeaf -- setting that status for
   * the targeted Bee. Will notify user based which effect has been applied.
   * 
   * If no boosts were activated, leave boost as undefined. 
   * 
   * If BugSpray boost has been activated, destroyes all Bees (and calling Ant)
   * in the tunnel.
   * 
   * If FlyingLeaf boost has been activated, increases the range a ScubaAnt 
   * can throw its leaf by 2 distances. 
   * 
   * If StickyLeaf boost has been activated, sets targeted Bee's status to stuck
   * preventing its movement next turn.
   * 
   * If IcyLeaf boost has been activated, sets targeted Bee's status to cold,
   * preventing it from stinging an Ant next turn.
   */
  act() {
    if(this.boost !== 'BugSpray'){
      let target;
      if(this.boost === 'FlyingLeaf')
        target = this.place.getClosestBee(5);
      else
        target = this.place.getClosestBee(3);

      if(target){
        console.log(this + ' throws a leaf at '+target);
        target.reduceArmor(this.damage);
    
        if(this.boost === 'StickyLeaf'){
          target.setStatus('stuck');
          console.log(target + ' is stuck!');
        }
        if(this.boost === 'IcyLeaf') {
          target.setStatus('cold');
          console.log(target + ' is cold!');
        }
        this.boost = undefined;
      }
    }
    else {
      console.log(this + ' sprays bug repellant everywhere!');
      let target = this.place.getClosestBee(0);
      while(target){
        target.reduceArmor(10);
        target = this.place.getClosestBee(0);
      }
      this.reduceArmor(10);
    }
  }
}

/**
 * Concrete child class of Ant. Provides framework
 * for setting up a GuardAnt object.
 */
export class GuardAnt extends Ant {
  readonly name:string = "Guard";

  /**
   * Creates a new GuardAnt with 2 armor and food cost of 4.
   */
  constructor() {
    super(2,4)
  }

  /**
   * Gets the Ant who is currently being Guarded by the GuardAnt.
   * 
   * @returns the currently guarded Ant
   */
  getGuarded():Ant {
    return this.place.getGuardedAnt();
  }

  act() {}
}
