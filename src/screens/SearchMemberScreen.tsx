import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { View } from 'react-native';
import { ParticipantList, ParticipantListType } from 'react-native-chat-room';

import type { RootScreenParamsList } from '../routes';

type Props = NativeStackScreenProps<RootScreenParamsList>;
export function SearchMemberScreen(props: Props) {
  const { navigation, route } = props;
  const { memberType } = (route.params as any).params as {
    memberType: ParticipantListType;
  };

  return (
    <View
      style={{
        // height: winHeight,
        // width: winWidth,
        height: '100%',
        width: '100%',
      }}
    >
      <ParticipantList
        memberType={memberType}
        onSearch={() => {
          navigation.goBack();
        }}
      />
    </View>
  );
}
