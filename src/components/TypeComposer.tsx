import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Color, Touch, Type } from '../theme/tokens';
import { GlassSurface } from './GlassSurface';
import { KeyboardIcon } from './icons/BridgeIcons';

interface TypeComposerProps {
  open: boolean;
  busy: boolean;
  draft?: string;
  onToggle: () => void;
  onSend: (text: string) => void;
}

export const TypeComposer: React.FC<TypeComposerProps> = ({ open, busy, draft, onToggle, onSend }) => {
  const [text, setText] = useState('');

  useEffect(() => {
    if (draft) {
      setText(draft);
    }
  }, [draft]);

  const handleSend = () => {
    const clean = text.trim();
    if (!clean || busy) {
      return;
    }
    onSend(clean);
    setText('');
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={onToggle} accessibilityRole="button" accessibilityLabel="Type instead">
        <GlassSurface radius={999} style={styles.chip}>
          <View style={styles.chipInner}>
            <KeyboardIcon />
            <Text style={styles.chipText}>{open ? 'Hide keyboard' : 'Type instead'}</Text>
          </View>
        </GlassSurface>
      </Pressable>
      {open ? (
        <View style={styles.row}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Describe what is happening"
            placeholderTextColor={Color.textMuted}
            style={styles.input}
            editable={!busy}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            accessibilityLabel="Captain message"
          />
          <Pressable
            onPress={handleSend}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel="Send message"
            style={[styles.send, busy && styles.disabled]}
          >
            <Text style={styles.sendText}>SEND</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    width: '100%',
    gap: 10,
  },
  chip: {
    minHeight: 44,
  },
  chipInner: {
    minHeight: 44,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipText: {
    color: Color.silver,
    fontFamily: Type.bodyMedium,
    fontSize: 13,
  },
  row: {
    width: '100%',
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: Touch.min,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Color.borderStrong,
    backgroundColor: Color.inset,
    color: Color.text,
    paddingHorizontal: 12,
    fontFamily: Type.body,
  },
  send: {
    minWidth: 72,
    minHeight: Touch.min,
    borderRadius: 14,
    backgroundColor: Color.silver,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: Color.canvas,
    fontFamily: Type.display,
    letterSpacing: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
});
