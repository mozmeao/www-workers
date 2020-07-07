/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Start of section to be able to import redirector.js
const fs = require('fs');
const TOML = require('@iarna/toml');

// this line is needed to prevent the eval from blowing up
const header = 'function addEventListener() {}; ';
const footer = ' exports.workerPaths = workerPaths; ';
const body = fs.readFileSync('./workers/redirector.js');
var workerPaths = eval(header + body + footer);
// End of redirector.js import

const tomlConfigFile = fs.readFileSync('./wrangler.toml');
var tomlObj = TOML.parse(tomlConfigFile);


if (workerPaths['staging'].length > 0 ) {
    tomlObj['env']['staging']['routes'] = workerPaths['staging'];
    tomlObj['env']['staging']['workers_dev'] = false;
} else {
    tomlObj['env']['staging']['workers_dev'] = true;
    delete tomlObj['env']['staging']['routes'];
}

if (workerPaths['prod'].length > 0 ) {
    tomlObj['env']['prod']['routes'] = workerPaths['prod'];
    tomlObj['env']['prod']['workers_dev'] = false;
} else {
    tomlObj['env']['prod']['workers_dev'] = true;
    delete tomlObj['env']['prod']['routes'];
}

// Write routes out to wrangler.toml
fs.writeFileSync('./wrangler.toml', TOML.stringify(tomlObj));

console.log('done building the custom routes!');

