import 'mocha';
import should = require('should');

import { SharedState } from '../src';

describe('shared-state', () => {

    it('test-01', () => {
        let sharedState = new SharedState();
        sharedState.set('aaa', 'bbb');

        let value = sharedState.get('aaa');
        should(value).be.equal('bbb');
    });

});
