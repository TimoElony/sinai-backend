psql -h db.vwpzcvemysspydbtlcxo.supabase.co -p 5432 -U postgres -d postgres

CREATE TABLE topo_locations_temp (
    id UUID PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    longitude FLOAT,
    latitude FLOAT
);

\copy topo_locations_temp(id, longitude, latitude) FROM 'C:\Users\timoe\OneDrive\Desktop\APPSINAI\walltopo_locations_upload.csv' DELIMITER ',' CSV HEADER;