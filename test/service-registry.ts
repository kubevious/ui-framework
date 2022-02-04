import 'mocha';
import should = require('should');

import { IService, ServiceRegistry, SharedState } from '../src';

describe('service-registry', () => {

    it('test-01', () => {
        const sharedState = new SharedState();
        const svcReg = new ServiceRegistry(sharedState);

        svcReg.registerService({ kind: 'foo' }, ({ info }) => {
            const svc = new TestService();
            console.log(info);
            svc.info = info;
            return svc;
        })

        {
            const mysvc = svcReg.resolveService<TestService>({ kind: 'foo' });
            should(mysvc).be.ok();
            should(mysvc.info).be.eql({ kind: 'foo' });
        }

        {
            const mysvc = svcReg.resolveService<TestService>({ kind: 'foo' });
            should(mysvc).be.ok();
            should(mysvc.info).be.eql({ kind: 'foo' });
        }

    });

    it('test-02', () => {
        const sharedState = new SharedState();
        const svcReg = new ServiceRegistry(sharedState);

        svcReg.registerService<TestService, { kind: string, bar: string }>
            ({ kind: 'foo' }, ({ info }) => {
                const svc = new TestService();
                console.log(info);
                svc.info = info;
                return svc;
            })

        {
            const mysvc = svcReg.resolveService<TestService, { kind: string, bar: string }>
                ({ kind: 'foo', bar: 'bar1' });
            should(mysvc).be.ok();
            should(mysvc.info).be.eql({ kind: 'foo', bar: 'bar1' });
        }

        {
            const mysvc = svcReg.resolveService<TestService, { kind: string, bar: string }>
                ({ kind: 'foo', bar: 'bar2' });
            should(mysvc).be.ok();
            should(mysvc.info).be.eql({ kind: 'foo', bar: 'bar2' });
        }

    });


});


export class TestService implements IService
{
    public info : any;

    close()
    {

    }
}