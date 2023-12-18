import * as React from 'react';
import { Platform, ToastAndroid, View } from 'react-native';
import {
  SimpleToastRef,
  useI18nContext,
  useRoomContext,
  useRoomListener,
  UserServiceData,
} from 'react-native-chat-room';

import { useOnErrorParser, useOnFinishedParser } from './useToastParser';

export type ToastViewProps = {};
export function ToastView(props: ToastViewProps) {
  const {} = props;
  const toastRef = React.useRef<SimpleToastRef>({} as any);
  const { parseError } = useOnErrorParser();
  const { parseFinished } = useOnFinishedParser();
  const { tr } = useI18nContext();
  const im = useRoomContext();

  useRoomListener(
    React.useMemo(() => {
      return {
        onError: (params) => {
          console.log('ChatroomScreen:onError:', JSON.stringify(params));
          const ret = parseError(params.error);
          if (ret) {
            if (Platform.OS === 'ios') {
              toastRef.current.show({
                message: ret,
                timeout: 3000,
              });
            } else {
              ToastAndroid.show(ret, 3000);
            }
          }
        },
        onFinished: (params) => {
          console.log('ChatroomScreen:onFinished:', params);
          const ret = parseFinished(params.event);
          if (ret) {
            if (Platform.OS === 'ios') {
              toastRef.current.show({
                message: ret,
                timeout: 3000,
              });
            } else {
              ToastAndroid.show(ret, 3000);
            }
          }
        },
        onUserJoined: (roomId: string, user: UserServiceData): void => {
          console.log('ChatroomScreen:onUserJoined:', roomId, user);
        },
        onUserLeave: (roomId: string, userId: string): void => {
          console.log('ChatroomScreen:onUserLeave:', roomId, userId);
        },
        onUserBeKicked: (roomId: string, reason: number) => {
          console.log('ChatroomScreen:onUserBeKicked:', roomId, reason);
        },
        onUserMuted: (roomId, userIds, operatorId) => {
          console.log(
            'ChatroomScreen:onUserMuted:',
            roomId,
            userIds,
            operatorId,
            im.userId
          );
          if (im.userId !== userIds[0]) {
            return;
          }
          if (Platform.OS === 'ios') {
            toastRef.current.show({
              message: tr('beMuted'),
              timeout: 3000,
            });
          } else {
            ToastAndroid.show(tr('beMuted'), 3000);
          }
        },
        onUserUnmuted: (roomId, userIds, operatorId) => {
          console.log(
            'ChatroomScreen:onUserUnmuted:',
            roomId,
            userIds,
            operatorId
          );
          if (im.userId !== userIds[0]) {
            return;
          }
          if (Platform.OS === 'ios') {
            toastRef.current.show({
              message: tr('beUnmuted'),
              timeout: 3000,
            });
          } else {
            ToastAndroid.show(tr('beUnmuted'), 3000);
          }
        },
      };
    }, [im.userId, parseError, parseFinished, tr])
  );

  return <View />;
}
