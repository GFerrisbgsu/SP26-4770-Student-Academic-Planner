/**
 * Passkey Service - handles WebAuthn passkey operations
 * Communicates with backend passkey endpoints
 */

import type {
  PasskeyDTO,
  PasskeyRegistrationBeginRequest,
  PasskeyRegistrationBeginResponse,
  PasskeyRegistrationCompleteRequest,
  PasskeyAuthenticationBeginResponse,
  PasskeyAuthenticationCompleteRequest,
} from '~/types/passkey';
import type { LoginResponse } from '~/types/user';
import {
  base64UrlToUint8Array,
  bufferToBase64Url,
  isWebAuthnSupported,
} from '~/utils/webauthn';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export class PasskeyService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private buildHeaders() {
    return {
      'Content-Type': 'application/json',
    };
  }

  // ============================================
  // Registration Flow
  // ============================================

  /**
   * Start passkey registration process
   * Requires user to be authenticated (JWT cookies)
   * 
   * @param request - Passkey name
   * @returns Registration options including challenge
   * @throws Error if request fails
   */
  async beginRegistration(
    request: PasskeyRegistrationBeginRequest
  ): Promise<PasskeyRegistrationBeginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/passkey/register/begin`, {
        method: 'POST',
        headers: this.buildHeaders(),
        credentials: 'include', // Send auth cookies
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to begin registration: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[PasskeyService] Error beginning registration:', error);
      throw error;
    }
  }

  /**
   * Complete passkey registration with credential from browser
   * 
   * @param credential - Browser WebAuthn credential
   * @returns void on success
   * @throws Error if request fails
   */
  async completeRegistration(credential: PublicKeyCredential, passkeyName?: string): Promise<void> {
    try {
      // Extract attestation response
      const response = credential.response as AuthenticatorAttestationResponse;

      // Convert credential to backend format
      const requestBody: PasskeyRegistrationCompleteRequest = {
        id: credential.id,
        rawId: bufferToBase64Url(credential.rawId),
        type: credential.type as 'public-key',
        name: passkeyName, // Pass the user-provided name to be saved
        response: {
          clientDataJSON: bufferToBase64Url(response.clientDataJSON),
          attestationObject: bufferToBase64Url(response.attestationObject),
        },
      };

      const httpResponse = await fetch(`${this.baseUrl}/auth/passkey/register/complete`, {
        method: 'POST',
        headers: this.buildHeaders(),
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      if (!httpResponse.ok) {
        const errorText = await httpResponse.text();
        throw new Error(`Failed to complete registration: ${httpResponse.status} ${errorText}`);
      }

      console.log('[PasskeyService] Registration completed successfully');
    } catch (error) {
      console.error('[PasskeyService] Error completing registration:', error);
      throw error;
    }
  }

  /**
   * Full registration flow: begin + browser prompt + complete
   * Orchestrates the entire registration process
   * 
   * @param passkeyName - User-friendly name for the passkey
   * @returns void on success
   * @throws Error if any step fails
   */
  async registerPasskey(passkeyName: string): Promise<void> {
    // Check browser support
    if (!isWebAuthnSupported()) {
      throw new Error('Your browser does not support passkeys');
    }

    // Step 1: Get registration options from backend
    console.log('[PasskeyService] Beginning registration for:', passkeyName);
    const options = await this.beginRegistration({ name: passkeyName });

    // Step 2: Convert backend format to browser API format
    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge: base64UrlToUint8Array(options.challenge) as BufferSource,
      rp: {
        name: options.rpName,
        id: options.rpId,
      },
      user: {
        id: base64UrlToUint8Array(options.userId) as BufferSource,
        name: options.username,
        displayName: options.username,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 }, // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      timeout: 60000, // 60 seconds
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Prefer platform authenticators (Touch ID, Windows Hello)
        requireResidentKey: true,
        residentKey: 'required',
        userVerification: 'required',
      },
      attestation: 'none', // No attestation required
    };

    // Step 3: Trigger browser WebAuthn prompt
    console.log('[PasskeyService] Prompting user for credential creation');
    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error('No credential returned from browser');
    }

    // Step 4: Send credential to backend
    console.log('[PasskeyService] Sending credential to backend');
    await this.completeRegistration(credential, passkeyName);
  }

  // ============================================
  // Authentication Flow
  // ============================================

  /**
   * Start passkey authentication (passwordless login)
   * Public endpoint - no authentication required
   * 
   * @returns Authentication options including challenge
   * @throws Error if request fails
   */
  async beginAuthentication(): Promise<PasskeyAuthenticationBeginResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/passkey/authenticate/begin`, {
        method: 'POST',
        headers: this.buildHeaders(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to begin authentication: ${response.status} ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[PasskeyService] Error beginning authentication:', error);
      throw error;
    }
  }

  /**
   * Complete passkey authentication with assertion from browser
   * Sets authentication cookies on success
   * 
   * @param credential - Browser WebAuthn credential
   * @returns User data and authentication status
   * @throws Error if request fails
   */
  async completeAuthentication(credential: PublicKeyCredential): Promise<LoginResponse> {
    try {
      // Extract assertion response
      const response = credential.response as AuthenticatorAssertionResponse;

      // Convert credential to backend format
      const requestBody: PasskeyAuthenticationCompleteRequest = {
        rawId: bufferToBase64Url(credential.rawId),
        type: credential.type as 'public-key',
        response: {
          clientDataJSON: bufferToBase64Url(response.clientDataJSON),
          authenticatorData: bufferToBase64Url(response.authenticatorData),
          signature: bufferToBase64Url(response.signature),
          userHandle: response.userHandle ? bufferToBase64Url(response.userHandle) : undefined,
        },
      };

      const httpResponse = await fetch(`${this.baseUrl}/auth/passkey/authenticate/complete`, {
        method: 'POST',
        headers: this.buildHeaders(),
        credentials: 'include', // Receive auth cookies
        body: JSON.stringify(requestBody),
      });

      if (!httpResponse.ok) {
        const errorText = await httpResponse.text();
        throw new Error(`Failed to complete authentication: ${httpResponse.status} ${errorText}`);
      }

      const loginData: LoginResponse = await httpResponse.json();
      console.log('[PasskeyService] Authentication completed successfully');
      return loginData;
    } catch (error) {
      console.error('[PasskeyService] Error completing authentication:', error);
      throw error;
    }
  }

  /**
   * Full authentication flow: begin + browser prompt + complete
   * Orchestrates the entire passwordless login process
   * 
   * @returns User data on successful login
   * @throws Error if any step fails
   */
  async authenticateWithPasskey(): Promise<LoginResponse> {
    // Check browser support
    if (!isWebAuthnSupported()) {
      throw new Error('Your browser does not support passkeys');
    }

    // Step 1: Get authentication challenge from backend
    console.log('[PasskeyService] Beginning passkey authentication');
    const options = await this.beginAuthentication();

    // Step 2: Convert backend format to browser API format
    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge: base64UrlToUint8Array(options.challenge) as BufferSource,
      rpId: options.rpId,
      timeout: 60000, // 60 seconds
      userVerification: 'required',
    };

    // Step 3: Trigger browser WebAuthn prompt
    console.log('[PasskeyService] Prompting user for credential selection');
    const credential = await navigator.credentials.get({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error('No credential returned from browser');
    }

    // Step 4: Send assertion to backend and receive auth cookies
    console.log('[PasskeyService] Sending assertion to backend');
    return await this.completeAuthentication(credential);
  }

  // ============================================
  // Management Operations
  // ============================================

  /**
   * Get list of user's registered passkeys
   * Requires authentication
   * 
   * @returns Array of passkey DTOs
   * @throws Error if request fails
   */
  async listPasskeys(): Promise<PasskeyDTO[]> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/passkeys`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to list passkeys: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[PasskeyService] Error listing passkeys:', error);
      throw error;
    }
  }

  /**
   * Delete a specific passkey
   * Requires authentication and ownership
   * 
   * @param id - Passkey ID to delete
   * @returns void on success
   * @throws Error if request fails
   */
  async deletePasskey(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/passkeys/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to delete passkey: ${response.status} ${errorText}`);
      }

      console.log('[PasskeyService] Passkey deleted successfully:', id);
    } catch (error) {
      console.error('[PasskeyService] Error deleting passkey:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const passkeyService = new PasskeyService();
