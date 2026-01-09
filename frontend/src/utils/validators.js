export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  return password.length >= 6;
};

export const validateLatitude = (lat) => {
  const num = parseFloat(lat);
  return !isNaN(num) && num >= -90 && num <= 90;
};

export const validateLongitude = (lon) => {
  const num = parseFloat(lon);
  return !isNaN(num) && num >= -180 && num <= 180;
};

export const validatePositiveNumber = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num > 0;
};

export const validateRoofArea = (area) => {
  const num = parseFloat(area);
  return !isNaN(num) && num >= 10 && num <= 10000; // reasonable roof area range
};

export const validateTilt = (tilt) => {
  const num = parseFloat(tilt);
  return !isNaN(num) && num >= 0 && num <= 90;
};
