import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as React from 'react';
import { View } from 'react-native';
import { ParticipantListType, SearchParticipant } from 'react-native-chat-room';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootScreenParamsList } from '../routes';

type Props = NativeStackScreenProps<RootScreenParamsList>;
export function SearchMemberScreen(props: Props) {
  const { navigation, route } = props;
  const { memberType } = (route.params as any).params as {
    memberType: ParticipantListType;
  };

  return (
    <View
      style={
        {
          // height: winHeight,
          // width: winWidth,
          // backgroundColor: 'red',
          // height: '100%',
          // width: '100%',
        }
      }
    >
      <SafeAreaView style={{ height: '100%' }}>
        <SearchParticipant
          memberType={memberType}
          onRequestClose={() => {
            navigation.goBack();
          }}
        />
      </SafeAreaView>
    </View>
  );
}
