import 'mocha';
import should = require('should');

import { BaseComponent, IService } from '../src';

describe('base-component', () => {

    it('test-01', () => {
        let comp = new BaseComponent<IService>({});
    });

});
