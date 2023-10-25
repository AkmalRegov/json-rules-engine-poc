const { Engine } = require("json-rules-engine");
const prompt = require('prompt-sync')();
const { config: issuanceConfig } = require("./rules-config/issuance.config");

/**
 * Setup a new engine
 */
let engine = new Engine();

let facts = {
  issuanceConfig: issuanceConfig,
};

// facts.orgDid = prompt("orgDid: ");
// facts.schemaId = prompt("schemaId: ");

let issuanceRule = {
  conditions: {
    any: [
      {
        fact: "schemaId",
        operator: "notIn",
        value: {
          fact: "allowedSchema"
        },
      },
    ],
  },
  event: {
    type: "schemaNotAllowedForOrg",
    params: {
      message: "does not have the permission to use schemaId",
    },
  }
};

/**
 * Simulate API call here
 */
engine.addFact('orgDid', async function (params, almanac) {
    return await getOrgDid();
})

engine.addFact('schemaId', async function (params, alamnac) {
  return await getSchemaId();
})

engine.addFact('allowedSchema', async function (params, almanac) {
  const orgDid = await almanac.factValue('orgDid');
  const issuanceConfig = await almanac.factValue('issuanceConfig');
  return await issuanceConfig[orgDid] != undefined ? issuanceConfig[orgDid] : false;
})

engine.addRule(issuanceRule);
engine.on("success", async (event, almanac, ruleResult) => {
  if (event.type == "schemaNotAllowedForOrg") {
    const orgDid = await almanac.factValue("orgDid");
    const schemaId = await almanac.factValue("schemaId");
    console.log(
      `The issuance was blocked as orgDid ${orgDid} ${event.params.message} ${schemaId}`,
    );
  }
});

engine.on("failure", async (event, almanac, ruleResult) => {
  if(event.type == "schemaNotAllowedForOrg") {
    const orgDid = await almanac.factValue("orgDid");
    const schemaId = await almanac.factValue("schemaId");
    console.log(`valid issuance for orgDid ${orgDid} to issue using schemaId ${schemaId}`);
  }
})

async function getOrgDid() {
  return await new Promise((resolve, reject) => {
    let result = prompt("orgDid: ");
    // const result = "def456";
    resolve(result);
  })
}

async function getSchemaId() {
  return await new Promise((resolve, reject) => {
    let result = prompt("schemaId: ");
    // const result = "schemaY";
    resolve(result);
  })
}

async function main() {
  console.log(facts);
  engine.run(facts);
}
main();
