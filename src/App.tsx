import {
  NavigationAction,
  NavigationContainer,
  NavigationState,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import {
  Container,
  useDarkTheme,
  useLightTheme,
  usePresetPalette,
} from 'react-native-chat-room';

import { createStringSetCn, createStringSetEn } from './common';
import type { RootParamsList, RootParamsName } from './routes';
import {
  ChannelListScreen,
  ChatroomScreen,
  LoginScreen,
  SearchMemberScreen,
  SplashScreen,
} from './screens';

const env = require('./env');

const Root = createNativeStackNavigator<RootParamsList>();

export function App() {
  const [initialRouteName] = React.useState('Login' as RootParamsName);
  const palette = usePresetPalette();
  const dark = useDarkTheme(palette);
  const light = useLightTheme(palette);
  const [theme, setTheme] = React.useState(light);
  const isNavigationReadyRef = React.useRef(false);
  const isContainerReadyRef = React.useRef(false);
  // const [isReady, setIsReady] = React.useState(false);
  const navigationRef = useNavigationContainerRef<RootParamsList>();
  const isReadyRef = React.useRef(false);

  const formatNavigationState = (
    state: NavigationState | undefined,
    result: string[] & string[][]
  ) => {
    if (state) {
      const ret: string[] & string[][] = [];
      for (const route of state.routes) {
        ret.push(route.name);
        if (route.state) {
          formatNavigationState(
            route.state as NavigationState | undefined,
            ret
          );
        }
      }
      result.push(ret);
    }
  };

  React.useEffect(() => {
    const ret = DeviceEventEmitter.addListener('example_change_theme', (e) => {
      if (e === 'dark') {
        setTheme(dark);
      } else {
        setTheme(light);
      }
    });
    return () => {
      ret.remove();
    };
  }, [dark, light]);

  const onReady = async (_isReady: boolean) => {
    // setTimeout(() => {
    //   setIsReady(isReady);
    // }, 1000);
    // setIsReady(isReady);
    if (isReadyRef.current === true) {
      return;
    }
    isReadyRef.current = true;
    // navigationRef?.navigate('Login', {});
    DeviceEventEmitter.emit('example_login', {});
  };

  return (
    <React.StrictMode>
      <Container
        appKey={env.appKey}
        isDevMode={env.isDevMode}
        palette={palette}
        theme={theme}
        roomOption={{ marquee: { isVisible: true } }}
        language={'zh-Hans'}
        languageExtensionFactory={(language) => {
          if (language === 'zh-Hans') {
            return createStringSetCn();
          } else {
            return createStringSetEn();
          }
        }}
        onInitialized={() => {
          console.log('dev:onInitialized:');
          isContainerReadyRef.current = true;
          if (
            isNavigationReadyRef.current === true &&
            isContainerReadyRef.current === true
          ) {
            onReady(true);
          }
        }}
      >
        <NavigationContainer
          ref={navigationRef}
          onStateChange={(state: NavigationState | undefined) => {
            const rr: string[] & string[][] = [];
            formatNavigationState(state, rr);
            console.log(
              'dev:onStateChange:',
              JSON.stringify(rr, undefined, '  ')
            );
            // console.log('onStateChange:o:', JSON.stringify(state));
          }}
          onUnhandledAction={(action: NavigationAction) => {
            console.log('dev:onUnhandledAction:', action);
          }}
          onReady={() => {
            console.log('dev:onReady:');
            isNavigationReadyRef.current = true;
            if (
              isNavigationReadyRef.current === true &&
              isContainerReadyRef.current === true
            ) {
              onReady(true);
            }
          }}
          fallback={
            <View style={{ height: 100, width: 100, backgroundColor: 'red' }} />
          }
        >
          <Root.Navigator initialRouteName={initialRouteName}>
            <Root.Screen
              name={'Splash'}
              options={{
                headerShown: false,
              }}
              component={SplashScreen}
            />
            <Root.Screen
              name={'Login'}
              options={{
                headerShown: false,
              }}
              component={LoginScreen}
            />
            <Root.Screen
              name={'ChannelList'}
              options={{
                headerShown: false,
              }}
              component={ChannelListScreen}
            />
            <Root.Screen
              name={'Chatroom'}
              options={{
                headerShown: false,
              }}
              component={ChatroomScreen}
            />
            <Root.Screen
              name={'SearchMember'}
              options={{
                headerShown: false,
              }}
              component={SearchMemberScreen}
            />
          </Root.Navigator>
        </NavigationContainer>
      </Container>
      {/* {isReady === false ? <SplashScreen /> : null} */}
    </React.StrictMode>
  );
}

export default App;
