import { Observable } from 'rxjs';


export interface Input {
  receive(data: any): void;
  observable: Observable<any>;
}
