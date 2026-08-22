import * as Sentry from '@sentry/react-native';
import { Snackbar } from 'react-native-snackbar';
import { Colors } from 'src/constants/colors';

interface ErrorOptions {
  userMessage?: string;
  backgroundColor?: string;
  textColor?: string;
}

export function handleError(error: unknown, options?: string | ErrorOptions) {
  console.error(error);
  Sentry.captureException(error);

  if (options) {
    const userMessage = typeof options === 'string' ? options : options.userMessage;
    const backgroundColor = (typeof options === 'object' && options.backgroundColor) || Colors.light.danger;
    const textColor = (typeof options === 'object' && options.textColor) || '#FFFFFF';

    if (userMessage) {
      Snackbar.show({
        text: userMessage,
        duration: Snackbar.LENGTH_LONG,
        backgroundColor,
        textColor,
      });
    }
  }
}
