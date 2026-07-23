const { getDefaultConfig } = require('expo/metro-config');

// Fix for EXPO_ROUTER_APP_ROOT being set to an absolute path by Expo CLI in some environments.
// require.context keys must be relative ("./index.tsx") to match the regex in expo-router/_ctx.js.
process.env.EXPO_ROUTER_APP_ROOT = '../../app';
console.log('DEBUG metro.config.js: EXPO_ROUTER_APP_ROOT set to', process.env.EXPO_ROUTER_APP_ROOT);

module.exports = getDefaultConfig(__dirname);
