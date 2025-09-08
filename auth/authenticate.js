function validateRegisterInput(data) {
  let errors = {};

  // Name validation
  if (!data.name || data.name.trim() === '') {
    errors.name = 'Name field is required';
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = 'Valid email is required';
  }

  // Password validation
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!data.password || !passwordRegex.test(data.password)) {
    errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, and a number';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}

function validateLoginInput(data) {
  let errors = {};

  if (!data.email || data.email.trim() === '') {
    errors.email = 'Email is required';
  }

  if (!data.password || data.password.trim() === '') {
    errors.password = 'Password is required';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0
  };
}

module.exports = {
  validateRegisterInput,
  validateLoginInput
};