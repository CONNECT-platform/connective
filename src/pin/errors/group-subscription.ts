export class GroupObservableError extends Error {
  constructor() {
    super('A group of pins does not have an observable.');
  }
}
