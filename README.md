# www-workers

Cloudflare Workers for www.mozilla.org

## Install

First make sure you have [Node](https://nodejs.org/) and [Yarn](https://yarnpkg.com/) installed. Then run:

```
yarn
```

## Test

To run unit tests:

```
npm test
```

## Redirector configuration

To configure a redirect, add an object to the `experimentPages` array in `workers/redirector.js`:

```javascript
const experimentPages = [
    {
        'targetPath': `/en-US/firefox/new/`,
        'sandboxPath': `/en-US/exp/firefox/new/`,
        'sampleRate': 0.09
    }
];
```

You should also check that the paths we're going to configure the workers to is accurate.  Given the 'targetPath's from experimentPages, make sure all of them match the patterns in workerPaths. In general, make sure that there is an allizom.org for staging, and a mozilla.org for prod with paths that have a wildcard in the last element of the path. In this example, `/new/` becomes `/*`, which is correct.

Paths here should fully include the experiments, as tightly as possible. Too broad will lead to more worker calls than necessary.  Too narrow will make the experiments not work.

```javascript
const workerPaths = { // eslint-disable-line no-unused-vars
    'staging': ['https://www.allizom.org/en-US/firefox/*'],
    'prod': ['https://www.mozilla.org/en-US/firefox/*']
};
```

## Wrangler configuration

As part of the yarn install process, configured as a postinstall step in package.json, we are running a script in bin/get_data.js that will read the experimentPages block from redirector.js, and do some light validation, then write out to wrangler.toml the paths we want to end up hitting redirector.js.  The domains are hardcoded in that file, so if that changes for whatever reason, you'll need to update that file.

## Deployment Process

The pipeline runs docker containers, and is defined fully in .gitlab-ci.yml, referencing a shared library at github.com's mozmeao/gitlab-library/javascript.yml .

Our pipeline runs eslint during a lint phase.
Then builds (`yarn`) the package, and saves node_modules as an artifact.
Then runs `npm test`.
To deploy we run `wrangler publish`, setting the credentials as environment variables (API token, zone_id, account_id)
Then, if this is the 'stage' branch, will deploy to staging (allizom.org).
If the branch is prod, it'll deploy to prod (mozilla.org).
