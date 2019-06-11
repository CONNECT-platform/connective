import { Observable, Subscription } from 'rxjs';


export interface Input {
  receive(data: any): void;
  connect(output: Output): Subscription;

  observable: Observable<any>;
}

export interface Output {
  send(data: any): void;
  connect(input: Input): Subscription;

  observable: Observable<any>;
}
