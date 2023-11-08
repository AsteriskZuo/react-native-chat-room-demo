import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { DeviceEventEmitter, FlatList } from 'react-native';
import { Text, View } from 'react-native';
import {
  Avatar,
  CmnButton,
  Image,
  LoadingIcon,
  Switch,
  useColors,
  useIMContext,
  useLifecycle,
  usePaletteContext,
} from 'react-native-chat-room';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AppServerClient,
  RoomData,
  UserData,
  UserDataManager,
} from '../common';
import type { RootScreenParamsList } from '../routes';
import { randomCover } from '../utils/utils';

type Props = NativeStackScreenProps<RootScreenParamsList>;
export function ChannelListScreen(props: Props) {
  const {} = props;
  const [isStop, setIsStop] = React.useState(true);
  const dataRef = React.useRef<{ id: string; room: RoomData }[]>([]);
  const [data, setData] = React.useState(dataRef.current);
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
            {'Channel list'}
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
                    props.navigation.push('Chatroom', {
                      params: {
                        room,
                      },
                    });
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
          />
        </View>
      </SafeAreaView>
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
