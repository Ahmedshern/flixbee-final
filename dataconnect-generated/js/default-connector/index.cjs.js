const { getDataConnect, validateArgs } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'default',
  service: 'Buzzplay',
  location: 'us-central1'
};
exports.connectorConfig = connectorConfig;

