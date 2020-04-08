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
