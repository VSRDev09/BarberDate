ALTER TABLE weekly_schedules
ADD COLUMN lunch_start TIME NULL;

ALTER TABLE weekly_schedules
ADD COLUMN lunch_end TIME NULL;

UPDATE available_time_slots
SET end_time = (start_time + INTERVAL '45 minutes')::time;
