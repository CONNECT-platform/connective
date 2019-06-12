import { zip } from 'rxjs';

import { Pin } from './pin';


export class Control extends Pin {
  protected resolveInbound(inbound: Pin[]) {
    return zip(...inbound.map(pin => pin.observable));
  }
}
