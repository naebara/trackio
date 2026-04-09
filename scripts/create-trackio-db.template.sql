-- Trackio PostgreSQL bootstrap template
-- Replace PAROLA_GENERATA_16_CHARS before running.

CREATE ROLE trackio_user WITH LOGIN PASSWORD 'PAROLA_GENERATA_16_CHARS';
CREATE DATABASE trackio OWNER trackio_user;
GRANT ALL PRIVILEGES ON DATABASE trackio TO trackio_user;
\c trackio
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
