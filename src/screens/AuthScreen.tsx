import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../auth/AuthProvider';
import { Button } from '../components/Button';
import { colors, font, radius, spacing } from '../theme';

type Mode = 'login' | 'register';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;
const ERROR_COLOR = '#FF6A5C';

export function AuthScreen() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  const submit = async () => {
    setError(null);
    setInfo(null);
    const mail = email.trim();
    if (!EMAIL_RE.test(mail)) {
      setError('Ingresa un correo válido.');
      return;
    }
    if (mode === 'login' && password.length === 0) {
      setError('Ingresa tu contraseña.');
      return;
    }
    if (mode === 'register' && password.length < MIN_PASSWORD) {
      setError(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
      return;
    }

    setBusy(true);
    try {
      if (mode === 'login') {
        const err = await signIn(mail, password);
        if (err) setError(err);
      } else {
        const res = await signUp(mail, password);
        if (res.error) setError(res.error);
        else if (res.needsConfirmation) {
          setInfo('Te enviamos un correo para confirmar tu cuenta. Confírmala y luego inicia sesión.');
          setMode('login');
          setPassword('');
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    setInfo(null);
    setBusy(true);
    try {
      const err = await signInWithGoogle();
      if (err) setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.logo}>FORGE</Text>
          <Text style={styles.tagline}>Convierte cada sesión en progreso visible.</Text>

          <View style={styles.segment}>
            {(['login', 'register'] as Mode[]).map((m) => (
              <Pressable
                key={m}
                accessibilityRole="button"
                accessibilityState={{ selected: mode === m }}
                onPress={() => switchMode(m)}
                style={[styles.segBtn, mode === m && styles.segOn]}
              >
                <Text style={[styles.segText, mode === m && { color: colors.bg }]}>
                  {m === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Correo</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              placeholder="tu@correo.com"
              placeholderTextColor={colors.textDim}
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.passwordRow}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                textContentType={mode === 'login' ? 'password' : 'newPassword'}
                placeholder={mode === 'register' ? `Mínimo ${MIN_PASSWORD} caracteres` : 'Tu contraseña'}
                placeholderTextColor={colors.textDim}
                onSubmitEditing={() => void submit()}
                style={[styles.input, { flex: 1 }]}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onPress={() => setShowPassword((v) => !v)}
                hitSlop={8}
                style={styles.toggle}
              >
                <Text style={styles.toggleText}>{showPassword ? 'Ocultar' : 'Mostrar'}</Text>
              </Pressable>
            </View>
          </View>

          {error && (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          )}
          {info && <Text style={styles.info}>{info}</Text>}

          <Button
            label={busy ? 'Un momento…' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
            onPress={() => void submit()}
            disabled={busy}
          />

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.or}>o</Text>
            <View style={styles.line} />
          </View>

          <Button label="Continuar con Google" variant="ghost" onPress={() => void google()} disabled={busy} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, gap: spacing.md, justifyContent: 'center', flexGrow: 1 },
  logo: { ...font.title, fontSize: 44, color: colors.text, textAlign: 'center' },
  tagline: { ...font.body, color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  segment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  segBtn: { flex: 1, paddingVertical: spacing.sm + 4, alignItems: 'center', backgroundColor: colors.surface },
  segOn: { backgroundColor: colors.orange },
  segText: { fontSize: 15, fontWeight: '800', color: colors.text },
  field: { gap: spacing.xs },
  label: { ...font.small, color: colors.textMuted },
  input: {
    backgroundColor: colors.surfaceDeep,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.text,
    fontSize: 17,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toggle: { paddingHorizontal: spacing.sm },
  toggleText: { ...font.small, color: colors.orange, fontWeight: '700' },
  error: { ...font.small, color: ERROR_COLOR },
  info: { ...font.small, color: colors.amber },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  or: { ...font.small, color: colors.textMuted },
});
