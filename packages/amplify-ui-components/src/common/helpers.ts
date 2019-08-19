import { cx } from 'emotion';

// TODO: rename
export const styleNuker = (override: boolean, cn: string, ecn: string): string => override ? cn : cx(ecn, cn);
