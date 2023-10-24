const { Engine } = require("json-rules-engine");
const { config: issuanceConfig } = require("./rules-config/issuance.config");

/**
 * Setup a new engine
 */
let engine = new Engine();

let issuanceRule = {
  conditions: {
    all: [
      {
        fact: "isSchemaAllowedForOrg",
        operator: "equal",
        value: false,
      },
    ],
  },
  event: {
    type: 'schemaNotAllowedForOrg',
    params: {
        message: 'does not have the permission to use schemaId'
    }
  }
};

function checkOrgAllowedSchema(orgDid, schemaId) {
  return issuanceConfig[orgDid] != undefined
    ? issuanceConfig[orgDid].some((data) => data == schemaId)
    : false;
}

engine.addRule(issuanceRule);

engine.addFact('isSchemaAllowedForOrg', async function (params, almanac) {
    // console.log("almanac is: ", almanac);
    const orgDid = await almanac.factValue('orgDid');
    const schemaId = await almanac.factValue('schemaId');
    return checkOrgAllowedSchema(orgDid, schemaId);
    // return almanac.factValue('orgDid')
    // .then(orgDid => {
    //     return checkOrgAllowedSchema(orgDid, schemaId)
    // })
})

let facts = {
    orgDid: "def456",
    schemaId: "schemaX",
};

// Run the engine to evaluate
engine.run(facts).then(({ events }) => {
  events.map((event) => console.log(
    `The issuance was blocked as orgDid ${facts.orgDid} ${event.params.message} ${facts.schemaId}`
  ));
});
