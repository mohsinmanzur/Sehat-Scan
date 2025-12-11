export interface ThemeColors {
  background: string;
  card: string;
  text: string;
  border: string;
  primary: string;
  primarySoft: string;
  danger: string;
  muted: string;
}

export interface Theme {
  dark: boolean;
  colors: ThemeColors;
}
