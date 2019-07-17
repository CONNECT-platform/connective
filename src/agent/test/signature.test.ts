import { should } from 'chai'; should();

import { isSignature } from '../signature';


describe('isSignature()', () => {
  it('should be true for stuff that are signatures and false for whatever else.', () => {
    isSignature({inputs: [], outputs: []}).should.be.true;
    isSignature({inputs: 2, outputs: []}).should.be.false;
    isSignature({outputs: []}).should.be.true;
    isSignature('hellow').should.be.false;
    isSignature(undefined).should.be.false;
  });
});
