import { importJWK, SignJWT } from 'jose';
import { GRANT } from './jwk';
const KUNDENID = "5001900727";
export class BlaudirektService {

    static async ask(path: string) {
        const token = await this.getAccessToken();
        const url = `https://mitarbeiterwebservice-maklerinfo.inte.dionera.dev/service/bd/employee/1.0/rest/${path}`;
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`
                },
            });
            // console.log('R', response)
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending form data:', error);
            throw error;
        }
    }

    static async getAccessToken(): Promise<string> {

        const { jwk, issuer, sub, audience, client_id, client_secret, scope, grant_type, token_endpoint } = GRANT;

        const privateKey = await importJWK(jwk, "ES512");

        const assertion = await new SignJWT({
            iss: issuer,
            sub: sub,
            aud: audience,
            iat: (+new Date()) / 1000,
            jti: String(Math.random()),
        })
            .setProtectedHeader({ alg: 'ES512' })
            .setIssuedAt()
            .setExpirationTime('5m')
            .sign(privateKey);

        const url = token_endpoint; // Replace with the actual token endpoint

        const formData = new URLSearchParams();
        formData.append('grant_type', grant_type);
        formData.append('scope', scope.join(' '));
        formData.append('assertion', assertion);

        const credentials = btoa(`${client_id}:${client_secret}`);
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Basic ${credentials}`
                },
                body: formData.toString(),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Request failed with status ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            return data.access_token;
        } catch (error) {
            console.error('Error sending form data:', error);
            throw error;
        }
    }





}

