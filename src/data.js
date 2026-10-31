export const MUSCLE_GROUPS = ['All', 'Chest', 'Back', 'Legs', 'Arms', 'Core', 'Cardio']

// Exercises, today's workout, activity and user data now come from the database (/api).
// What remains here is still static: progress history, classes, achievements and quotes.

export const STRENGTH_PROGRESS = [
  { week: 'W1', bench: 65, squat: 90, deadlift: 110 },
  { week: 'W2', bench: 67.5, squat: 92.5, deadlift: 115 },
  { week: 'W3', bench: 67.5, squat: 97.5, deadlift: 120 },
  { week: 'W4', bench: 70, squat: 100, deadlift: 122.5 },
  { week: 'W5', bench: 72.5, squat: 102.5, deadlift: 127.5 },
  { week: 'W6', bench: 72.5, squat: 107.5, deadlift: 130 },
  { week: 'W7', bench: 75, squat: 110, deadlift: 135 },
  { week: 'W8', bench: 77.5, squat: 112.5, deadlift: 140 },
  { week: 'W9', bench: 77.5, squat: 117.5, deadlift: 142.5 },
  { week: 'W10', bench: 80, squat: 120, deadlift: 147.5 },
  { week: 'W11', bench: 82.5, squat: 122.5, deadlift: 152.5 },
  { week: 'W12', bench: 85, squat: 127.5, deadlift: 160 },
]

export const PERSONAL_RECORDS = [
  { lift: 'Deadlift', value: '160 kg', date: 'Oct 18', delta: '+7.5 kg', tier: 'gold' },
  { lift: 'Back Squat', value: '127.5 kg', date: 'Oct 16', delta: '+5 kg', tier: 'gold' },
  { lift: 'Bench Press', value: '85 kg', date: 'Oct 14', delta: '+2.5 kg', tier: 'silver' },
  { lift: '5K Run', value: '22:41', date: 'Oct 09', delta: '−38 s', tier: 'silver' },
  { lift: 'Pull-Ups', value: '15 reps', date: 'Oct 02', delta: '+2 reps', tier: 'bronze' },
  { lift: 'Plank', value: '3:30', date: 'Sep 27', delta: '+25 s', tier: 'bronze' },
]

export const CLASS_TYPES = {
  Yoga: { color: 'violet', emoji: '🧘', intensity: 'Low' },
  HIIT: { color: 'ember', emoji: '⚡', intensity: 'Max' },
  Spin: { color: 'cyan', emoji: '🚴', intensity: 'High' },
  Boxing: { color: 'lime', emoji: '🥊', intensity: 'High' },
}

export const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export const CLASSES = [
  { id: 'c1', day: 'Mon', time: '06:30', type: 'Spin', title: 'Sunrise Spin', coach: 'Maya R.', duration: 45, spots: 4, capacity: 20 },
  { id: 'c2', day: 'Mon', time: '12:15', type: 'HIIT', title: 'Lunch Burn', coach: 'Dre K.', duration: 30, spots: 9, capacity: 16 },
  { id: 'c3', day: 'Mon', time: '18:30', type: 'Yoga', title: 'Flow & Restore', coach: 'Ana L.', duration: 60, spots: 12, capacity: 24 },
  { id: 'c4', day: 'Tue', time: '07:00', type: 'Boxing', title: 'Fight Club Basics', coach: 'Leo M.', duration: 50, spots: 2, capacity: 14 },
  { id: 'c5', day: 'Tue', time: '17:45', type: 'Spin', title: 'Climb Ride', coach: 'Maya R.', duration: 45, spots: 0, capacity: 20 },
  { id: 'c6', day: 'Tue', time: '19:00', type: 'HIIT', title: 'Tabata Inferno', coach: 'Dre K.', duration: 40, spots: 6, capacity: 16 },
  { id: 'c7', day: 'Wed', time: '06:30', type: 'Yoga', title: 'Power Vinyasa', coach: 'Ana L.', duration: 60, spots: 10, capacity: 24 },
  { id: 'c8', day: 'Wed', time: '18:00', type: 'Boxing', title: 'Pads & Power', coach: 'Leo M.', duration: 50, spots: 5, capacity: 14 },
  { id: 'c9', day: 'Thu', time: '07:00', type: 'HIIT', title: 'Metcon 30', coach: 'Sam T.', duration: 30, spots: 3, capacity: 16 },
  { id: 'c10', day: 'Thu', time: '18:30', type: 'Spin', title: 'Rhythm Ride', coach: 'Maya R.', duration: 45, spots: 11, capacity: 20 },
  { id: 'c11', day: 'Fri', time: '12:00', type: 'Yoga', title: 'Desk Detox', coach: 'Ana L.', duration: 30, spots: 15, capacity: 24 },
  { id: 'c12', day: 'Fri', time: '18:00', type: 'Boxing', title: 'Friday Night Fights', coach: 'Leo M.', duration: 60, spots: 1, capacity: 14 },
  { id: 'c13', day: 'Sat', time: '09:00', type: 'HIIT', title: 'Weekend Warrior', coach: 'Sam T.', duration: 45, spots: 7, capacity: 20 },
  { id: 'c14', day: 'Sat', time: '10:30', type: 'Spin', title: 'Endurance Ride', coach: 'Maya R.', duration: 60, spots: 8, capacity: 20 },
  { id: 'c15', day: 'Sun', time: '10:00', type: 'Yoga', title: 'Slow Sunday Stretch', coach: 'Ana L.', duration: 60, spots: 18, capacity: 24 },
]

export const ACHIEVEMENTS = [
  { id: 'a1', name: 'First Rep', desc: 'Logged your first workout', icon: 'Zap', unlocked: true },
  { id: 'a2', name: 'On Fire', desc: '7-day streak', icon: 'Flame', unlocked: true },
  { id: 'a3', name: 'Iron Will', desc: '50 workouts completed', icon: 'Dumbbell', unlocked: true },
  { id: 'a4', name: 'PR Machine', desc: 'Set 5 personal records', icon: 'Trophy', unlocked: true },
  { id: 'a5', name: 'Early Bird', desc: '10 workouts before 7 am', icon: 'Sunrise', unlocked: true },
  { id: 'a6', name: 'Class Act', desc: 'Attend 10 classes', icon: 'CalendarCheck', unlocked: false, progress: 0.7 },
  { id: 'a7', name: 'Centurion', desc: '100 workouts completed', icon: 'Medal', unlocked: false, progress: 0.64 },
  { id: 'a8', name: 'Unstoppable', desc: '30-day streak', icon: 'Rocket', unlocked: false, progress: 0.4 },
]

export const QUOTES = [
  { text: 'The only bad workout is the one that didn’t happen.', author: 'Unknown' },
  { text: 'Strength doesn’t come from what you can do. It comes from overcoming the things you once thought you couldn’t.', author: 'Rikki Rogers' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { text: 'Success isn’t always about greatness. It’s about consistency.', author: 'Dwayne Johnson' },
  { text: 'Take care of your body. It’s the only place you have to live.', author: 'Jim Rohn' },
  { text: 'You don’t have to be extreme, just consistent.', author: 'Unknown' },
  { text: 'The body achieves what the mind believes.', author: 'Napoleon Hill' },
]

