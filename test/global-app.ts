import 'mocha';
import should = require('should');

import { app } from '../src';

describe('global-app', () => {

    it('test-01', () => {
        should(app).be.ok();
        
        app.initHttpClient({})
        const client1 = app.httpClient({}, '/url/v1/test')
        should(client1).be.ok();

        app.initHttpClient({ foo: 'bar' })
        const client2 = app.httpClient({ foo: 'bar' }, '/url/v2/test')
        should(client2).be.ok();

    });

});
