import { Observable, Subscription } from 'rxjs';


export interface Control {
  receive(): void;
  connect(signal: Signal): Subscription;

  observable: Observable<any>;
}

export interface Signal {
  send(): void;
  connect(control: Control): Subscription;

  observable: Observable<any>;
}
