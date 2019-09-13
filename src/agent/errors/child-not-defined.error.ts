/**
 *
 * This error is thrown when a non-defined child of a composition
 * is accessed.
 *
 */
export class ChildNotDefined extends Error {
  constructor(name: string) {
    super(`No child with name ${name} is defined.`);
  }
}
