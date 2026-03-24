/**
 * Passkey-related TypeScript types for WebAuthn authentication
 * Maps to backend PasskeyDTOs and WebAuthn API structures
 */

// ============================================
// Backend DTO Types
// ============================================

/**
 * Passkey stored in database (matches backend PasskeyDTO.java)
 */
export interface PasskeyDTO {
  id: number;
  name: string;
  credentialId: string;
  createdAt: string; // ISO 8601 format
}

// ============================================
// Registration Flow Types
// ============================================

/**
 * Request to start passkey registration
 * Sent to: POST /api/auth/passkey/register/begin
 */
export interface PasskeyRegistrationBeginRequest {
  name: string; // User-friendly name for the passkey (e.g., "My Laptop")
}

/**
 * Response from registration begin endpoint
 * Contains WebAuthn challenge and relying party info
 */
export interface PasskeyRegistrationBeginResponse {
  challenge: string; // Base64url encoded challenge
  userId: string; // Base64url encoded user ID
  username: string; // User's username
  rpId: string; // Relying Party ID (e.g., "localhost")
  rpName: string; // Relying Party display name
}

/**
 * WebAuthn credential from browser's navigator.credentials.create()
 * Sent to: POST /api/auth/passkey/register/complete
 */
export interface PasskeyRegistrationCompleteRequest {
  id: string; // Credential ID (base64url)
  rawId: string; // Raw credential ID (base64url)
  type: 'public-key';
  name?: string; // User-friendly name for the passkey
  response: {
    clientDataJSON: string; // Base64url encoded
    attestationObject: string; // Base64url encoded
  };
}

// ============================================
// Authentication Flow Types
// ============================================

/**
 * Response from authentication begin endpoint
 * Sent to: POST /api/auth/passkey/authenticate/begin
 */
export interface PasskeyAuthenticationBeginResponse {
  challenge: string; // Base64url encoded challenge
  rpId: string; // Relying Party ID
}

/**
 * WebAuthn assertion from browser's navigator.credentials.get()
 * Sent to: POST /api/auth/passkey/authenticate/complete
 */
export interface PasskeyAuthenticationCompleteRequest {
  rawId: string; // Raw credential ID (base64url)
  type: 'public-key';
  response: {
    clientDataJSON: string; // Base64url encoded
    authenticatorData: string; // Base64url encoded
    signature: string; // Base64url encoded
    userHandle?: string; // Base64url encoded (optional)
  };
}

// ============================================
// Browser API Types
// ============================================

/**
 * PublicKeyCredentialCreationOptions to pass to navigator.credentials.create()
 * Built from PasskeyRegistrationBeginResponse
 */
export interface PublicKeyCredentialCreationOptionsExtended
  extends Omit<PublicKeyCredentialCreationOptions, 'challenge' | 'user'> {
  challenge: BufferSource;
  user: {
    id: BufferSource;
    name: string;
    displayName: string;
  };
  rp: {
    name: string;
    id?: string;
  };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout?: number;
  authenticatorSelection?: AuthenticatorSelectionCriteria;
}

/**
 * PublicKeyCredentialRequestOptions to pass to navigator.credentials.get()
 * Built from PasskeyAuthenticationBeginResponse
 */
export interface PublicKeyCredentialRequestOptionsExtended
  extends Omit<PublicKeyCredentialRequestOptions, 'challenge'> {
  challenge: BufferSource;
  rpId?: string;
  timeout?: number;
  userVerification?: UserVerificationRequirement;
}
