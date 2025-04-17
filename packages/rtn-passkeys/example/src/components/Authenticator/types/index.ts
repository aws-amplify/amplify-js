export type AutoCompletableString = string & {};

export interface MfaInfo {
	code: string;
	username: string;
}

export { assertAuthFlowType } from './assertAuthFlowType';
export { assertPreferredChallenge } from './assertPreferredChallenge';
