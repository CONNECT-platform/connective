import { PartialFlow } from '../pin/partial-flow';

import { group, Group } from '../pin/group';
import { PinMap } from '../pin/pin-map';
import { PinLike } from '../pin/pin-like';
import { Pin } from '../pin/pin';

import { InputNotInSignature,
        OutputNotInSignature } from './errors/signature-mismatch.error';
import { ImproperPartialFlow } from './errors/improper-partial-flow.error';
import { Signature } from './signature';
import { AgentLike } from './agent-like';


/**
 * 
 * The parent class for [agents](https://connective.dev/docs/agent).
 * 
 */
export class Agent extends PartialFlow implements AgentLike {
  private _inputs: PinMap;
  private _outputs: PinMap;
  private _entries: Group;
  private _exits: Group;

  /**
   * 
   * @param signature the [signature](https://connective.dev/docs/agent#signature)
   * of the agent. Must be determined either by instantiators or sub-classes.
   * 
   */
  constructor(readonly signature: Signature) {
    super();
    this._inputs = new PinMap(label => this.createInput(label));
    this._outputs = new PinMap(label => this.createOutput(label));
  }

  /**
   * 
   * @param label 
   * @returns the input pin corresponding to given label
   * @throws an error if given label is not allowed by the agent's 
   * [signature](https://connective.dev/docs/agent#signature).
   * 
   */
  public in(label: string | number) { return this._inputs.get(label.toString()); }

  /**
   * 
   * @param label 
   * @returns the output pin corresponding to given label
   * @throws an error if given label is not allowed by the agent's
   * [signature](https://connective.dev/docs/agent#signature).
   * 
   */
  public out(label: string | number) { return this._outputs.get(label.toString()); }

  /**
   * 
   * @returns the entry pins for this agent for it to behave as a partial flow.
   * You can read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection).
   * 
   */
  public get entries(): Group {
    if (!this._entries) {
      let entries = this.createEntries();
      this._entries = (entries instanceof Group)?entries:group(...entries);
    }

    return this._entries;
  }

  /**
   * 
   * @returns the exit pins for this agent for it to behave as a partial flow.
   * You can read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection).
   * 
   */
  public get exits(): Group {
    if (!this._exits) {
      let exits = this.createExits();
      this._exits = (exits instanceof Group)?exits:group(...exits);
    }

    return this._exits;
  }

  public get inputs(): PinMap { return this._inputs; }
  public get outputs(): PinMap { return this._outputs; }

  /**
   * 
   * @note an Agent's `.clear()` also clears up
   * input and output pins.
   * 
   */
  public clear(): this {
    this._inputs.clear();
    this._outputs.clear();

    return super.clear();
  }

  /**
   * 
   * Checks if given input label matches the agent's
   * [signature](https://connective.dev/docs/agent#signature).
   * 
   * Override this to change how validation of input labels occurs.
   * 
   * @param label the input label to be validated
   * 
   */
  protected checkInput(label: string) {
    if (!this.signature.inputs || !this.signature.inputs.includes(label))
      throw new InputNotInSignature(label, this.signature);
  }

  /**
   * 
   * Checks if given output label matches the agent's
   * [signature](https://connective.dev/docs/agent#signature).
   * 
   * Override this to change how validation of output labels occurs.
   * 
   */
  protected checkOutput(label: string) {
    if (!this.signature.outputs.includes(label))
      throw new OutputNotInSignature(label, this.signature);
  }

  /**
   * 
   * Validates given label and creates the corresponding input pin.
   * 
   * Override this to change how an input pin is created.
   * 
   * @param label 
   * @returns the corresponding input pin.
   * 
   */
  protected createInput(label: string): PinLike {
    this.checkInput(label);
    return new Pin();
  }

  /**
   * 
   * Validates given label and creates the corresponding output pin.
   * 
   * Override this to change how an output pin is created.
   * 
   * @param label 
   * @returns the corresponding output pin.
   * 
   */
  protected createOutput(label: string): PinLike {
    this.checkOutput(label);
    return new Pin();
  }

  /**
   * 
   * Override this to specify which pins should be considered as entries of this agent as a `PartialFlow`.
   * You can read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection).
   * If not overriden, the agent will be considered an improper patial flow and an error will be thrown
   * when used as one.
   * 
   */
  protected createEntries(): PinLike[] | Group {
    throw new ImproperPartialFlow(this);
  }

  /**
   * 
   * Override this to specify which pins should be considered as exits of this agent as a `PartialFlow`.
   * You can read more about partial flows [here](https://connective.dev/docs/agent#implicit-connection).
   * If not overriden, the agent will be considered an improper patial flow and an error will be thrown
   * when used as one.
   * 
   */
  protected createExits(): PinLike[] | Group {
    throw new ImproperPartialFlow(this);
  }
}
