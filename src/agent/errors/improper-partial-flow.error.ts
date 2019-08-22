export class ImproperPartialFlow extends Error {
  constructor(object: any) {
    super(`${object.constructor?object.constructor.name:object} is not a properly defined PartialFlow`);
  }
}