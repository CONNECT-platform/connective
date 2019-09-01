/**
 * 
 * This error is thrown when an agent which has no explicit specification
 * of its entry and exit pins is used as a partial flow.
 * [Read this](https://connective.dev/docs/agent#implicit-connection) for more
 * information on partial flows.
 * 
 */
export class ImproperPartialFlow extends Error {
  constructor(object: any) {
    super(`${object.constructor?object.constructor.name:object} is not a properly defined PartialFlow.
For more information, follow this link:
https://connective.dev/docs/agent#implicit-connection`);
  }
}