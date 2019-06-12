import { Observable } from 'rxjs';


export interface PinLike {
  from(pin: PinLike): this;
  to(pin: PinLike): this;
  clear(): this;

  observable: Observable<any>;
}
