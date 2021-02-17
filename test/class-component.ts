import 'mocha';
import should = require('should');

import { ClassComponent, IService } from '../src';

describe('class-component', () => {

    it('test-01', () => {
        let comp = new ClassComponent<{}, {}, IService>({});
    });

});
