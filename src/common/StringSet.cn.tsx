import type { StringSet } from 'react-native-chat-room';

export function createStringSetCn(): StringSet {
  return {
    'this is test.': 'this is test.',
    'This is test with ${0} and ${1}': (a: string, b: number) => {
      return `This is test with ${a} and ${b}`;
    },
    'channelList': '聊天室',
    'channelListName': (a: string) => `${a}的聊天室`,
    'Enter': '进入',
    'Create': '创建',
    'leaveRoom': '离开聊天室?',
    'leaveFailed': '离开聊天室失败',
    'joinFailed': '加入聊天室失败',
    'beMuted': '您已被禁言',
    'beUnmuted': '您已被解除禁言',
    'beRemove': '您已被移出聊天室',
    'muteSuccess': '禁言成功',
    'unmuteSuccess': '解除禁言成功',
    'muteFailed': '禁言失败',
    'unmuteFailed': '解除禁言失败',
    'kickSuccess': '移出聊天室成功',
    'kickFailed': '移出聊天室失败',
    'gifts': '打赏',
    'messageReportSuccess': '举报成功',
  };
}
