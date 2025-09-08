export class NullCredentialError extends Error {
  constructor(message?: string) {
    super(message || "No credential returned from provider");
    this.name = "NullCredentialError";
  }
}

export class NoUserError extends Error {
  constructor(message?: string) {
    super(message || "No user information returned from signInWithPopup");
    this.name = "NoUserError";
  }
}
