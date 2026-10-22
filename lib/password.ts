export function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "Password minimal 8 karakter.";
  if (pw.length > 72) return "Password maksimal 72 karakter.";
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return "Password harus mengandung huruf dan angka.";
  return null;
}
