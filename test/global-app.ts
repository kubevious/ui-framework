import 'mocha';
import should = require('should');

import { app } from '../src';

describe('global-app', () => {

    it('test-01', () => {
        should(app).be.ok();
    });

});
