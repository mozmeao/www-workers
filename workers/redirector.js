/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * This is a custom URL redirector implemented as a CloudFlare Worker.
 * The role of the worker is to redirect a predefined % of traffic
 * to a different URL (used for A/B testing).
 * API documentation can be found at https://developers.cloudflare.com/workers/
 */

/**
 * `targetPath` is the target pathname that the worker looks to match against.
 * `sandboxPath` is the sandbox experiment pathname to redirect to.
 * `sampleRate` is the proporation of traffic that should be redirected (a value of 0.1 equates to 10%).
 */
const experimentPages = [
    {
        'targetPath': `/en-US/firefox/new/`,
        'sandboxPath': `/en-US/exp/firefox/new/`,
        'sampleRate': 0.08
    },
    {
        'targetPath': `/en-US/firefox/`,
        'sandboxPath': `/en-US/exp/firefox/`,
        'sampleRate': 0.24
    }
];

function isWithinSampleRate(SAMPLE_RATE) {
    return Math.random() < SAMPLE_RATE;
}

async function handleRequest(request) {
    // Get the current request URL.
    const requestURL = new URL(request.url);

    // Split out search params from the origin and pathname.
    const origin = requestURL.origin;
    const pathname = requestURL.pathname;
    const search = requestURL.search;

    // Check to see if the URL matches a route.
    const match = experimentPages.filter(page => pathname === page.targetPath);

    if (match.length > 0) {
        // Assume only the first match found will be processed.
        const sandbox = match[0];

        // Get the experimental URL to redirect to.
        const experimentURL = search ? `${origin}${sandbox.sandboxPath}${search}` : `${origin}${sandbox.sandboxPath}`;

        // Only redirect a pre-defined % of requests per-page.
        if (experimentURL && isWithinSampleRate(sandbox.sampleRate)) {
            return Response.redirect(experimentURL, 302);
        }
    }

    // Fetch the original request if no redirect was fulfilled.
    return await fetch(request);
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
});
