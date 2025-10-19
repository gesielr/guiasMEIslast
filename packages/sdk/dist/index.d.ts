type SdkMode = "mock" | "sandbox" | "production";
interface SdkConfig {
    baseUrl: string;
    mode: SdkMode;
    token?: string;
}
declare class ApiError extends Error {
    status: number;
    payload: unknown;
    constructor(status: number, payload: unknown);
}
declare function createSdk(config: SdkConfig): {
    auth: {
        register(payload: Record<string, unknown>): Promise<unknown>;
        login(payload: {
            identifier: string;
            password: string;
        }): Promise<unknown>;
        verify2fa(payload: {
            code: string;
        }): Promise<unknown>;
    };
    dashboards: {
        getMei(): Promise<unknown>;
        getAutonomo(): Promise<unknown>;
        getParceiro(): Promise<unknown>;
    };
    nfse: {
        emitir(payload: Record<string, unknown>): Promise<unknown>;
        listar(): Promise<unknown>;
    };
    gps: {
        gerar(payload: Record<string, unknown>): Promise<unknown>;
    };
    payments: {
        createCheckout(payload: Record<string, unknown>): Promise<unknown>;
    };
    whatsapp: {
        send(payload: Record<string, unknown>): Promise<unknown>;
    };
};

export { ApiError, type SdkConfig, type SdkMode, createSdk };
