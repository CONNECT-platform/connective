export class ChildNotDefined extends Error {
  constructor(name: string) {
    super(`No child with name ${name} is defined.`);
  }
}
