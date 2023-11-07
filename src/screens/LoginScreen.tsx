import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { View } from 'react-native';
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
  const loginAction = React.useCallback(() => {
    setIsLoading(true);
    UserDataManager.getCurrentUser((params) => {
      console.log('test:zuoyu:getCurrentUser', params);
      if (params.user) {
        const { userId, nickName, avatar } = params.user;
        AppServerClient.getLoginToken({
          userId,
          nickName,
          avatar,
          onResult: (params) => {
            console.log('test:zuoyu:getLoginToken', params);
            if (params.isOk) {
              im.login({
                userId,
                userToken: params.token!,
                userNickname: nickName,
                userAvatarURL: avatar,
                result: (params) => {
                  console.log('test:zuoyu:login', params);
                  if (params.isOk) {
                    setIsLoading(false);
                    // todo: navigate to HomeScreen
                    navigation.push('ChannelList', {});
                  } else {
                    console.warn('login failed', params.error);
                    alertRef.current?.alert?.();
                  }
                },
              });
            } else {
              console.warn('getLoginToken failed');
            }
          },
        });
      } else {
        console.warn('getCurrentUser failed');
      }
    });
  }, [im, navigation]);
  React.useEffect(() => {
    loginAction();
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
              loginAction();
            },
          },
        ]}
      />
    </View>
  );
}
