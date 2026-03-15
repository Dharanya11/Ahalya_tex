const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const email = 'ahalya@gmail.com';
console.log(`Email: "${email}", Valid: ${isValidEmail(email)}`);
