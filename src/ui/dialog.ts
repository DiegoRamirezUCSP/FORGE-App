import { Alert, Platform } from 'react-native';

/** Diálogos del navegador, tipados sin depender de la librería DOM. */
const web = globalThis as unknown as {
  alert: (message: string) => void;
  confirm: (message: string) => boolean;
};

/** Aviso simple. `Alert.alert` no hace nada en web, por eso se usa el del navegador. */
export function showAlert(title: string, message?: string): void {
  if (Platform.OS === 'web') {
    web.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

interface ConfirmOptions {
  confirmText: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
}

/** Confirmación con dos opciones. */
export function showConfirm(title: string, message: string, opts: ConfirmOptions): void {
  if (Platform.OS === 'web') {
    if (web.confirm(`${title}\n\n${message}`)) opts.onConfirm();
    return;
  }
  Alert.alert(title, message, [
    { text: opts.cancelText ?? 'Cancelar', style: 'cancel' },
    { text: opts.confirmText, style: opts.destructive ? 'destructive' : 'default', onPress: opts.onConfirm },
  ]);
}
