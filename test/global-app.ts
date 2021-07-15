import 'mocha';
import should = require('should');

import { app } from '../src';

describe('global-app', () => {

    it('test-01', () => {
        should(app).be.ok();
        
        app.initHttpClient()
        let client = app.httpClient('/url/v1/test')
        should(client).be.ok();
    });

});
