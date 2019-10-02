/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const expect = require('chai').expect;
const sinon = require('sinon');


before(async function () {
    context = new (require('@dollarshaveclub/cloudworker'))(require('fs').readFileSync('workers/redirector.js', 'utf8')).context;
    global.Request = context.Request
    global.URL = context.URL
    global.handleRequest = context.handleRequest;
});

describe('Redirector Worker', function() {

    it('returns a 200 for requests that have a matching response, but are not within sample rate', async function () {
        Math.random = sinon.stub().returns(0.6534);
        const url = new URL('https://www-dev.allizom.org/en-US/firefox/new/');
        const req = new Request(url);
        const res = await handleRequest(req);
        expect(res.status).to.equal(200);
        expect(res.url).to.equal('https://www-dev.allizom.org/en-US/firefox/new/');
    });

    it('returns a 302 for requests that have a matching response, and are within sample rate', async function () {
        Math.random = sinon.stub().returns(0.4567);
        const url = new URL('https://www-dev.allizom.org/en-US/firefox/new/');
        const req = new Request(url);
        const res = await handleRequest(req);
        expect(res.status).to.equal(302);
        expect(res.headers.get('location')).to.equal('https://www-dev.allizom.org/en-US/exp/firefox/new/');
    });

    it('returns a 200 if the request does not have a matching redirect', async function() {
        const url = new URL('https://www-dev.allizom.org/en-US/firefox/');
        const req = new Request(url);
        const res = await handleRequest(req);
        expect(res.status).to.equal(200);
        expect(res.url).to.equal('https://www-dev.allizom.org/en-US/firefox/');
    });
});

