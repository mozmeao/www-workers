const fs = require('fs')
const process = require('process')
const TOML = require('@iarna/toml')

const header = 'function addEventListener() {}; ';
const footer = ' exports.experimentPages = experimentPages; ';
const body = fs.readFileSync('./workers/redirector.js');
var experimentPages = eval(header + body + footer);

const stage_domain = "https://www.allizom.org"
const prod_domain = "https://www.mozilla.org"
var stage_routes = []
var prod_routes = []

const toml_config_file = fs.readFileSync('./wrangler.toml');
const toml_obj = TOML.parse(toml_config_file)

// Validate the data
function pageValidate(page) {
    // Check all the correct attributes are present
    if (!('targetPath' in page)) { process.exit(1); }
    if (!('sandboxPath' in page)) { process.exit(1); }
    if (!('sampleRate' in page)) { process.exit(1); }

    // Simple validation of our assumption paths start and end with slashes
    if ( !(page.targetPath.startsWith('/')) ) { process.exit(1); }

    if ( !(page.sandboxPath.startsWith('/')) ) { process.exit(1); }

    // check that they're not the same, as that seems like a common mistake to make
    if ( page.sandboxPath == page.targetPath ) { process.exit(1); }

    // check the sample rate is between 0 and 1.
    if (page.sampleRate < 0) { process.exit(1); }
    if (page.sampleRate > 1) { process.exit(1); }
}

function buildRoutes(page) {
    stage_routes.push(stage_domain + page.targetPath + '*')
    prod_routes.push(prod_domain + page.targetPath + '*')
}

experimentPages.forEach (
  element => pageValidate(element)
)

// Assemble Routes

experimentPages.forEach (
  element => buildRoutes(element)
)

toml_obj['env']['staging']['routes'] = stage_routes
toml_obj['env']['prod']['routes'] = prod_routes

// Write routes out to wrangler.toml
fs.writeFileSync('./wrangler.toml', TOML.stringify(toml_obj))

console.log("done building the custom routes!")

