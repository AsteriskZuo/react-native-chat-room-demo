import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Keyof } from 'react-native-chat-room/lib/typescript/types';
import type { ChatRoom } from 'react-native-chat-sdk';

import { gAvatarUrlBasic, gUserAvatars, gUserNickName2 } from '../const';
import { randomId, randomItem } from '../utils/utils';

export type UserData = {
  userId: string;
  nickName: string;
  avatar: string;
};

export class UserDataManager {
  static async _storeData(params: {
    key: string;
    value: string;
    onResult: (params: { isOk: boolean; error?: any }) => void;
  }): Promise<void> {
    try {
      await AsyncStorage.setItem(params.key, params.value, (error) => {
        if (error) {
          params.onResult({ isOk: false, error });
        } else {
          params.onResult({ isOk: true });
        }
      });
    } catch (error) {
      params.onResult({ isOk: false, error });
    }
  }

  static async _getData(params: {
    key: string;
    onResult: (params: { value?: string; error?: any }) => void;
  }): Promise<void> {
    try {
      const value = await AsyncStorage.getItem(params.key, (error) => {
        if (error) {
          params.onResult({ error });
        }
      });
      params.onResult({ value: value === null ? undefined : value });
    } catch (error) {
      params.onResult({ error });
    }
  }

  static async _getAllKeys(params: {
    onResult: (params: { value?: string[]; error?: any }) => void;
  }): Promise<void> {
    try {
      const value = await AsyncStorage.getAllKeys((error) => {
        if (error) {
          params.onResult({ error });
        }
      });
      params.onResult({ value: [...value] });
    } catch (error) {
      params.onResult({ error });
    }
  }

  static _createUser(userId: string): UserData {
    return {
      userId: userId,
      nickName: randomItem(gUserNickName2),
      avatar: `${gAvatarUrlBasic}${randomItem(gUserAvatars)}`,
    };
  }

  static getCurrentUserByUserId(
    userId: string,
    onResult: (params: { user?: UserData }) => void
  ) {
    UserDataManager._getData({
      key: userId,
      onResult: (params) => {
        if (params.value) {
          const user = JSON.parse(params.value) as UserData;
          onResult({ user });
        } else {
          const user = UserDataManager._createUser(userId);
          UserDataManager._storeData({
            key: user.userId,
            value: JSON.stringify(user),
            onResult: (params) => {
              if (params.isOk) {
                onResult({ user });
              } else {
                onResult({});
              }
            },
          });
        }
      },
    });
  }

  static getCurrentUser(onResult: (params: { user?: UserData }) => void) {
    UserDataManager._getAllKeys({
      onResult: (params) => {
        if (params.error) {
          onResult({});
        } else {
          if (params.value && params.value.length > 0) {
            const userId = params.value[0]!;
            UserDataManager.getCurrentUserByUserId(userId, onResult);
          } else {
            const userId = randomId();
            UserDataManager.getCurrentUserByUserId(userId, onResult);
          }
        }
      },
    });
  }
}
type ChatRoomType = { [p in Keyof<ChatRoom>]: ChatRoom[p] };
export interface RoomData extends ChatRoomType {
  ownerAvatar: string;
  ownerNickName: string;
  // videoUrl?: string;
  // videType: 'agora_promotion_live' | 'live';
  // affiliations_count: number;
  // persistent: boolean;
}
