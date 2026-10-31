-- PulseFit sample data. Safe to run repeatedly: ON CONFLICT DO NOTHING.

-- 30 exercises, 5 per muscle group
INSERT INTO exercises (name, muscle_group, sets, reps, difficulty, rest_seconds, description) VALUES
  ('Barbell Bench Press',     'Chest',  4, '6–8',        'Intermediate', 120, 'The classic upper-body strength builder. Control the bar down, drive it up.'),
  ('Incline Dumbbell Press',  'Chest',  3, '8–10',       'Beginner',      90, 'Targets the upper chest. Keep elbows at about 45° from your torso.'),
  ('Cable Crossover Fly',     'Chest',  3, '12–15',      'Beginner',      60, 'Constant tension through the full range. Squeeze hard at the middle.'),
  ('Weighted Dips',           'Chest',  3, '8–10',       'Advanced',     120, 'Lean forward slightly to bias the chest over the triceps.'),
  ('Push-Ups',                'Chest',  3, '15–20',      'Beginner',      60, 'No equipment needed. Brace your core and keep a straight line.'),

  ('Conventional Deadlift',   'Back',   5, '3–5',        'Advanced',     180, 'Full posterior-chain power. Hinge at the hips and keep the bar close.'),
  ('Pull-Ups',                'Back',   4, '6–10',       'Intermediate', 120, 'Pull your chest to the bar and lower all the way under control.'),
  ('Bent-Over Barbell Row',   'Back',   4, '8–10',       'Intermediate',  90, 'Flat back, pull to the lower ribs, pause for a beat at the top.'),
  ('Lat Pulldown',            'Back',   3, '10–12',      'Beginner',      75, 'Lead with your elbows and pull the bar to your upper chest.'),
  ('Seated Cable Row',        'Back',   3, '10–12',      'Beginner',      75, 'Sit tall and squeeze your shoulder blades together on each rep.'),

  ('Back Squat',              'Legs',   5, '5',          'Advanced',     180, 'King of leg day. Break at hips and knees together, hit depth.'),
  ('Romanian Deadlift',       'Legs',   4, '8–10',       'Intermediate', 120, 'Soft knees, push the hips back, feel the hamstring stretch.'),
  ('Walking Lunges',          'Legs',   3, '12 / leg',   'Beginner',      75, 'Long strides, upright torso, back knee kisses the floor.'),
  ('Leg Press',               'Legs',   4, '10–12',      'Beginner',      90, 'Feet shoulder-width; don''t lock out your knees at the top.'),
  ('Bulgarian Split Squat',   'Legs',   3, '8–10 / leg', 'Intermediate',  90, 'Rear foot on a bench. Brutal, effective, single-leg strength.'),

  ('EZ-Bar Curl',             'Arms',   3, '10–12',      'Beginner',      60, 'Elbows pinned to your sides. No swinging.'),
  ('Skull Crushers',          'Arms',   3, '10–12',      'Intermediate',  60, 'Lower the bar to your forehead slowly; extend through the triceps.'),
  ('Hammer Curls',            'Arms',   3, '12',         'Beginner',      45, 'Neutral grip builds the brachialis and forearms.'),
  ('Cable Triceps Pushdown',  'Arms',   3, '12–15',      'Beginner',      45, 'Lock your upper arms and fully extend at the bottom.'),
  ('Close-Grip Bench Press',  'Arms',   4, '6–8',        'Advanced',      90, 'Heavy triceps work. Hands just inside shoulder width.'),

  ('Plank Hold',              'Core',   3, '60 s',       'Beginner',      45, 'Squeeze glutes and abs; keep a straight line from head to heels.'),
  ('Hanging Leg Raise',       'Core',   3, '12–15',      'Advanced',      60, 'Raise your legs without swinging. Curl the pelvis up at the top.'),
  ('Ab Wheel Rollout',        'Core',   3, '10',         'Intermediate',  60, 'Roll out only as far as you can keep your lower back flat.'),
  ('Russian Twists',          'Core',   3, '20',         'Beginner',      45, 'Lean back, lift your feet, rotate from the ribs.'),
  ('Pallof Press',            'Core',   3, '12 / side',  'Intermediate',  45, 'Anti-rotation core strength. Press out and resist the cable.'),

  ('Rowing Intervals',        'Cardio', 6, '250 m',      'Intermediate',  90, 'Hard 250 m efforts. Legs, then hips, then arms.'),
  ('Assault Bike Sprints',    'Cardio', 8, '20 s',       'Advanced',      60, 'All-out 20-second sprints. Your lungs will remember this one.'),
  ('Jump Rope',               'Cardio', 5, '2 min',      'Beginner',      60, 'Light on the toes; turn the rope with your wrists.'),
  ('Box Jumps',               'Cardio', 4, '8',          'Intermediate',  75, 'Explode up, land soft, step back down.'),
  ('Burpees',                 'Cardio', 4, '12',         'Intermediate',  60, 'Chest to the floor, jump to the sky. Repeat.')
ON CONFLICT (name) DO NOTHING;

-- 10 classes for the current week (Monday = start of week)
WITH week AS (SELECT date_trunc('week', now()) AS monday)
INSERT INTO classes (title, coach_name, class_type, start_time, duration_minutes, capacity, intensity)
SELECT c.title, c.coach, c.type, week.monday + c.offset_interval, c.duration, c.capacity, c.intensity
FROM week, (VALUES
  ('Sunrise Spin',        'Maya Rodriguez', 'Spin',     interval '0 days 06:30', 45, 20, 'High'),
  ('Lunch Burn HIIT',     'Dre Kofi',       'HIIT',     interval '0 days 12:15', 30, 16, 'Max'),
  ('Flow & Restore',      'Ana Lopes',      'Yoga',     interval '1 days 18:30', 60, 24, 'Low'),
  ('Fight Club Basics',   'Leo Mensah',     'Boxing',   interval '2 days 07:00', 50, 14, 'High'),
  ('Barbell Strength 101','Sam Turner',     'Strength', interval '2 days 18:00', 60, 12, 'Moderate'),
  ('Tabata Inferno',      'Dre Kofi',       'HIIT',     interval '3 days 19:00', 40, 16, 'Max'),
  ('Rhythm Ride',         'Maya Rodriguez', 'Spin',     interval '4 days 18:30', 45, 20, 'High'),
  ('Friday Night Fights', 'Leo Mensah',     'Boxing',   interval '4 days 18:00', 60, 14, 'High'),
  ('Weekend Warrior',     'Sam Turner',     'Strength', interval '5 days 09:00', 45, 20, 'Moderate'),
  ('Slow Sunday Stretch', 'Ana Lopes',      'Yoga',     interval '6 days 10:00', 60, 24, 'Low')
) AS c(title, coach, type, offset_interval, duration, capacity, intensity)
ON CONFLICT (title, start_time) DO NOTHING;
