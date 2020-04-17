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
 * `experimentPages` is an Array `[]` of Objects `{}` with the following key/value pairs:
 * - `targetPath` is the target pathname that the worker looks to match against (e.g. `/en-US/firefox/new/`).
 * - `sandboxPath` is the sandbox experiment pathname to redirect to e.g. (`/en-US/exp/firefox/new/`).
 * - `sampleRate` is the proporation of traffic that should be redirected (a value of 0.1 equates to 10%).
 */
const experimentPages = [
    {
        'targetPath': `/en-US/firefox/`,
        'sandboxPath': `/en-US/exp/firefox/`,
        'sampleRate': 0.30
    }
];

/**
 * `workerpaths` is an hash with a configuration for staging, and for prod, with a list of paths
 *  we should direct traffic to the worker. If you need to add a new environment, make sure to update bin/get_data.js,
 *  and .gitlab-ci.yml.
 *  This hash should be kept in sync with the experiment pages object above.
 * @type {{prod: [string], staging: [string]}}
 */

const workerPaths = {
    'staging': ['https://www.allizom.org/en-US/firefox/*'],
    'prod': ['https://www.mozilla.org/en-US/firefox/*']
};


function getData() { // eslint-disable-line no-unused-vars
    const data = {
        'experimentPages': experimentPages,
        'workerPaths' : workerPaths
    };
    return data;
}

function isWithinSampleRate(SAMPLE_RATE) {
    return Math.random() < SAMPLE_RATE;
}

async function handleRequest(request, experimentPages) {
    // Get the current request URL.
    const requestURL = new URL(request.url);

    // Split out search params from the origin and pathname.
    const origin = requestURL.origin;
    const pathname = requestURL.pathname;
    const search = requestURL.search;

    // If there are no experimentPages configured then return the original request.
    if (!experimentPages || experimentPages.length === 0) {
        return await fetch(request);
    }

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
    event.respondWith(handleRequest(event.request, experimentPages));
});
