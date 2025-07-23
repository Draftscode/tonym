import { AuthConfig } from "angular-oauth2-oidc";

export const authCodeFlowConfig: AuthConfig = {
    // Url of the Identity Provider
    issuer: 'https://auth.inte.dionera.dev',

    // URL of the SPA to redirect the user to after login
    // redirectUri: window.location.origin + '/redirect',
    requireHttps: true,
  tokenEndpoint: 'https://maklerinfo.inte.dionera.dev/auth/realms/blaudirekt/protocol/openid-connect/token',
    // The SPA's id. The SPA is registerd with this id at the auth-server
    // clientId: 'server.code',
    clientId: '3NA71H',

    // Just needed if your auth server demands a secret. In general, this
    // is a sign that the auth server is not configured with SPAs in mind
    // and it might not enforce further best practices vital for security
    // such applications.
    // dummyClientSecret: 'secret',

    responseType: 'code',
  oidc: false, // Since you're using ROPC
    // set the scope for the permissions the client should request
    // The first four are defined by OIDC.
    // Important: Request offline_access to get a refresh token
    // The api scope is a usecase specific one
     scope: 'openid email profile ameise-api offline_access',

    showDebugInformation: true,
    
//     timeoutFactor: 0.01,
//   checkOrigin: false,
};