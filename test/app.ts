import 'mocha';
import should = require('should');

import { Application } from '../src';

describe('app', () => {

    it('test-01', () => {
        let app = new Application();
        let client = app.backendClient('/url/v1/test')
        should(client).be.ok();
    });

});
