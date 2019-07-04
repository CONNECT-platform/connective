import { should } from 'chai'; should();

import { Subscription } from 'rxjs';

import { Tracker } from '../tracker';
import { isClearable } from '../clearable';


describe('Tracker', () => {
  it('should be clearable.', () => {
    isClearable(new Tracker()).should.be.true;
  });

  it('should unsubscribe tracked subscriptions when cleared.', done => {
    class T extends Tracker {
      constructor() {
        super();
        this.track(new Subscription(() => done()));
      };
    }

    new T().clear();
  });

  describe('.untrack()', () => {
    it('should remove subscription from tracked subscriptions.', done => {
      class T extends Tracker {
        constructor() {
          super();
          this.track(new Subscription(() => done()));
          //
          // if this does not remove the sub, done() will be called twice.
          //
          this.untrack(this.track(new Subscription(() => done())));
        };
      }

      new T().clear();
    });
  });

  describe('.tracking', () => {
    it('should return true when something is being tracked, false otherwise.', () => {
      class T extends Tracker {
        constructor() {
          super();
          this.tracking.should.be.false;
          this.track(new Subscription());
          this.tracking.should.be.true;
        }
      }

      new T();
    });
  });
});
