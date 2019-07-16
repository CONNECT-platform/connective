import { from, of, Observable } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { Emission } from '../shared/emission';

import { Pipe } from './pipe';


export class Spread extends Pipe {
  constructor() {
    super([
      mergeMap(emission => 
        (emission.value.map)?
        <Observable<Emission>>from(emission.value.map((v: any) => emission.fork(v))):
        of(emission)
      )
    ])
  }
}


export default function() { return new Spread(); }
