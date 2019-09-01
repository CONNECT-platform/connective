/**
 * 
 * This error is thrown when a child of a composition is not an agent
 * but is accessed as one.
 * 
 */
export class ChildIsNotAgent extends Error {
  constructor(name: string) {
    super(`Child ${name} is not an Agent.`);
  }
}

/**
 * 
 * This error is thrown when a child of a composition is not a pin
 * but is accessed as one.
 * 
 */
export class ChildIsNotPin extends Error {
  constructor(name: string) {
    super(`Child ${name} is not a Pin.`);
  }
}
