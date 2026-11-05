const email = process.env.CONTACT_EMAIL;
const phone = process.env.CONTACT_PHONE;

if (!email) {
  throw new Error("CONTACT_EMAIL is not set");
}
if (!phone) {
  throw new Error("CONTACT_PHONE is not set");
}

export const contact = { email, phone };
