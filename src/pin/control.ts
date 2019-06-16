import { zip } from 'rxjs';

import { Pin } from './pin';


export class Control extends Pin {
  protected resolve(inbound: Pin[]) {
    return zip(...inbound.map(pin => pin.observable));
  }
}
