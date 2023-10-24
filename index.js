const { Engine } = require("json-rules-engine");
const { config: issuanceConfig } = require("./rules-config/issuance.config");

/**
 * Setup a new engine
 */
let engine = new Engine();

let facts = {
    orgDid: "def4567",
    schemaId: "schemaY",
    issuanceConfig: issuanceConfig
};

let issuanceRule = {
  conditions: {
    any: [
    //   {
    //     fact: "isSchemaAllowedForOrg",
    //     operator: "equal",
    //     value: false,
    //   },
      {
        fact: "issuanceConfig",
        operator: "doesNotContain",
        value: facts.schemaId,
        path: `$.${facts.orgDid}`
      },
      {
        fact: "issuanceConfig",
        operator: "equal",
        value: undefined,
        path: `$.${facts.orgDid}`,
      }
    ],
  },
  event: {
    type: 'schemaNotAllowedForOrg',
    params: {
        message: 'does not have the permission to use schemaId'
    }
  }
};

// //Checker function here
// function checkOrgAllowedSchema(orgDid, schemaId) {
//   return issuanceConfig[orgDid] != undefined
//     ? issuanceConfig[orgDid].some((data) => data == schemaId)
//     : false;
// }

/**
 * Simulate API call here
 */
// engine.addFact('isSchemaAllowedForOrg', async function (params, almanac) {
//     // console.log("almanac is: ", almanac);
//     const orgDid = await almanac.factValue('orgDid');
//     const schemaId = await almanac.factValue('schemaId');
//     return checkOrgAllowedSchema(orgDid, schemaId);
//     // return almanac.factValue('orgDid')
//     // .then(orgDid => {
//     //     return checkOrgAllowedSchema(orgDid, schemaId)
//     // })
// })

engine.addRule(issuanceRule);

// Run the engine to evaluate
engine.run(facts).then(({ events }) => {
  events.map((event) => console.log(
    `The issuance was blocked as orgDid ${facts.orgDid} ${event.params.message} ${facts.schemaId}`
  ));
});
