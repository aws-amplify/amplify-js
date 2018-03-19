export interface CredentialsProvider {
    configure(config: object): Promise<object>;
    setCredentials(config: object): Promise<any>;
    getCredentials(config: object): Promise<any>;
    removeCredentials(): void;
    essentialCredentials(params: object): object;
    currentSession(config: object): Promise<any>;
    getCategory(): string;
    getProviderName(): string;
}
