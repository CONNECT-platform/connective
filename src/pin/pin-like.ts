import { Observable, PartialObserver, Subscription } from 'rxjs';

import { Emission } from '../shared/emission';
import { Clearable } from '../shared/clearable';


export interface PinLike extends Clearable {
  from(...pins: PinLike[]): PinLike;
  to(...pins: PinLike[]): PinLike;

  observable: Observable<Emission>;

  subscribe(observer?: PartialObserver<any>): Subscription;
  subscribe(next?: (value: any) => void, error?: (error: any) => void, complete?: () => void): Subscription;
}
