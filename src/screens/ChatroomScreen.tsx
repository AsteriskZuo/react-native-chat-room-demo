import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import {
  Platform,
  Text,
  ToastAndroid,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  Avatar,
  BottomSheetGift2,
  BottomSheetGiftSimuRef,
  Chatroom,
  Icon,
  IconButton,
  seqId,
  SimpleToast,
  SimpleToastRef,
  useColors,
  useIMContext,
  useIMListener,
  usePaletteContext,
} from 'react-native-chat-room';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackgroundVideoMemo, RoomData } from '../common';
import { gGifts, gGifts2 } from '../const';
import type { RootScreenParamsList } from '../routes';

type Props = NativeStackScreenProps<RootScreenParamsList>;
export function ChatroomScreen(props: Props) {
  const { navigation, route } = props;
  const room = (route.params as any).params.room as RoomData;
  const { top } = useSafeAreaInsets();
  const testRef = React.useRef<View>({} as any);
  const chatroomRef = React.useRef<Chatroom>({} as any);
  const toastRef = React.useRef<SimpleToastRef>({} as any);
  const giftRef = React.useRef<BottomSheetGiftSimuRef>({} as any);
  const im = useIMContext();
  const { colors } = usePaletteContext();
  const { width: winWidth } = useWindowDimensions();
  const { getColor } = useColors({
    bg: {
      light: colors.neutral[98],
      dark: colors.neutral[1],
    },
    bg2: {
      light: colors.barrage[2],
      dark: colors.barrage[2],
    },
    tintColor: {
      light: colors.barrage[8],
      dark: colors.barrage[8],
    },
    marquee: {
      light: '#FF6680',
      dark: '#33B1FF',
    },
  });

  const [pageY, setPageY] = React.useState(0);

  useIMListener(
    React.useMemo(() => {
      return {
        onError: (params) => {
          console.log('ChatroomScreen:onError:', JSON.stringify(params));
          if (Platform.OS === 'ios') {
            toastRef.current.show({
              message: JSON.stringify(params),
              timeout: 3000,
            });
          } else {
            ToastAndroid.show(JSON.stringify(params), 3000);
          }
        },
        onFinished: (params) => {
          console.log('ChatroomScreen:onFinished:', params);
          if (Platform.OS === 'ios') {
            toastRef.current.show({
              message: params.event + ':' + params.extra?.toString(),
              timeout: 3000,
            });
          } else {
            ToastAndroid.show(
              params.event + ':' + params.extra?.toString(),
              3000
            );
          }
        },
        onUserBeKicked: (roomId: string, reason: number) => {
          console.log('ChatroomScreen:onUserBeKicked:', roomId, reason);
          navigation.goBack();
        },
      };
    }, [navigation])
  );

  const onGoBack = () => {
    navigation.goBack();
  };

  const onRequestMemberList = () => {
    chatroomRef?.current?.getMemberListRef()?.startShow();
  };

  return (
    <View
      ref={testRef}
      style={{ flex: 1 }}
      onLayout={() => {
        testRef.current?.measure(
          (
            _x: number,
            _y: number,
            _width: number,
            _height: number,
            _pageX: number,
            pageY: number
          ) => {
            setPageY(pageY);
          }
        );
      }}
    >
      <Chatroom
        ref={chatroomRef}
        marquee={{
          props: {
            containerStyle: {
              marginLeft: 12,
              width: winWidth - 24,
              marginTop: 8 + top + 44,
              backgroundColor: getColor('marquee'),
            },
          },
        }}
        backgroundView={<BackgroundVideoMemo />}
        input={{
          props: {
            keyboardVerticalOffset: Platform.OS === 'ios' ? pageY : 0,
            after: [
              <TouchableOpacity
                style={{
                  borderRadius: 38,
                  backgroundColor: getColor('bg2'),
                  width: 38,
                  height: 38,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                onPress={() => {
                  giftRef?.current?.startShow?.();
                }}
              >
                <Icon
                  name={'gift_color'}
                  style={{ width: 30, height: 30, tintColor: undefined }}
                />
              </TouchableOpacity>,
            ],
          },
        }}
        memberList={{
          props: {
            onSearch: (memberType) => {
              navigation.push('SearchMember', { params: { memberType } });
            },
          },
        }}
        roomId={room.roomId}
        ownerId={room.owner}
        onError={(e) => {
          console.log('ChatroomScreen:onError:2', e.toString());
        }}
      />
      <BottomSheetGift2
        ref={giftRef}
        maskStyle={{ transform: [{ translateY: -pageY }] }}
        gifts={[
          { title: 'gift1', gifts: gGifts },
          { title: 'gift2', gifts: gGifts2 },
        ]}
        onSend={(giftId) => {
          for (const gift of gGifts) {
            if (gift.giftId === giftId) {
              if (im.roomState === 'joined') {
                im.sendGift({
                  roomId: im.roomId!,
                  gift: {
                    giftId: gift.giftId,
                    giftName: gift.giftName,
                    giftPrice: gift.giftPrice.toString(),
                    giftCount: 1,
                    giftIcon: gift.giftIcon,
                    giftEffect: gift.giftEffect ?? '',
                    sendedThenClose: true,
                    selected: true,
                  },
                  result: ({ isOk, error, message }) => {
                    console.log('sendGift:', isOk, error);
                    if (isOk === true && message) {
                      chatroomRef?.current
                        ?.getMessageListRef()
                        ?.addSendedMessage(message);
                      chatroomRef?.current?.getGiftEffectRef()?.pushTask({
                        model: {
                          id: seqId('_gf').toString(),
                          nickName:
                            im.getUserInfo(im.userId)?.nickName ??
                            im.userId ??
                            'unknown',
                          giftCount: 1,
                          giftIcon: gift.giftIcon,
                          content: `sent ${gift.giftName}`,
                          avatar: im.userInfoFromMessage(message)?.avatarURL,
                        },
                      });
                    }
                  },
                });
                giftRef?.current?.startHide?.();
              }
              break;
            }
          }
        }}
      />
      <ChatroomHeader
        {...props}
        onGoBack={onGoBack}
        onRequestMemberList={onRequestMemberList}
      />
      <SimpleToast propsRef={toastRef} />
    </View>
  );
}

export const ChatroomHeader = (
  props: Props & { onGoBack: () => void; onRequestMemberList: () => void }
): React.ReactElement => {
  const { route, onGoBack, onRequestMemberList } = props;
  const room = (route.params as any).params.room as RoomData;
  const { top } = useSafeAreaInsets();
  const { colors } = usePaletteContext();
  const { getColor } = useColors({
    return: {
      light: colors.neutral[98],
      dark: colors.neutral[98],
    },
    text1: {
      light: 'hsla(0, 0%, 100%, 1)',
      dark: 'hsla(0, 0%, 100%, 1)',
    },
    text2: {
      light: 'hsla(0, 0%, 100%, 0.8)',
      dark: 'hsla(0, 0%, 100%, 0.8)',
    },
    bg: {
      light: 'hsla(0, 0%, 0%, 0.2)',
      dark: 'hsla(0, 0%, 100%, 0.1)',
    },
  });
  return (
    <View
      style={{
        position: 'absolute',
        marginTop: top,
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16,
        paddingLeft: 6,
        width: '100%',
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onTouchEnd={onGoBack}
      >
        <Icon
          name={'chevron_left'}
          style={{
            width: 20,
            height: 20,
            tintColor: getColor('return'),
          }}
        />
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderRadius: 19,
          backgroundColor: getColor('bg'),
          paddingLeft: 2,
          paddingRight: 10,
        }}
      >
        <Avatar borderRadius={32} size={32} url={room?.ownerAvatar} />
        <View style={{ width: 5 }} />
        <View>
          <Text
            style={{
              fontSize: 16,
              fontWeight: '500',
              lineHeight: 22,
              color: getColor('text1'),
            }}
          >
            {room?.roomName ?? room?.roomId}
          </Text>
          <Text
            style={{
              fontSize: 11,
              fontWeight: '400',
              lineHeight: 14,
              color: getColor('text2'),
            }}
          >
            {room?.ownerNickName ?? room.owner}
          </Text>
        </View>
      </View>
      <View style={{ flexGrow: 1 }} />
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 32,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: getColor('bg'),
        }}
        onTouchEnd={onRequestMemberList}
      >
        <IconButton
          iconName={'person_double_fill'}
          style={{
            width: 16,
            height: 16,
            tintColor: getColor('return'),
          }}
        />
      </View>
    </View>
  );
};
