/**
 *
 * This error is thrown when you access `.observable` on a [group](https://connective.dev/docs/group),
 * since a group does not have an underlying observable.
 *
 */
export class GroupObservableError extends Error {
  constructor() {
    super('A group of pins does not have an observable.');
  }
}
