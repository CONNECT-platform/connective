import { tap } from 'rxjs/operators';

import { Emission, MergedEmissionContextVal } from '../shared/emission';

import group from '../pin/group';
import pin from '../pin/pin';
import { Source } from '../pin/source';
import { block } from '../pin/filter';
import pipe from '../pin/pipe';

import { Agent } from './agent';


type _CacheType = {[key: string]: Emission};

/**
 *
 * Represents [join](https://connective.dev/docs/join) agents.
 *
 */
export class Join extends Agent {
  private _inject: Source;
  private _cache: {[fork: string]: _CacheType} = {};

  /**
   *
   * @param keys the keys of the joined object
   * @param pop should it pop the fork tag or not? Default is `true`
   *
   */
  constructor(readonly keys: string[], readonly pop = true) {
    super({
      inputs: keys,
      outputs: ['output']
    });

    this._inject = new Source();
  }

  private _receive(key: string, emission: Emission) {
    if (emission.context.__fork) {
      if (emission.context.__fork instanceof MergedEmissionContextVal)
        emission.context.__fork.values.forEach(v => this._fill(v, key, emission));
      else this._fill(emission.context.__fork, key, emission);
    }
    else
      this._fill([], key, emission);
  }

  private _cache_key(fork: string[]) { return fork.join(';') }

  private _fill(fork: string[], key: string, emission: Emission) {
    let _fork = this._cache_key(fork);
    let _cache = this._cache[_fork] = this._cache[_fork] || {};
    _cache[key] = emission;

    if (this._complete(_cache))
      this._emit(_cache, fork);
  }

  private _emit(cache: _CacheType, fork: string[]) {
    delete this._cache[this._cache_key(fork)];

    let emission = Emission.from(
      Object.values(cache),
      Object.entries(cache).reduce((obj, entry) => {
        obj[entry[0]] = entry[1].value;
        return obj;
      }, <{[key: string]: any}>{})
    );

    emission.context.__fork = this.pop?fork.slice(0, -1):[...fork];
    this._inject.emit(emission);
  }

  private _complete(cache: _CacheType): boolean {
    return Object.values(cache).length == this.keys.length;
  }

  protected createOutput(label: string) {
    this.checkOutput(label);
    return group(
      group(...this.keys.map(key => this.in(key).to(pipe(tap(e => this._receive(key, e)))))).to(block()),
      this._inject
    ).to(pin());
  }

  protected createEntries() { return this.keys.map(key => this.in(key)); }
  protected createExits() { return [this.output] }

  /**
   *
   * Shortcut for `.out('output')`, which will emit the joined object.
   * [Read this](https://connective.dev/docs/handle-error#signature) for more details.
   *
   */
  public get output() { return this.out('output'); }

  public clear() {
    this._inject.clear();
    this._cache = {};
    return this;
  }
}


/**
 *
 * Creates a [join](https://connective.dev/docs/join) agent. Join agents
 * will re-join values created from the same forked emission in parallel, creating
 * a joined object with given keys.
 * [Checkout the docs](https://connective.dev/docs/join) for examples and further information.
 *
 * @param keys the keys of the joined object. An input will be created per key.
 *
 */
export function join(...keys: string[]) { return new Join(keys); }

/**
 *
 * Creates a [join](https://connective.dev/join) agent that does not pop
 * the fork tag upon joining.
 * [Checkout the docs](https://connective.dev/docs/join) for examples and further information.
 *
 * @param keys the keys of the joined object. An input will be created per key.
 */
export function peekJoin(...keys: string[]) { return new Join(keys, false); }


export default join;
