export declare enum UsernameAttributes {
    EMAIL = "email",
    PHONE_NUMBER = "phone_number",
    USERNAME = "username"
}
export declare type UsernameFieldOutput = {
    username?: string;
    email?: string;
    country_code?: string;
    local_phone_number?: string;
};
export declare type PhoneFieldOutput = {
    country_code: string;
    local_phone_number: string;
};
