import 'mocha';
import should = require('should');
import React, { useEffect } from 'react';

import { IService } from '../src';

import { useService, useSharedState, subscribeToSharedState } from '../src';

describe('function-component', () => {

    it('use-service', () => {
        
        // const ComponentExample => () => {
        //     useService<DiagramService>({ kind: 'diagram' }, (service) => {
        //         service.doSomething();
        //     })
        // }
        
    });

    it('use-shared-state', () => {
        
        // const ComponentExample => () => {
        //     useSharedState((sharedState) => {
        //         sharedState.set('foo', 'bar');
        //     })
        // }
        
    });

    it('use-shared-state', () => {
        
        // const ComponentExample => () => {
        //     subscribeToSharedState('foo', foo => {

        //     })
        // }
        
    });

});

interface DiagramService extends IService
{
    doSomething() : void;
}


