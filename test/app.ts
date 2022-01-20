import 'mocha';
import should = require('should');

import { Application } from '../src';

describe('app', () => {

    it('test-01', () => {
        const app = new Application();

        app.initHttpClient({})
        const client1 = app.httpClient({}, '/url/v1/test')
        should(client1).be.ok();

        app.initHttpClient({ foo: 'bar' })
        const client2 = app.httpClient({ foo: 'bar' }, '/url/v2/test')
        should(client2).be.ok();

    });

});
