import 'mocha';
import should = require('should');

import { Promise } from 'the-promise';

import { SharedState } from '../src';

describe('shared-state', () => {

    it('test-set', () => {
        let sharedState = new SharedState();
        sharedState.set('aaa', 'bbb');

        let value = sharedState.get('aaa');
        should(value).be.equal('bbb');
    });

    it('test-key-subscribe', () => {
        let sharedState = new SharedState();
        sharedState.set('aaa', 'bbb');

        let stage : number = 1;
        let stage1Passed : boolean = false;
        let stage2Passed : boolean = false;

        return Promise.resolve()
            .then(() => {

                sharedState.subscribe('aaa', (value) => {
                    if (stage === 1) {
                        should(value).be.equal('bbb');
                        stage1Passed = true;
                    }
                    if (stage === 2) {
                        should(value).be.equal('ccc');
                        stage2Passed = true;
                    }
                })

            })
            .then(() => Promise.timeout(100))
            .then(() => {
                should(stage1Passed).be.true();
            })
            .then(() => {
                stage = 2;
                sharedState.set('aaa', 'ccc');
            })
            .then(() => Promise.timeout(100))
            .then(() => {
                should(stage2Passed).be.true();
            });

    });


    it('test-global-subscribe', () => {
        let sharedState = new SharedState();
        sharedState.set('aaa', 'bbb');

        let stage : number = 1;
        let stage1Passed : boolean = false;
        let stage2Passed : boolean = false;

        return Promise.resolve()
            .then(() => {

                sharedState.onChange(() => {
                    if (stage === 1) {
                        stage1Passed = true;
                    }
                    if (stage === 2) {
                        stage2Passed = true;
                    }
                })

            })
            .then(() => Promise.timeout(100))
            .then(() => {
                should(stage1Passed).be.true();
            })
            .then(() => {
                stage = 2;
                sharedState.set('aaa', 'ccc');
            })
            .then(() => Promise.timeout(100))
            .then(() => {
                should(stage2Passed).be.true();
                should(sharedState.keys).be.eql(['aaa'])
            })
            ;

    });
});
