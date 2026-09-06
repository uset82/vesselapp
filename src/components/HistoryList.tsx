import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Color, Type } from '../theme/tokens';
import { ConversationTurn } from '../types/agent';
import { HistoryEntry } from '../types/vessel';

export const HistoryList: React.FC<{ history: HistoryEntry[]; conversation: ConversationTurn[] }> = ({
  history,
  conversation,
}) => {
  const rows = [
    ...conversation.map((item) => ({
      id: item.id,
      stamp: item.timestamp,
      who: item.role === 'captain' ? 'Captain' : item.role === 'agent' ? 'Vessel Agent' : 'System',
      text: item.text,
    })),
    ...history.map((item) => ({
      id: item.id,
      stamp: item.timestamp,
      who: item.actor === 'platform' ? 'Platform' : item.actor === 'agent' ? 'Vessel Agent' : item.actor === 'captain' ? 'Captain' : 'System',
      text: item.text,
    })),
  ];

  const unique = rows.filter((row, index, list) => list.findIndex((item) => item.text === row.text && item.stamp === row.stamp) === index);

  return (
    <ScrollView style={styles.list} contentContainerStyle={styles.content}>
      {unique.length === 0 ? <Text style={styles.empty}>No operational history yet.</Text> : null}
      {unique.map((row) => (
        <View key={row.id} style={styles.row}>
          <Text style={styles.stamp}>{row.stamp}</Text>
          <Text style={styles.who}>{row.who}</Text>
          <Text style={styles.text}>{row.text}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    gap: 12,
    paddingBottom: 24,
  },
  row: {
    borderLeftWidth: 2,
    borderLeftColor: Color.borderStrong,
    paddingLeft: 10,
  },
  stamp: {
    color: Color.textMuted,
    fontFamily: Type.body,
    fontSize: 12,
  },
  who: {
    color: Color.silver,
    fontFamily: Type.displayMedium,
    letterSpacing: 0.6,
    marginTop: 2,
  },
  text: {
    color: Color.text,
    fontFamily: Type.body,
    marginTop: 2,
  },
  empty: {
    color: Color.textSecondary,
    fontFamily: Type.body,
  },
});
