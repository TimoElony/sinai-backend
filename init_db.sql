CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE climbing_areas (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL,
    description TEXT,
    subtitle TEXT,
    access TEXT,
    title_image VARCHAR(256),
    access_map VARCHAR(256),
    walls_map VARCHAR(256),
    climbing_image VARCHAR(256),
    climbing_video VARCHAR(256),
    url VARCHAR(256),
    climbing_styles VARCHAR(64)[],
    access_from_dahab_minutes VARCHAR(64),
    number_of_routes INT,
    sectors_summary TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location GEOGRAPHY(POINT, 4326)
);

CREATE TABLE climbing_crags (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL,
    description TEXT,
    slogan TEXT,
    climbing_area VARCHAR(64) NOT NULL,
    access TEXT,
    main_descent TEXT,
    crag_map VARCHAR(256),
    walls_map VARCHAR(256),
    climbing_image VARCHAR(256),
    climbing_video VARCHAR(256),
    url VARCHAR(256),
    grade_distribution INT[],
    exposition VARCHAR(16)[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location GEOGRAPHY(POINT, 4326)
);

-- REFERENCES climbing_routes(id) of the climbing_routes column is commented out because i didnt load the climbing_routes table yet.
CREATE TABLE wall_topos (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL,
    climbing_routes_ids UUID[],
    topo_image VARCHAR(256),
    description TEXT,
    details TEXT,
    climbing_area_name VARCHAR(64),
    source VARCHAR(64),
    climbing_sector VARCHAR(64),
    climbing_subsector VARCHAR(64),
    slug_id INT,
    url VARCHAR(256),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    location GEOGRAPHY(POINT, 4326),
    climbing_area_id UUID REFERENCES climbing_areas(id)
);

-- REFERENCES climbing_routes(id) of the climbing_routes column is commented out because i didnt load the climbing_routes table yet.
CREATE TABLE detail_topos (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL,
    climbing_routes_ids UUID[],
    topo_image VARCHAR(256),
    description TEXT,
    details TEXT,
    climbing_area_name VARCHAR(64),
    source VARCHAR(64),
    climbing_sector VARCHAR(64),
    climbing_subsector VARCHAR(64),
    slug_id INT,
    url VARCHAR(256),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    climbing_area_id UUID REFERENCES climbing_areas(id)
);

CREATE TABLE climbing_routes (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(64) NOT NULL,
    number_in_topo FLOAT NOT NULL DEFAULT 0,
    grade_best_guess VARCHAR(16),
    bolts INT NOT NULL,
    gear_at_top TEXT,
    length INT NOT NULL DEFAULT 0,
    pitches INT NOT NULL DEFAULT 1,
    approach TEXT,
    plain_description TEXT,
    descent TEXT,
    setters TEXT,
    fa_grade VARCHAR(16),
    fa_day INT,
    fa_month INT,
    fa_year INT,
    climbing_area VARCHAR(64) NOT NULL,
    climbing_sector VARCHAR(64),
    climbing_subsector VARCHAR(64),
    wall_topo_ids UUID[],
    detail_topo_ids UUID[],
    number_in_topo_string VARCHAR(16),
    climbing_area_id UUID REFERENCES climbing_areas(id),
    route_edited_at TIMESTAMP,
    sources VARCHAR(64)[],
    url VARCHAR(256),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    positional_id FLOAT
);

-- alterations

-- add computed column to climbing_areas table
ALTER TABLE climbing_areas ADD COLUMN route_count INT;

UPDATE climbing_areas a
SET route_count = (
    SELECT COUNT(*) 
    FROM climbing_routes r 
    WHERE r.climbing_area = a.name
);

grade_distribution_map = ["3c", "4a", "4b", "4c", "5a", "5b", "5c", "6a", "6b", "6c", "7a", "7b", "7c", "8a", "8b", "8c", "9a", "9b", "9c"];




-- The following lines are used to copy data from CSV files into the tables created above.

\copy climbing_areas(id, name, description, subtitle, access, title_image, access_map, walls_map, climbing_image, climbing_video, url, climbing_styles, access_from_dahab_minutes, number_of_routes, sectors_summary, created_at, updated_at, location) FROM 'C:/Users/timoe/OneDrive/Desktop/APPSINAI/ClimbingAreas.csv' DELIMITER ',' CSV HEADER;

\copy climbing_crags(id, name, description, slogan, climbing_area, access, main_descent, crag_map, walls_map, climbing_image, climbing_video, url, grade_distribution, exposition, created_at, updated_at, location) FROM 'C:/Users/timoe/OneDrive/Desktop/APPSINAI/ClimbingCrags.csv' DELIMITER ',' CSV HEADER; 

\copy wall_topos(id, name, climbing_routes_ids, topo_image, description, details, climbing_area_name, source, climbing_sector, climbing_subsector, slug_id, url, created_at, updated_at, location) FROM 'C:\Users\timoe\OneDrive\Desktop\APPSINAI\WallTopos.csv' DELIMITER ',' CSV HEADER;

\copy detail_topos(id, name, climbing_routes_ids, topo_image, description, created_at, updated_at) FROM 'C:\Users\timoe\OneDrive\Desktop\APPSINAI\DetailTopos.csv' DELIMITER ',' CSV HEADER;

\copy climbing_routes(id, name, number_in_topo, grade_best_guess, bolts, gear_at_top, length, pitches, approach, plain_description, descent, setters, fa_grade, fa_day, fa_month, fa_year, climbing_area, climbing_sector, climbing_subsector, wall_topo_ids, detail_topo_ids, number_in_topo_string, route_edited_at, sources, url, created_at, updated_at, positional_id) FROM 'C:\Users\timoe\OneDrive\Desktop\APPSINAI\ClimbingRoutes.csv' DELIMITER ',' CSV HEADER;

ID,name,NumberInTopoFloat,GradeBestGuess,bolts,GearAtTop,Length,PitchesString,Approach,Plaindescription,Descent,Setters,FAGrade,Day,Month,year,ClimbingArea,ClimbingSector,Subsector,MultiReferenceWallTopoPictures,MultiReferencedetailTopoPictures,NumberInTopoString,Edited,sources,url,Created Date,Updated Date,positional_id_float
