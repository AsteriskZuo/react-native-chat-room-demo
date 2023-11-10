import {
  ErrorCode,
  IMEventType,
  UIKitError,
  useI18nContext,
} from 'react-native-chat-room';

export function useOnFinishedParser() {
  const { tr } = useI18nContext();
  const parseFinished = (eventType: IMEventType) => {
    switch (eventType) {
      case 'join':
        return tr('enter');
      case 'mute':
        return tr('muteSuccess');
      case 'unmute':
        return tr('unmuteSuccess');
      case 'kick':
        return tr('kickSuccess');

      default:
        return undefined;
    }
  };
  return {
    parseFinished,
  };
}

export function useOnErrorParser() {
  const { tr } = useI18nContext();
  const parseError = (error: UIKitError) => {
    switch (error.code) {
      case ErrorCode.room_leave_error:
        return tr('leaveFailed');
      case ErrorCode.room_join_error:
        return tr('joinFailed');
      case ErrorCode.room_mute_member_error:
        return tr('muteFailed');
      case ErrorCode.room_mute_member_error:
        return tr('unmuteFailed');
      case ErrorCode.room_kick_member_error:
        return tr('kickFailed');

      default:
        return undefined;
    }
  };
  return {
    parseError,
  };
}
