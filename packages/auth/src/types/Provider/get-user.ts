import { AuthUser } from './common';

export type GetUser = () => Promise<AuthUser>;
