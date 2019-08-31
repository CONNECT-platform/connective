import { Observable, PartialObserver, Subscription } from 'rxjs';

import { Emission } from '../shared/emission';
import { Clearable } from '../shared/clearable';


/**
 * 
 * Represents all objects behaving like a [pin](https://connective.dev/docs/pin)
 * 
 */
export interface PinLike extends Clearable {
  from(...pins: PinLike[]): PinLike;
  to(...pins: PinLike[]): PinLike;
  serialFrom(...pins: PinLike[]): PinLike;
  serialTo(...pins: PinLike[]): PinLike;

  observable: Observable<Emission>;

  subscribe(observer?: PartialObserver<any>): Subscription;
  subscribe(next?: (value: any) => void, error?: (error: any) => void, complete?: () => void): Subscription;
}


/**
 * 
 * Checks if a given object satisfies the `PinLike` interface
 * 
 * @param whatever 
 * 
 */
export function isPinLike(whatever: any): whatever is PinLike {
  return whatever !== undefined && (typeof whatever.from == 'function') && (typeof whatever.to == 'function')
      && whatever.observable instanceof Observable &&
      (typeof whatever.subscribe == 'function');
}
