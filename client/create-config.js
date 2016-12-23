

var jsonfile = require('jsonfile');

var configFile = './client-config.json';

var config = {
  mqttBrokerHost: 'rpit5.local',
  expressServerPort: 3000
};

jsonfile.writeFile(configFile, config, {spaces: 2}, function(err) {
  if (err !== null) {
    console.error(err);
  }
  console.log(`Wrote file "${configFile}"`);
});
