import 'mocha';
import should = require('should');

import { BackendClient } from '../src';
import { RemoteTrack } from '../src';
import { SharedState } from '../src';

describe('backend-client', () => {

    it('test-01', () => {
        let sharedState = new SharedState();
        let client = new BackendClient('', new RemoteTrack(sharedState));
    });

});
