begin transaction;

-- 1. create a workout plan
insert into workout_plan (name) values ('Upper/Lower 3X');
-- get workout_plan ID
select last_insert_rowid(); -- assume its 1

-- 2. create workouts linked to the plan
insert into workout (name, wpid) values ('Upper A', 1);
insert into workout (name, wpid) values ('Lower A', 1);
insert into workout (name, wpid) values ('Upper B', 1);

-- capture workout IDs
-- Upper A = 1, Lower A = 2, Upper B = 3 

-- 3. create exercise library
insert into exercise (name) values ('Bench Press');
insert into exercise (name) values ('Barbell Row');
insert into exercise (name) values ('Overhead Press');
insert into exercise (name) values ('Squat');
insert into exercise (name) values ('Romanian Deadlift');
insert into exercise (name) values ('Pull-ups');

-- capture exercise IDs
-- Bench = 1, Row = 2, OHP = 3, Squat = 4, RDL = 5, Pull-ups = 6

-- 4. link exercises to workouts
-- Upper A -> Bench, Row
insert into workout_exercise (eid, wid) values (1, 1);
insert into workout_exercise (eid, wid) values (2, 1);

-- Lower A -> Squat, RDL
insert into workout_exercise (eid, wid) values (4, 2);
insert into workout_exercise (eid, wid) values (5, 2);

-- Upper B -> OHP, Pull-ups
insert into workout_exercise (eid, wid) values (3, 3);
insert into workout_exercise (eid, wid) values (6, 3);

-- 5. add 3 empty sets per workout_exercise
-- assume workout_exercise IDs = 1 to 6
insert into exercise_set (set_number, weid) values (1, 1), (2, 1), (3, 1);
insert into exercise_set (set_number, weid) values (1, 2), (2, 2), (3, 2);
insert into exercise_set (set_number, weid) values (1, 3), (2, 3), (3, 3);
insert into exercise_set (set_number, weid) values (1, 4), (2, 4), (3, 4);
insert into exercise_set (set_number, weid) values (1, 5), (2, 5), (3, 5);
insert into exercise_set (set_number, weid) values (1, 6), (2, 6), (3, 6);

insert into settings (id) values (1);

commit;