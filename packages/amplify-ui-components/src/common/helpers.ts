import { cx } from 'emotion';

// TODO: rename
export const styleNuker = (override: boolean, cn: string, ecn: string): string => override ? cn : cx(ecn, cn);

export const styleBranch = (branch: boolean, baseClass: string, branchClassA: string, branchClassB: string): string => branch ? cx(baseClass, branchClassA) : cx(baseClass, branchClassB);