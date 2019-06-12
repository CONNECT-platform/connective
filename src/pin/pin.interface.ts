import { Observable } from 'rxjs';


export interface AbstractPin {
  from(pin: AbstractPin): this;
  to(pin: AbstractPin): this;
  clear(): this;

  observable: Observable<any>;
}
