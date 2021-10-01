import {AntColony, Place} from './game';


/**
 * Abstract class providing framework for creasting
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
   * Get the name of an Insect object
   * 
   * @returns a string representing the Insect's name
   */
  getName():string { return this.name; }

  /**
   * Gets the amount of armor from an Insect (Ant or Bee)
   * 
   * @returns a number representing the Insect's armor quantity
   */
  getArmor():number { return this.armor; }

  /**
   * Gets the current location of an Insect (Ant or Bee)
   * 
   * @returns the current Place of an Insect
   */
  getPlace() { return this.place; }

  /**
   * Sets or readjusts an Insect's position on the board. 
   * 
   * @param place a Plce object representing the location to send the Insect to.
   */
  setPlace(place:Place){ this.place = place; }

  /**
   *  Reduces the armor of an Insect. If the armor is 0 or less, 
   *  prints to the console that the respective Insect's armor has expired 
   *  and then removes the Insect from the gameboard. 
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
   * Abstract method used to provide functionality for Insects on gameboard
   * 
   * @param colony the current AntColony
   */
  abstract act(colony?:AntColony):void;

  /**
   * Helper function to display information about an Insect:
   * displays name and place of Insect.
   * 
   * @returns string representing Insect information
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
   * Creates a new Been Object
   * 
   * @param armor a number representing the quanity of armor the new Bee should have
   * @param damage a number presenting the damage the new Bee should do to an Ant
   * @param place a Place, optional, that determines where the Bee should be placed on the board
   */
  constructor(armor:number, private damage:number, place?:Place){
    super(armor, place);
  }


  /**
   * Attack functionality for Bee(s) to do damage to an Ant.
   * 
   * @param ant an Ant object represetning an Ant to do damage to
   * @returns a boolean representing if damage calculation happened -  checks to see if the Ant needs to retreat or not. 
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
   * Sets the status of a Bee obejct.
   * 
   * @param status condition of a Bee object (e.g. stucky, frozen, etc.)
   */
  setStatus(status:string) { this.status = status; }

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
 * 
 */
export abstract class Ant extends Insect {
  protected boost:string;
  constructor(armor:number, private foodCost:number = 0, place?:Place) {
    super(armor, place);
  }

  /**
   * Gets the food cost of a particular Ant object
   * 
   * @returns a number representing the food cost of the Ant
   */
  getFoodCost():number { return this.foodCost; }

  /**
   * Displays to console that the current Ant has been 
   * a specific boost
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

  constructor() {
    super(1,1)
  }

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

  constructor() {
    super(1,4);
  }

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
 * for setting up an EaterAnt object.
 */
export class EaterAnt extends Ant {
  readonly name:string = "Eater";
  private turnsEating:number = 0;
  private stomach:Place = new Place('stomach');
  constructor() {
    super(2,4)
  }

  isFull():boolean {
    return this.stomach.getBees().length > 0;
  }

  act() {
    console.log("eating: "+this.turnsEating);
    if(this.turnsEating == 0){
      console.log("try to eat");
      let target = this.place.getClosestBee(0);
      if(target) {
        console.log(this + ' eats '+target+'!');
        this.place.removeBee(target);
        this.stomach.addBee(target);
        this.turnsEating = 1;
      }
    } else {
      if(this.turnsEating > 3){
        this.stomach.removeBee(this.stomach.getBees()[0]);
        this.turnsEating = 0;
      } 
      else 
        this.turnsEating++;
    }
  }  

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

  constructor() {
    super(1,5)
  }

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

  constructor() {
    super(2,4)
  }

  getGuarded():Ant {
    return this.place.getGuardedAnt();
  }

  act() {}
}
