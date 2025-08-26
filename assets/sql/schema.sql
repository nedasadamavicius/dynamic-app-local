create table workout_plan (
    id integer primary key autoincrement,
    name text,
    last_used date default '2000-12-30',
    active boolean default 0
);

create table workout (
    id integer primary key autoincrement,
    name text,
    last_used date default '2000-12-30',
    counter integer default 0,
    wpid integer not null,
    foreign key (wpid) references workout_plan(id) on delete cascade -- if workout plan is removed, remove workout entry
);

create table exercise (
    id integer primary key autoincrement,
    name text collate nocase unique -- exercise name must be unique no matter the case, no duplicates allowed
);

create table workout_exercise (
    id integer primary key autoincrement,
    eid integer not null,
    wid integer not null,
    foreign key (eid) references exercise(id) on delete cascade, -- if exercise is removed, remove associated entry
    foreign key (wid) references workout(id) on delete cascade, -- if workout is removed, remove associated entry
    unique (eid, wid)
);

create table exercise_set (
    id integer primary key autoincrement,
    set_number integer,
    weight real default 0.0,
    reps integer default 0,
    rir integer default 0,
    percentage real default 0.0,
    weid integer not null,
    foreign key (weid) references workout_exercise(id) on delete cascade -- if an workout_exercise entry is removed, remove associated sets
);

create index if not exists idx_workout_wpid on workout(wpid);
create index if not exists idx_we_wid on workout_exercise(wid);
create index if not exists idx_we_eid on workout_exercise(eid);
create index if not exists idx_exercise_set_weid on exercise_set(weid);

create table one_rep_max (
    id integer primary key autoincrement,
    eid integer not null unique,
    weight real default 0.0,
    foreign key (eid) references exercise(id) on delete cascade
);