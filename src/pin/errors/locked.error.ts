/**
 * 
 * This error is thrown when you connect a pin to a locked pin.
 * [Read this](https://connective.dev/docs/pin#subscribing-and-binding)
 * for more information on when a pin is locked.
 * 
 */
export class PinLockedError extends Error {
  constructor() {
    super(`Attempted to modify pin after it was locked. 
Check the following link for more info:
https://connective.dev/docs/pin#subscribing-and-binding`);
  }
}
