const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withNetworkSecurityConfig(config) {
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const src = path.join(config.modRequest.projectRoot, 'network-security-config.xml');
      const destDir = path.join(config.modRequest.platformProjectRoot, 'app/src/main/res/xml');
      const dest = path.join(destDir, 'network_security_config.xml');
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, dest);
      return config;
    },
  ]);

  config = withAndroidManifest(config, (config) => {
    const app = config.modResults.manifest.application[0];
    app.$['android:networkSecurityConfig'] = '@xml/network_security_config';
    return config;
  });

  return config;
};