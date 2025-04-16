\c sinaidb

CREATE TABLE newRoute (
    route_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    grade VARCHAR(32),
    length INT,
    info VARCHAR(255)
);