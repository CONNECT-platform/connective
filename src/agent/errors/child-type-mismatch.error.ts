export class ChildIsNotAgent extends Error {
  constructor(name: string) {
    super(`Child ${name} is not an Agent.`);
  }
}

export class ChildIsNotPin extends Error {
  constructor(name: string) {
    super(`Child ${name} is not a Pin.`);
  }
}
