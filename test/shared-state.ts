import 'mocha';
import should = require('should');

import { Promise } from 'the-promise';

import { SharedState } from '../src';

describe('shared-state', () => {

    it('test-set', () => {
        const sharedState = new SharedState();
        sharedState.set('aaa', 'bbb');

        const value = sharedState.tryGet('aaa');
        should(value).be.equal('bbb');
    });

    it('test-set-get-01', () => {
        const sharedState = new SharedState();
        sharedState.set('aaa', 'ccc');

        const value = sharedState.get('aaa', 'xxx');
        should(value).be.equal('ccc');
    });

    it('test-set-get-02', () => {
        const sharedState = new SharedState();

        const value = sharedState.get('not-present-key', 'xxx');
        should(value).be.equal('xxx');
    });

    it('test-key-subscribe', () => {
        const sharedState = new SharedState();
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
        const sharedState = new SharedState();
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


    it('test-global-scoped-subscribe', () => {
        const globalSharedState = new SharedState();
        const sharedState = globalSharedState.user();
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


    it('user-flag-01', () => {
        const sharedState = new SharedState();

        let value = sharedState.isUserPresent('needs-something');
        should(value).be.equal(false);

        sharedState.markUserFlag('needs-something', 'a');
        value = sharedState.isUserPresent('needs-something');
        should(value).be.equal(true);

        sharedState.markUserFlag('needs-something', 'b');
        value = sharedState.isUserPresent('needs-something');
        should(value).be.equal(true);

        sharedState.clearUserFlag('needs-something', 'a');
        value = sharedState.isUserPresent('needs-something');
        should(value).be.equal(true);

        sharedState.clearUserFlag('needs-something', 'b');
        value = sharedState.isUserPresent('needs-something');
        should(value).be.equal(false);
    });

});
