import { registerRootComponent } from 'expo';
import App from './App';

// Standard Expo entry: registerRootComponent bridges the app into React
// Native's AppRegistry on every platform (iOS, Android, web). Without this the
// bundle only defines components but never mounts them.
registerRootComponent(App);