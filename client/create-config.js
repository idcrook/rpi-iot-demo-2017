

var jsonfile = require('jsonfile');

var configFile = './client-config.json';

var config = {
  mqttBrokerHost: 'rpit5.local'
};

jsonfile.writeFile(configFile, config, {spaces: 2}, function(err) {
  if (err !== null) {
    console.error(err);
  }
  console.log(`Wrote file "${configFile}"`);
});
