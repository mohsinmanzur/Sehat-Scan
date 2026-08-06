const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

const webShims = {
  'react-native-snackbar': path.resolve(__dirname, 'shims/snackbar.web.js'),
  'react-native-date-picker': path.resolve(__dirname, 'shims/date-picker.web.js'),
  'expo-secure-store': path.resolve(__dirname, 'shims/secure-store.web.js'),
};

config.resolver.assetExts.push('wasm');

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === 'web' && webShims[moduleName]) {
    return { type: 'sourceFile', filePath: webShims[moduleName] };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
