import '@expo/metro-runtime';
import React from 'react';
import { renderRootComponent } from 'expo-router/build/renderRootComponent';
import { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import WebApp from './App';

LoadSkiaWeb().then(() => {
  renderRootComponent(WebApp);
});
