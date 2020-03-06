/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const expect = require('chai').expect;
const sinon = require('sinon');


before(async function () {
    const context = new (require('@dollarshaveclub/cloudworker'))(require('fs').readFileSync('workers/redirector.js', 'utf8')).context;
    global.Request = context.Request
    global.URL = context.URL
    global.handleRequest = context.handleRequest;
});

describe('Redirector Worker', function() {

    it('should return a 200 for requests that have a matching response, but are not within sample rate', async function () {
        Math.random = sinon.stub().returns(0.8534);
        const url = new URL('https://bedrock-stage.gcp.moz.works/en-US/firefox/new/');
        const req = new Request(url);
        const res = await global.handleRequest(req);
        expect(res.status).to.equal(200);
        expect(res.url).to.equal('https://bedrock-stage.gcp.moz.works/en-US/firefox/new/');
    });

    it('should return a 302 for requests that have a matching response, and are within sample rate', async function () {
        Math.random = sinon.stub().returns(0.0001);
        const url = new URL('https://bedrock-stage.gcp.moz.works/en-US/firefox/new/');
        const req = new Request(url);
        const res = await global.handleRequest(req);
        expect(res.status).to.equal(302);
        expect(res.headers.get('location')).to.equal('https://bedrock-stage.gcp.moz.works/en-US/exp/firefox/new/');
    });

    it('should preserve query string parameters when redirecting the URL', async function() {
        Math.random = sinon.stub().returns(0.0001);
        const url = new URL('https://bedrock-stage.gcp.moz.works/en-US/firefox/new/?foo=bar');
        const req = new Request(url);
        const res = await global.handleRequest(req);
        expect(res.status).to.equal(302);
        expect(res.headers.get('location')).to.equal('https://bedrock-stage.gcp.moz.works/en-US/exp/firefox/new/?foo=bar');
    });

    it('should return a 200 if the request does not have a matching redirect', async function() {
        const url = new URL('https://bedrock-stage.gcp.moz.works/en-US/firefox/browsers/');
        const req = new Request(url);
        const res = await global.handleRequest(req);
        expect(res.status).to.equal(200);
        expect(res.url).to.equal('https://bedrock-stage.gcp.moz.works/en-US/firefox/browsers/');
    });
});

