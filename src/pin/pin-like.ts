import { Observable } from 'rxjs';


export interface PinLike {
  from(...pins: PinLike[]): this;
  to(...pins: PinLike[]): this;
  clear(): this;

  observable: Observable<any>;
}
