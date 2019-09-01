import { map, share } from 'rxjs/operators';

import emission from '../shared/emission';

import { Pipe } from './pipe';


const _ForkTagChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_';
const _DefaultForkTagLength = 10;


/**
 * 
 * Represents [fork](https://connective.dev/docs/fork) pins.
 * 
 */
export class Fork extends Pipe {
  constructor(len: number = _DefaultForkTagLength) {
    super([
      map(e => {
        let __fork = <string[]>[].concat(e.context.__fork || []);
        __fork.push(Fork._create_fork_tag(len));
        return emission(e.value, Object.assign({}, e.context, { __fork }));
      }),
      share(),
    ])
  }

  private static _create_fork_tag(len: number = _DefaultForkTagLength): string {
    let res = '';
    for (let i = 0; i < len; i++)
      res += _ForkTagChars[Math.floor(Math.random() * _ForkTagChars.length)];
    return res;
  }
}


/**
 * 
 * Creates a [fork](https://connective.dev/docs/fork) pin.
 * [Checkout the docs](https://connective.dev/docs/fork) for examples and further information.
 * 
 * @param len the length of the fork-tag that will be added to the context of each emission.
 * 
 */
export function fork(len: number = _DefaultForkTagLength) { return new Fork(len); }


export default fork;
