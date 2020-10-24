DROP TABLE IF EXISTS location;

CREATE TABLE location (
  id SERIAL PRIMARY KEY,
  search_query VARCHAR(255),
  formatted_query VARCHAR(255),
  latitude FLOAT,
  longitude FLOAT
);

INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ('seattle', 'seattle', 47.6062095, -122.3320708);
INSERT INTO location (search_query, formatted_query, latitude, longitude) VALUES ('lynwood', 'lynwood', 33.930293, -118.2114603);