import ExceptionsManager from 'react-native/Libraries/Core/ExceptionsManager';

if (__DEV__) {
  ExceptionsManager.handleException = (error, isFatal) => {
    // no-op in dev to avoid red screen; remove or log as needed
  };
}

import 'react-native-url-polyfill/auto';
global.Buffer = require('buffer').Buffer;

import 'expo-router/entry';
import { App } from 'expo-router/build/qualified-entry';
import { AppRegistry, LogBox } from 'react-native';

if (__DEV__) {
  LogBox.ignoreAllLogs();
  LogBox.uninstall();
}

AppRegistry.registerComponent('main', () => App);
