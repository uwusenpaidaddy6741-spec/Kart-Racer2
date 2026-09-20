CREATE TABLE IF NOT EXISTS leaderboard (

    id INTEGER PRIMARY KEY AUTOINCREMENT,

    track INTEGER NOT NULL,

    name TEXT NOT NULL,

    time REAL NOT NULL,

    created_at DATETIME
        DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX IF NOT EXISTS
leaderboard_track_time
ON leaderboard (
    track,
    time
);
