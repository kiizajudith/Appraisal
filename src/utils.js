// utils.js
export function encodeEmail(email) {
  return email.replace(/\./g, "_dot_").replace(/@/g, "_at_");
}

export function decodeEmail(encodedEmail) {
  return encodedEmail.replace(/_dot_/g, ".").replace(/_at_/g, "@");
}
