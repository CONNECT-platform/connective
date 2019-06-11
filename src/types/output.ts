import { Observable } from 'rxjs';


export interface Output {
  send(data: any): void;
  observable: Observable<any>;
}
