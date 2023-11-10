import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import {
  DeviceEventEmitter,
  FlatList,
  Platform,
  ToastAndroid,
} from 'react-native';
import { Text, View } from 'react-native';
import {
  Avatar,
  CmnButton,
  Image,
  LoadingIcon,
  SimpleToast,
  SimpleToastRef,
  Switch,
  useColors,
  useI18nContext,
  useIMContext,
  useIMListener,
  useLifecycle,
  usePaletteContext,
} from 'react-native-chat-room';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppServerClient,
  RoomData,
  useOnErrorParser,
  useOnFinishedParser,
  UserData,
  UserDataManager,
} from '../common';
import type { RootScreenParamsList } from '../routes';
import { randomCover } from '../utils/utils';

type Props = NativeStackScreenProps<RootScreenParamsList>;
export function ChannelListScreen(props: Props) {
  const { navigation } = props;
  const [isStop, setIsStop] = React.useState(true);
  const dataRef = React.useRef<{ id: string; room: RoomData }[]>([]);
  const [data, setData] = React.useState(dataRef.current);
  const roomRef = React.useRef<RoomData | undefined>(undefined);
  const toastRef = React.useRef<SimpleToastRef>({} as any);
  const [value, onValueChange] = React.useState(false);
  const [user, setUser] = React.useState<UserData | undefined>(undefined);
  const im = useIMContext();
  const { colors } = usePaletteContext();
  const { getColor } = useColors({
    bg: {
      light: colors.neutral[95],
      dark: colors.neutral[1],
    },
    bg2: {
      light: colors.neutral[98],
      dark: colors.neutral[2],
    },
    text1: {
      light: colors.neutral[1],
      dark: colors.neutral[98],
    },
    text2: {
      light: colors.neutral[5],
      dark: colors.neutral[7],
    },
  });
  const { parseError } = useOnErrorParser();
  const { parseFinished } = useOnFinishedParser();
  const { tr } = useI18nContext();

  const request = React.useCallback(
    async (finished?: () => void) => {
      const s = await im.loginState();
      if (s === 'logged') {
        const token = await im.client.getAccessToken();
        dataRef.current = [];
        AppServerClient.getRoomList({
          token: token,
          onResult: (params) => {
            if (params.roomList) {
              for (const room of params.roomList) {
                dataRef.current.push({
                  id: room.roomId,
                  room: room,
                });
              }
              setData([...dataRef.current]);
            }

            finished?.();
          },
        });
        finished?.();
      } else {
        finished?.();
      }
    },
    [im]
  );
  const onRefresh = () => {
    setIsStop(false);
    setTimeout(() => {
      request(() => {
        setIsStop(true);
      });
    }, 1000);
  };

  useLifecycle(
    React.useCallback(
      async (state) => {
        if (state === 'load') {
          request();
        } else {
        }
      },
      [request]
    )
  );

  const onLeaveRoom = React.useCallback(async () => {
    if (im.userId === roomRef.current?.owner) {
      if (roomRef.current === undefined) {
        return;
      }
      AppServerClient.removeRoom({
        roomId: roomRef.current.roomId,
        token: await im.client.getAccessToken(),
        onResult: (params) => {
          if (params.isOk) {
            if (params.roomId) {
              dataRef.current = dataRef.current.filter(
                (item) => item.id !== params.roomId
              );
              setData([...dataRef.current]);
            }
          }
        },
      });
      im.client.roomManager
        .destroyChatRoom(roomRef.current?.roomId ?? '')
        .catch((e) => {
          console.warn('dev:destroyChatRoom:', e);
        });
    }
  }, [im.client, im.userId]);

  useIMListener(
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
          if (params.event === 'leave') {
            onLeaveRoom();
          }
        },
        onUserBeKicked: (roomId: string, reason: number) => {
          console.log('ChatroomScreen:onUserBeKicked:', roomId, reason);
          tr('beRemove');
        },
      };
    }, [onLeaveRoom, parseError, parseFinished, tr])
  );

  useLifecycle(
    React.useCallback(async (state) => {
      if (state === 'load') {
        UserDataManager.getCurrentUser((params) => {
          if (params.user) {
            setUser(params.user);
          }
        });
      } else {
      }
    }, [])
  );

  const createRoom = async () => {
    const loginState = await im.loginState();
    if (loginState !== 'logged') {
      console.log('dev:createRoom:loginState:', loginState);
      return;
    }
    if (im.userId === undefined) {
      console.log('dev:createRoom:userId:', im.userId);
      return;
    }
    const user = im.getUserInfo(im.userId);
    if (user === undefined) {
      console.log('dev:createRoom:user:', im.userId);
      return;
    }
    AppServerClient.createRoom({
      token: await im.client.getAccessToken(),
      roomName: tr('channelListName', user.nickName ?? user.userId),
      roomOwnerId: im.userId,
      onResult: (params) => {
        if (params.isOk) {
          if (params.room) {
            dataRef.current.push({
              id: params.room.roomId,
              room: params.room,
            });
            setData([...dataRef.current]);

            enterRoom(params.room);
          }
        }
      },
    });
  };

  const enterRoom = (room: RoomData) => {
    roomRef.current = room;
    navigation.push('Chatroom', { params: { room } });
  };

  return (
    <View
      style={{
        flexGrow: 1,
        backgroundColor: getColor('bg'),
      }}
    >
      <SafeAreaView
        style={{
          flexGrow: 1,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            height: 56,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontWeight: '700',
              fontSize: 20,
              lineHeight: 28,
              color: getColor('text1'),
            }}
          >
            {tr('channelList')}
          </Text>
          <View
            style={{ marginHorizontal: 10 }}
            onTouchEnd={() => {
              onRefresh();
            }}
          >
            <LoadingIcon
              name={'round_arrow_thick'}
              style={{ width: 20, height: 20 }}
              isStop={isStop}
            />
          </View>

          <View style={{ flexGrow: 1 }} />
          <Switch
            height={28}
            width={54}
            value={value}
            onValueChange={(v) => {
              onValueChange(v);
              DeviceEventEmitter.emit(
                'example_change_theme',
                value === true ? 'light' : 'dark'
              );
            }}
            trackIcon={{
              false: 'switch1',
              true: 'switch2',
            }}
            iconStyle={{ tintColor: undefined }}
          />
        </View>
        <View
          style={{
            flexGrow: 1,
            width: '100%',
            height: 100,
            // backgroundColor: 'green',
          }}
        >
          <FlatList
            data={data}
            renderItem={(info) => {
              return (
                <ListRenderItemMemo
                  id={info.item.id}
                  room={info.item.room}
                  onResult={(room) => {
                    enterRoom(room);
                  }}
                />
              );
            }}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={ItemSeparatorComponent}
            refreshing={isStop === false}
            onRefresh={onRefresh}
          />
        </View>
        <View
          style={{
            height: 66,
            backgroundColor: getColor('bg'),
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Avatar borderRadius={36} size={36} url={user?.avatar} />
          <View style={{ width: 12 }} />
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              lineHeight: 22,
              color: getColor('text1'),
            }}
          >
            {user?.nickName ?? user?.userId}
          </Text>
          <View style={{ flexGrow: 1 }} />
          <CmnButton
            sizesType={'large'}
            radiusType={'large'}
            contentType={'icon-text'}
            text={'Create'}
            icon={'video_camera_splus'}
            onPress={createRoom}
          />
        </View>
      </SafeAreaView>
      <SimpleToast propsRef={toastRef} />
    </View>
  );
}

const ListRenderItem = (props: {
  id: string;
  room: RoomData;
  onResult: (room: RoomData) => void;
}) => {
  const { room, onResult } = props;
  const { colors } = usePaletteContext();
  const { getColor } = useColors({
    bg: {
      light: colors.neutral[95],
      dark: colors.neutral[1],
    },
    bg2: {
      light: colors.neutral[98],
      dark: colors.neutral[2],
    },
    text1: {
      light: colors.neutral[1],
      dark: colors.neutral[98],
    },
    text2: {
      light: colors.neutral[5],
      dark: colors.neutral[7],
    },
  });
  return (
    <View
      style={{
        height: 100,
        width: '100%',
        borderRadius: 16,
        // backgroundColor: 'orange',
        flexDirection: 'row',
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: 100,
          // backgroundColor: 'white',
        }}
      >
        <Image
          source={
            room.owner === 'easemob'
              ? require('../assets/easemob_cover-1.png')
              : randomCover(room.roomId)
          }
        />
      </View>
      <View
        style={{
          flexGrow: 1,
          backgroundColor: getColor('bg2'),
          justifyContent: 'center',
          paddingHorizontal: 12,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              lineHeight: 22,
              color: getColor('text1'),
            }}
          >
            {room.roomName ?? room.roomId}
          </Text>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Avatar borderRadius={20} size={20} url={room.ownerAvatar} />
          <View style={{ width: 4 }} />
          <Text
            style={{
              fontSize: 12,
              fontWeight: '400',
              lineHeight: 16,
              color: getColor('text2'),
            }}
          >
            {room.ownerNickName ?? room.owner}
          </Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ flexGrow: 1 }} />
          <CmnButton
            sizesType={'small'}
            radiusType={'large'}
            contentType={'only-text'}
            text={'Enter'}
            onPress={() => {
              onResult(room);
            }}
          />
        </View>
      </View>
    </View>
  );
};
const ListRenderItemMemo = React.memo(ListRenderItem);

const ItemSeparatorComponent = () => {
  return <View style={{ height: 12 }} />;
};
