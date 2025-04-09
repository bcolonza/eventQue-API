const { parse, format } = require('date-fns');

exports.convertTo24HourFormat = (time12h) => {
  try {
    const parsed = parse(time12h, 'hh:mm a', new Date());
    return format(parsed, 'HH:mm');
  } catch (error) {
    throw new Error('Invalid time format');
  }
};

exports.convertTo12HourFormat = (time24) => {
  try {
    const parsed = parse(time24, 'HH:mm', new Date());
    return format(parsed, 'hh:mm a').toUpperCase(); // → "06:30 PM"
  } catch {
    return time24; // fallback to original if invalid
  }
};
