/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */


const fs = require('fs');
const TOML = require('@iarna/toml');

const header = 'function addEventListener() {}; ';
const footer = ' exports.experimentPages = experimentPages; ';
const body = fs.readFileSync('./workers/redirector.js');
var experimentPages = eval(header + body + footer);

const stageDomain = 'https://www.allizom.org';
const prodDomain = 'https://www.mozilla.org';
var stageRoutes = [];
var prodRoutes = [];

const tomlConfigFile = fs.readFileSync('./wrangler.toml');
const tomlObj = TOML.parse(tomlConfigFile);

// Validate the data
// move these to the test file
// function pageValidate(page) {
//     // Check all the correct attributes are present
//     if (!('targetPath' in page)) { process.exit(1); }
//     if (!('sandboxPath' in page)) { process.exit(1); }
//     if (!('sampleRate' in page)) { process.exit(1); }
//
//     // Simple validation of our assumption paths start and end with slashes
//     if ( !(page.targetPath.startsWith('/')) ) { process.exit(1); }
//
//     if ( !(page.sandboxPath.startsWith('/')) ) { process.exit(1); }
//
//     // check that they're not the same, as that seems like a common mistake to make
//     if ( page.sandboxPath == page.targetPath ) { process.exit(1); }
//
//     // check the sample rate is between 0 and 1.
//     if (page.sampleRate < 0) { process.exit(1); }
//     if (page.sampleRate > 1) { process.exit(1); }
// }

function buildRoutes(page) {
    var stageFullPath = stageDomain + page.workerPath;
    var prodFullPath = stageDomain + page.workerPath;


    if (!(stageRoutes.include(stageFullPath))) {
        stageRoutes.push(stageFullPath);
    }
    if (!(prodRoutes.include(prodFullPath))) {
        prodRoutes.push(prodFullPath);
    }
}

// Assemble Routes

experimentPages.forEach (
  element => buildRoutes(element)
);

tomlObj['env']['staging']['routes'] = stageRoutes;
tomlObj['env']['prod']['routes'] = prodRoutes;

// Write routes out to wrangler.toml
fs.writeFileSync('./wrangler.toml', TOML.stringify(tomlObj));

console.log('done building the custom routes!');

