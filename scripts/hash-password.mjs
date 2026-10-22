// Membuat hash bcrypt untuk password (darurat: reset password superadmin via SQL)
// Pemakaian: npm run hash -- "PasswordBaru#123"
import bcrypt from "bcryptjs";
const pw = process.argv[2];
if (!pw) { console.error('Pemakaian: npm run hash -- "PasswordBaru"'); process.exit(1); }
console.log(bcrypt.hashSync(pw, 10));
