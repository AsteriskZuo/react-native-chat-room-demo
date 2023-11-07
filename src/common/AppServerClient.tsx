import { getRoomListApi, registerUserApi } from '../const';
import { RoomData } from './data';

export class AppServerClient {
  static getLoginToken(params: {
    userId: string;
    nickName: string;
    avatar: string;
    onResult: (params: { isOk: boolean; token?: string }) => void;
  }) {
    const { userId, nickName, avatar } = params;
    fetch(registerUserApi, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userId,
        nickname: nickName,
        icon_key: avatar,
      }),
    })
      .then((response) => {
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error('registerUserApi failed');
        }
      })
      .then((json) => {
        params.onResult({ isOk: true, token: json.access_token });
      })
      .catch((error) => {
        console.error(error);
        params.onResult({ isOk: false });
      });
  }
  static getRoomList(params: {
    token: string;
    onResult: (params: { isOk: boolean; roomList?: RoomData[] }) => void;
  }) {
    const { token } = params;
    fetch(getRoomListApi, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })
      .then((response) => {
        console.log('test:zuoyu:getRoomList:', response);
        if (response.status === 200) {
          return response.json();
        } else {
          throw new Error('getRoomList failed');
        }
      })
      .then((json) => {
        console.log('test:zuoyu:getRoomList:', json);
        const jsonList = json.entities as any[];
        const array = [] as RoomData[];
        for (const item of jsonList) {
          const room = new RoomData({
            roomId: item.id,
            roomName: item.name,
            description: item.description,
            owner: item.owner,
            permissionType: -1,
            ownerAvatar: item.iconKey,
            ownerNickName: item.nickname,
            videoUrl: item.ext?.videoUrl,
            videType: item.video_type,
            affiliations_count: item.affiliations_count,
            persistent: item.persistent,
          } as any);
          array.push(room);
        }

        params.onResult({ isOk: true, roomList: array });
      })
      .catch((error) => {
        console.error(error);
        params.onResult({ isOk: false });
      });
  }
}
