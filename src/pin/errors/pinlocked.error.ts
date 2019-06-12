export class PinLockedError extends Error {
  constructor() {
    super('Attempted to modify pin after it was locked.');
  }
}
