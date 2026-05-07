const Booking = require('../../models/Booking');

const SHIFT_START = 9 * 60;   // 540 minutes = 09:00
const SHIFT_END = 19 * 60;    // 1140 minutes = 19:00
const SLOT_BUFFER_MINUTES = 30;

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

function isSlotBlockedByBooking(slotStart, slotEnd, booking) {
  const slotStartMins = timeToMinutes(slotStart);
  const slotEndMins = timeToMinutes(slotEnd);
  const blockedStartMins = timeToMinutes(booking.startTime) - SLOT_BUFFER_MINUTES;
  const blockedEndMins = timeToMinutes(booking.endTime) + SLOT_BUFFER_MINUTES;

  return slotStartMins < blockedEndMins && slotEndMins > blockedStartMins;
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

  // 2. Generate slots with a buffer after each possible appointment
  while (currentMins + totalDuration <= SHIFT_END) {
    const slotStartStr = minutesToTime(currentMins);
    const slotEndStr = minutesToTime(currentMins + totalDuration);

    let isAvailable = true;

    // 4a is already checked by while condition (currentMins + totalDuration <= SHIFT_END)

    // 4b. Check overlap with existing bookings, including the required buffer
    for (const b of bookings) {
      if (isSlotBlockedByBooking(slotStartStr, slotEndStr, b)) {
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
      startTime: slotStartStr,
      endTime: slotEndStr,
      label: `${slotStartStr} to ${slotEndStr}`,
      available: isAvailable
    });

    currentMins += totalDuration + SLOT_BUFFER_MINUTES;
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

  const bookings = await Booking.find({
    barber: barberId,
    date: date,
    status: { $ne: 'cancelled' }
  });

  for (const b of bookings) {
    if (isSlotBlockedByBooking(startTime, endTime, b)) {
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
  isSlotBlockedByBooking,
  timeToMinutes,
  minutesToTime,
  SLOT_BUFFER_MINUTES
};
