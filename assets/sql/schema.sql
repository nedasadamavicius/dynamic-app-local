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
    wpid integer,
    foreign key (wpid) references workout_plan(id)
);

create table exercise (
    id integer primary key autoincrement,
    name text
);

create table workout_exercise (
    id integer primary key autoincrement,
    eid integer,
    wid integer,
    foreign key (eid) references exercise(id),
    foreign key (wid) references workout(id),
    unique (eid, wid)
);

create table exercise_set (
    id integer primary key autoincrement,
    set_number integer,
    weight real default 0.0,
    reps integer default 0,
    rir integer default 0,
    percentage real default 0.0,
    weid integer,
    foreign key (weid) references workout_exercise(id)
);