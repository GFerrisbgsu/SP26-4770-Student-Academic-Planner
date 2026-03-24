/**
 * WebAuthn utility functions for encoding/decoding between
 * base64url strings (backend format) and ArrayBuffer/Uint8Array (browser format)
 */

/**
 * Convert base64url string to Uint8Array
 * Backend sends challenges and IDs in base64url format
 * Browser WebAuthn API expects Uint8Array/ArrayBuffer
 * 
 * @param base64url - Base64url encoded string
 * @returns Uint8Array buffer
 */
export function base64UrlToUint8Array(base64url: string): Uint8Array {
  // Convert base64url to base64 (replace URL-safe chars)
  const base64 = base64url
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  // Add padding if needed
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const base64Padded = base64 + padding;
  
  // Decode base64 to binary string
  const binaryString = atob(base64Padded);
  
  // Convert binary string to Uint8Array
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  return bytes;
}

/**
 * Convert Uint8Array to base64url string
 * Browser WebAuthn API returns Uint8Array/ArrayBuffer
 * Backend expects base64url encoded strings
 * 
 * @param buffer - Uint8Array buffer
 * @returns Base64url encoded string
 */
export function uint8ArrayToBase64Url(buffer: Uint8Array): string {
  // Convert Uint8Array to binary string
  let binaryString = '';
  for (let i = 0; i < buffer.length; i++) {
    binaryString += String.fromCharCode(buffer[i]);
  }
  
  // Encode to base64
  const base64 = btoa(binaryString);
  
  // Convert to base64url (URL-safe)
  const base64url = base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, ''); // Remove padding
  
  return base64url;
}

/**
 * Convert ArrayBuffer to base64url string
 * Convenience wrapper for bufferToBase64Url(new Uint8Array(buffer))
 * 
 * @param buffer - ArrayBuffer from WebAuthn API
 * @returns Base64url encoded string
 */
export function bufferToBase64Url(buffer: ArrayBuffer): string {
  return uint8ArrayToBase64Url(new Uint8Array(buffer));
}

/**
 * Check if WebAuthn is supported in the current browser
 * Required for passkey functionality
 * 
 * @returns true if WebAuthn is available, false otherwise
 */
export function isWebAuthnSupported(): boolean {
  // Check for SSR safety (window may not exist)
  if (typeof window === 'undefined') {
    return false;
  }
  
  // Check for PublicKeyCredential support
  if (window.PublicKeyCredential === undefined) {
    return false;
  }
  
  // Check for credentials API
  if (navigator.credentials === undefined) {
    return false;
  }
  
  return true;
}

/**
 * Check if conditional mediation (autofill) is supported
 * Allows passkeys to appear in username field autocomplete
 * 
 * @returns Promise<boolean> true if conditional mediation is available
 */
export async function isConditionalMediationSupported(): Promise<boolean> {
  if (!isWebAuthnSupported()) {
    return false;
  }
  
  try {
    // Check if browser supports conditional mediation
    const available = await PublicKeyCredential.isConditionalMediationAvailable?.();
    return available === true;
  } catch (error) {
    console.warn('Error checking conditional mediation support:', error);
    return false;
  }
}

/**
 * Get user-friendly error message for WebAuthn errors
 * Translates technical DOMException names to readable messages
 * 
 * @param error - Error from WebAuthn API
 * @returns User-friendly error message
 */
export function getWebAuthnErrorMessage(error: unknown): string {
  if (!(error instanceof Error)) {
    return 'An unknown error occurred';
  }
  
  // Handle DOMException errors from WebAuthn API
  if (error.name === 'NotAllowedError') {
    return 'Authentication was cancelled or timed out';
  }
  
  if (error.name === 'InvalidStateError') {
    return 'This passkey is already registered on this device';
  }
  
  if (error.name === 'NotSupportedError') {
    return 'Your browser does not support passkeys';
  }
  
  if (error.name === 'SecurityError') {
    return 'Security error: Passkeys require a secure connection (HTTPS)';
  }
  
  if (error.name === 'AbortError') {
    return 'The operation was aborted';
  }
  
  if (error.name === 'ConstraintError') {
    return 'The authenticator does not meet the requirements';
  }
  
  if (error.name === 'NetworkError') {
    return 'Network error occurred during authentication';
  }
  
  // Return original message if not a known WebAuthn error
  return error.message || 'An error occurred with passkey authentication';
}
