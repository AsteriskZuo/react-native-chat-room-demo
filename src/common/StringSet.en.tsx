import type { StringSet } from 'react-native-chat-room';

export function createStringSetEn(): StringSet {
  return {
    'this is test.': 'this is test.',
    'This is test with ${0} and ${1}': (a: string, b: number) => {
      return `This is test with ${a} and ${b}`;
    },
    'channelList': 'Channel List',
    'channelListName': (a: string) => `${a}'s Channel`,
    'Enter': 'Enter',
    'create': 'Create',
    'leaveRoom': 'Want to end live streaming?',
    'leaveFailed': 'Leave channel failed',
    'joinFailed': 'Join channel failed',
    'beMuted': 'You have been muted',
    'beUnmuted': 'You have been unmuted',
    'beRemove': 'You have been removed',
    'muteSuccess': 'Mute success',
    'unmuteSuccess': 'Unmute success',
    'muteFailed': 'Mute failed',
    'unmuteFailed': 'Unmute failed',
    'kickSuccess': 'Kick success',
    'kickFailed': 'Kick failed',
  };
}
