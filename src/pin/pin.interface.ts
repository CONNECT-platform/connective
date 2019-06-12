import { Observable } from 'rxjs';


export interface AbstractPin {
  from(pin: AbstractPin): AbstractPin;
  to(pin: AbstractPin): AbstractPin;
  clear(): AbstractPin;

  observable: Observable<any>;
}
