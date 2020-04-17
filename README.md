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

You should also check that the paths we're going to configure the workers to is accurate.  Given the 'targetPath's from experimentPages, make sure all of them match the patterns in workerPaths. In general, make sure that there are `allizom.org` paths for staging, and `mozilla.org` for prod with paths that either have a wildcard in the last element of the path (or the one path you want to modify explicitly spelled out). In this example, `/new/` becomes `/*`, which is correct.  To target just /firefox 'https://www.allizom.org/en-US/firefox/' is correct.

Paths here should fully include the experiments, as tightly as possible. Too broad will lead to more worker calls than necessary.  Too narrow will make the experiments not work.

```javascript
const workerPaths = { // eslint-disable-line no-unused-vars
    'staging': ['https://www.allizom.org/en-US/firefox/*'],
    'prod': ['https://www.mozilla.org/en-US/firefox/*']
};
```

## Turning off a worker

To temporarily turn off a worker, you'll need to do two steps.

1. in `redirector.js` set the workerPaths to an empty array (`[]`)
1. in the wrangler.toml, add `workers_dev=true` to the correct section (staging or prod).

By doing these steps, real paths for allizom/mozilla.org will no longer hit the worker.  The worker will still exist, but only be accessible at a special cloudflare dev domain.

To delete entirely:
1. remove the section from `wrangler.toml`
1. update `bin/get_data.js` to not put paths into wrangler (look for line like `tomlObj['env']['staging']['routes']`)
1. ensure the `workerPaths` object doesn't have the 'staging'/'prod' section.
1. update `redirector-test.js` to not fail
1. manually or with wrangler delete the worker.

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
