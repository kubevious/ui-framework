import 'mocha';
import should = require('should');

import { Application } from '../src';

describe('app', () => {

    it('test-01', () => {
        let app = new Application();
        app.initHttpClient()
        let client = app.httpClient('/url/v1/test')
        should(client).be.ok();
    });

});
