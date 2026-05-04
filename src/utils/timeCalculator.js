const Booking = require('../../models/Booking');

const SHIFT_START = 9 * 60;   // 540 minutes = 09:00
const SHIFT_END = 19 * 60;    // 1140 minutes = 19:00

// Convert "HH:MM" string to total minutes since midnight
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Convert total minutes to "HH:MM" string
function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Check if two time ranges overlap (all params are "HH:MM" strings)
// Returns true if [start1,end1] and [start2,end2] overlap
function isTimeOverlapping(start1, end1, start2, end2) {
  const s1 = timeToMinutes(start1);
  const e1 = timeToMinutes(end1);
  const s2 = timeToMinutes(start2);
  const e2 = timeToMinutes(end2);
  
  // Overlap occurs if A starts before B ends AND A ends after B starts
  return s1 < e2 && e1 > s2;
}

// Given an array of service documents, sum all duration fields
// Returns total duration in minutes
function calculateTotalDuration(services) {
  return services.reduce((total, service) => total + (service.duration || 0), 0);
}

// Given startTime "HH:MM" and totalDurationMinutes number
// Returns endTime as "HH:MM"
function calculateEndTime(startTime, totalDurationMinutes) {
  const startMins = timeToMinutes(startTime);
  const endMins = startMins + totalDurationMinutes;
  return minutesToTime(endMins);
}

// THE MAIN SLOT GENERATION FUNCTION
async function generateAvailableSlots(date, barberId, totalDuration) {
  // 1. Fetch all bookings for this barber on this date where status != "cancelled"
  const bookings = await Booking.find({
    barber: barberId,
    date: date,
    status: { $ne: 'cancelled' }
  });

  const slots = [];
  let currentMins = SHIFT_START;

  const now = new Date();
  const currentDateStr = now.toISOString().split('T')[0];
  const nowMins = now.getHours() * 60 + now.getMinutes();

  // 2. Generate slots spaced by totalDuration
  while (currentMins + totalDuration <= SHIFT_END) {
    const slotStartStr = minutesToTime(currentMins);
    const slotEndStr = minutesToTime(currentMins + totalDuration);

    let isAvailable = true;

    // 4a is already checked by while condition (currentMins + totalDuration <= SHIFT_END)

    // 4b. Check overlap with existing bookings
    for (const b of bookings) {
      if (isTimeOverlapping(slotStartStr, slotEndStr, b.startTime, b.endTime)) {
        isAvailable = false;
        break;
      }
    }

    // 4c. Check if date is today AND slot time already passed
    if (date === currentDateStr && currentMins <= nowMins) {
      isAvailable = false;
    }

    slots.push({
      time: slotStartStr,
      available: isAvailable
    });

    currentMins += totalDuration;
  }

  return slots;
}

// Check if a specific time slot is free for a barber
async function checkSlotAvailability(barberId, date, startTime, endTime) {
  const startMins = timeToMinutes(startTime);
  const endMins = timeToMinutes(endTime);

  // Check shift boundaries
  if (startMins < SHIFT_START || endMins > SHIFT_END) {
    return { available: false, conflictingBooking: null };
  }

  // Check past time if today
  const now = new Date();
  const currentDateStr = now.toISOString().split('T')[0];
  const nowMins = now.getHours() * 60 + now.getMinutes();
  if (date === currentDateStr && startMins <= nowMins) {
    return { available: false, conflictingBooking: null };
  }

  const conflictingBooking = await Booking.findOne({
    barber: barberId,
    date: date,
    status: { $ne: 'cancelled' },
    $expr: {
      $and: [
        { $lt: [{ $toInt: { $arrayElemAt: [{ $split: ["$startTime", ":"] }, 0] } }, endMins / 60 ] }, // approximation, we need actual overlap logic in query or fetch all and filter array. 
        // Better to fetch all and filter since checking overlap in raw strings is tricky across boundaries
      ]
    }
  }); // Since we need to accurately check overlap, let's just use the JS function 

  // Better approach for overlap:
  const bookings = await Booking.find({
    barber: barberId,
    date: date,
    status: { $ne: 'cancelled' }
  });

  for (const b of bookings) {
    if (isTimeOverlapping(startTime, endTime, b.startTime, b.endTime)) {
      return { available: false, conflictingBooking: b };
    }
  }

  return { available: true, conflictingBooking: null };
}

module.exports = { 
  calculateTotalDuration, 
  calculateEndTime,
  generateAvailableSlots, 
  checkSlotAvailability, 
  isTimeOverlapping,
  timeToMinutes,
  minutesToTime
};
