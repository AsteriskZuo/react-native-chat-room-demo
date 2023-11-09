import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { DeviceEventEmitter, View } from 'react-native';
import {
  Alert,
  AlertRef,
  LoadingIcon,
  useIMContext,
} from 'react-native-chat-room';

import { Agora, AppServerClient, Easemob, UserDataManager } from '../common';
import type { RootScreenParamsList } from '../routes';

type Props = NativeStackScreenProps<RootScreenParamsList>;
export function LoginScreen(props: Props) {
  const { navigation } = props;
  const appType = require('../env').accountType;
  const im = useIMContext();
  const [isLoading, setIsLoading] = React.useState(false);
  const alertRef = React.useRef<AlertRef>({} as any);
  const loginAction = React.useCallback(
    (onFinished: (isOk: boolean) => void) => {
      setIsLoading(true);
      UserDataManager.getCurrentUser((params) => {
        if (params.user) {
          const { userId, nickName, avatar } = params.user;
          AppServerClient.getLoginToken({
            userId,
            nickName,
            avatar,
            onResult: (params) => {
              if (params.isOk) {
                im.login({
                  userId,
                  userToken: params.token!,
                  userNickname: nickName,
                  userAvatarURL: avatar,
                  result: (params) => {
                    if (params.isOk) {
                      navigation.replace('ChannelList', {});
                      onFinished(true);
                    } else {
                      console.warn(
                        'login failed',
                        params.error,
                        params.error?.message
                      );
                      try {
                        const json = JSON.parse(params.error?.message || '');
                        if (json.code === 200) {
                          onFinished(true);
                          navigation.replace('ChannelList', {});
                          return;
                        }
                      } catch (error) {}
                      onFinished(false);
                      alertRef.current?.alert?.();
                    }
                  },
                });
              } else {
                console.warn('getLoginToken failed');
                onFinished(false);
                alertRef.current?.alert?.();
              }
            },
          });
        } else {
          console.warn('getCurrentUser failed');
          onFinished(false);
          alertRef.current?.alert?.();
        }
      });
    },
    [im, navigation]
  );
  React.useEffect(() => {
    const sub = DeviceEventEmitter.addListener('example_login', () => {
      loginAction((isOk) => {
        setIsLoading(!isOk);
      });
    });
    return () => {
      sub.remove();
    };
  }, [loginAction]);

  return (
    <View style={{ flex: 1 }}>
      {appType === 'agora' ? <Agora /> : <Easemob />}
      {isLoading === true ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 150,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <LoadingIcon name={'spinner'} style={{ height: 36, width: 36 }} />
        </View>
      ) : null}
      <Alert
        ref={alertRef}
        title={'Login failed'}
        buttons={[
          {
            text: '                 Re-login                 ',
            onPress: () => {
              alertRef.current.close?.();
              loginAction((isOk) => {
                setIsLoading(!isOk);
              });
            },
          },
        ]}
      />
    </View>
  );
}
