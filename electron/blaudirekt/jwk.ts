export const GRANT = {
    "version": "v1",
    "id": "b414cda0-6812-4631-b04d-a5bcdc799d73",
    "issuer": "https\/\/auth.dionera.dev\/clients\/720deddf-57b4-477b-8d68-2fb7378604c7",
    "token_endpoint": "https:\/\/auth.inte.dionera.dev\/oauth2\/token",
    "audience": "https:\/\/auth.inte.dionera.dev\/oauth2\/token",
    "grant_type": "urn:ietf:params:oauth:grant-type:jwt-bearer",
    "sub": "3NA71H_V9NNV",
    "scope": [
        "ameise\/mitarbeiterwebservice"
    ],
    "jwk": {
        "kid": "4f57ec29-ffb8-4cdd-98c4-9483e3d128a2",
        "kty": "EC",
        "crv": "P-521",
        "d": "Ab7ohVFecyUS5k-gz8T2LZmWBnu0Ag9NXyMatNYEkS_PA5ykHeL36gFr7C5sGux1xYF1QMUtNjnte4KYz4OSARw9",
        "x": "AWaWsW_OkQC6_HfgI3Z9IoUDupRXHOyA2aPEYVq5SS2Hf2tA2ai6XlU7subxIbjVWLvD2S9sPc9T523-X6jH6WJ0",
        "y": "ADZGFLc81TgPdFw2q6ttg5l1WbqHK2fWQvs69m3ksQLBsA9PRLZK8TEGBr7tZXkrDxU1Ybkrr_YMXoynwSmwUu1L"
    },
    "client_id": "720deddf-57b4-477b-8d68-2fb7378604c7",
    "client_secret": "jGkZCLYtb9Jl6chzb4uoXv-oJ_SMoBA3fWtWUjrU9ERpi_uxb3u_Cpu1lztfjCQbizpluUr9",
    "create_at": "2025-07-21T12:50:38Z",
    "expires_at": "2028-07-21T12:50:38Z",
    "broker": {
        "id": "3NA71H",
        "parent_id": "00A71H",
        "root_id": "00A71H",
        "is_root": false
    },
    "client": {
        "id": "1001"
    }
};

export type GrantType = typeof GRANT;