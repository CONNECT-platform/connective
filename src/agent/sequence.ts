import { map, share } from 'rxjs/operators';

import { Emission } from '../shared/emission';

import { Control } from '../pin/control';
import { Pin } from '../pin/pin';
import group from '../pin/group';
import _map from '../pin/map';
import filter, { block } from '../pin/filter';
import pipe from '../pin/pipe';

import { Agent } from './agent';


/**
 *
 * Denotes a token specifying an event sequence.
 * Each token can at each step either accept a new emission,
 * and can complete on a list of emissions.
 *
 */
export interface SequenceToken {
  /**
   *
   * Determines whether the token would accept the new incoming emission
   * (i.e. it could still be satisfied in the future if this emission was accepted),
   * based on the emission itself and the list of emissions without the newly arrived emission.
   *
   * @param val the newly arrived emission
   * @param list the already accepted list of emissions
   *
   */
  accepts(val: Emission, list: Emission[]): boolean;

  /**
   *
   * Determines whether the token can be considered completed, i.e.
   * the current list of emissions satisfies its conditions.
   *
   * @param list
   *
   */
  complete(list: Emission[]): boolean;
}


/**
 *
 * Creates a sequence token that denotes events happening between `min` and
 * `max` number of times.
 *
 * @param min the minimum number of times the event should happen
 * @param max the maximum number of times the event should happen
 *
 */
export function range(min: number, max?: number) {
  return <SequenceToken>{
    accepts(_, list) { return max === undefined || list.length < max; },
    complete(list) { return list.length >= min; }
  }
}

/**
 *
 * Creates a sequence token that denotes events happening a
 * specified number of times exactly
 *
 * @param c the number of times the event should happen.
 *
 */
export function count(c: number) { return range(c, c); }

/**
 *
 * Sequence token denoting an event that may or may not happen (multiple times).
 *
 */
export const maybesome = range(0);

/**
 *
 * Sequence token denoting an event that happens at least once.
 *
 */
export const some = range(1);

export type SequenceTokenIndicator = number | '*' | '+' | SequenceToken;


/**
 *
 * Represents [sequence](https://connective.dev/docs/sequence) agents.
 *
 */
export class Sequence extends Agent {
  readonly tokens: SequenceToken[];
  private _control: Control;
  private _relay: Pin;
  public _seq: Emission[][];
  private _head = 0;

  /**
   *
   * @param tokens the tokens denoting the sequence of desired events. Each token must be
   * - A `SequenceToken`,
   * - A number, meaning that an event should happen that number of times exactly,
   * - `'+'` meaning the event should happen at least once,
   * - `'*'` meaning the event may or may not happen one or multiple times.
   *
   */
  constructor(tokens: SequenceTokenIndicator[]) {
    super({inputs: tokens.map((_, index) => index.toString()), outputs: ['out']});

    this._control = new Control();
    this._relay = new Pin();

    this.tokens = tokens.map(t => {
      if (typeof t == 'number') return count(t);
      if (t === '+') return some;
      if (t === '*') return maybesome;
      return t;
    });

    tokens.forEach((_, index) => {
      this.in(index).to(pipe(map(e => {
        this._take(e, index, true);
        return e;
      }))).to(this._relay);
    });

    this.reset();
  }

  private _take(emission: Emission, index: number, retry: boolean = false) {
    if (index == this._head) {
      if (this.tokens[index].accepts(emission, this._seq[index]))
        this._seq[index].push(emission);
      else {
        this.reset();
        if (retry)
          this._take(emission, index);
      }
    }
    else {
      if (index < this._head) {
        this.reset();
        this._take(emission, index);
      }
      else {
        if (this._seek(index))
          this._take(emission, index, retry);
        else {
          this.reset();
          if (this._seek(index))
            this._take(emission, index, retry);
        }
      }
    }
  }

  private _seek(index: number): boolean {
    for (let i = this._head; i < index; i++)
      if (!this.tokens[i].complete(this._seq[i]))
        return false;

    this._head = index;
    return true;
  }

  private get _complete(): boolean {
    return this._seq.every((e, index) => this.tokens[index].complete(e));
  }

  protected reset(): this {
    this._seq = this.tokens.map(_ => []);
    this._head = 0;
    return this;
  }

  protected createOutput(label: string) {
    this.checkOutput(label);
    return group(
      this._control.to(_map(() => this.reset())).to(block()),
      this._relay.to(filter(() => this._complete))
    ).to(pipe(map(() => {
      let _vals = this._seq.map(_comp => (_comp.length==1)?(_comp[0].value):(_comp.map(_ => _.value)));
      let _emission = Emission.from(this._seq.reduce((all, list) => all.concat(list), [])
        , (this.tokens.length == 1)?_vals[0]:_vals);

      return _emission;
    }), share()));
  }

  protected createEntries() { return (this.signature.inputs || []).map(i => this.in(i)) }
  protected createExits() { return [this.output] }

  public clear() {
    this.reset();
    this._control.clear();
    this._relay.clear();
    return super.clear();
  }

  /**
   *
   * Resets the sequence being tracked when receiving emissions
   * on `.control`.
   *
   */
  public get control() { return this._control; }

  /**
   *
   * Shortcut for `.out('out')`, which will emit completed sequences.
   * [Read this](https://connective.dev/docs/sequence#signature) for more details.
   *
   */
  public get output() { return this.out('out'); }
}


/**
 *
 * Creates a [sequence](https://connective.dev/docs/sequence) agent.
 * Sequence agents can determine if a specific sequence of events has occured.
 * [Checkout the docs](https://connective.dev/docs/sequence) for examples and further information.
 *
 * @param tokens the tokens denoting the sequence of desired events. Each token must be
 * - A `SequenceToken`,
 * - A number, meaning that an event should happen that number of times exactly,
 * - `'+'` meaning the event should happen at least once,
 * - `'*'` meaning the event may or may not happen one or multiple times.
 *
 */
export function sequence(...tokens: SequenceTokenIndicator[]) { return new Sequence(tokens); }


export default sequence;
