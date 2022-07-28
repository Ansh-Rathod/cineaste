SET CLIENT_ENCODING TO 'utf8';
drop schema public cascade;
create schema public;

-- eR5vZ-JcXKaE5Mv
-- pg_dump -U postgres --table=movies --data-only --column-inserts postgres > data.sql
-- pg_dump -U username -h localhost databasename >> sqlfile.sql
-- \df public.*
-- pg_dump -U postgres -h localhost -p 5432 postgres > backup.sql
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ansh;
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ansh;
-- GRANT ALL PRIVILEGES ON DATABASE postgres to ansh;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ansh;
-- 152313
-- 154554
CREATE TABLE users (
  id            varchar(255) PRIMARY KEY NOT NULL UNIQUE,
  username      text NOT NULL UNIQUE,
  display_name  text NOT NULL,
  email         varchar(255) NOT NULL UNIQUE,
  avatar_url    text,
  backdrop_url  text,
  bio           text,
  followers     integer NOT NULL DEFAULT 0,
  following     integer NOT NULL DEFAULT 0,
  reviews       integer NOT NULL DEFAULT 0,
  created       timestamptz NOT NULL DEFAULT current_timestamp
);



CREATE TABLE movies(
  id         varchar(255) PRIMARY KEY NOT NULL,
  title      text NOT NULL,
  release    text,
  rating     float4 NOT NULL,
  popularity float4 NOT NULL,
  poster     text,
  language   text,
  backdrop   text,
  overview   text,
  genres     text[] DEFAULT '{}',
  adult      boolean NOT NULL DEFAULT false,
  created    timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE TABLE anime(
  id         varchar(255) PRIMARY KEY NOT NULL,
  title      text NOT NULL,
  type       text not null,
  release    text,
  rating     float4 NOT NULL,
  popularity float4 NOT NULL,
  poster     text,
  language   text,
  backdrop   text,
  overview   text,
  genres     text[] DEFAULT '{}',
  adult      boolean NOT NULL DEFAULT false,
  created    timestamptz NOT NULL DEFAULT current_timestamp
);


CREATE TABLE tvshows(
  id         varchar(255) PRIMARY KEY NOT NULL,
  title      text NOT NULL,
  release    text,
  rating     float4 NOT NULL,
  popularity float4 NOT NULL,
  poster     text,
  language   text,
  backdrop   text,
  overview   text,
  genres     text[] DEFAULT '{}',
  created    timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE TABLE trending(
  id         varchar(255) PRIMARY KEY NOT NULL,
  title      text NOT NULL,
  release    text,
  popularity float4 NOT NULL,
  rating     float4 NOT NULL,
  poster     text,
  language   text,
  backdrop   text,
  overview   text,
  genres     text[] DEFAULT '{}',
  date       text,
  type       text NOT NULL
);


create index moviestable on movies(id,title);
create index tvtable on tvshows(id,title);



-- followers table alter--
  
ALTER TABLE followers
  ADD CONSTRAINT follower_fk FOREIGN KEY (follower_id) REFERENCES users (id)
  MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE followers
  ADD CONSTRAINT user_fk FOREIGN KEY (user_id) REFERENCES users (id)
  MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;

-- Don't allow users to follow themselves
ALTER TABLE followers
  ADD CONSTRAINT user_id CHECK (user_id != follower_id)

  
CREATE TRIGGER update_follower_following
  AFTER INSERT OR UPDATE OR DELETE ON followers
  FOR EACH ROW EXECUTE PROCEDURE counter_cache('users', 'following', 'follower_id', 'id');

CREATE TRIGGER update_user_followers
  AFTER INSERT OR UPDATE OR DELETE ON followers
  FOR EACH ROW EXECUTE PROCEDURE counter_cache('users', 'followers', 'user_id', 'id');



CREATE TABLE favorites(

  id            uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  username       varchar(255) NOT NULL,
  media_id      varchar(255) NOT NULL,
  media_type    text NOT NULL,
  media_title   varchar(255) NOT NULL,
  media_poster  text NOT NULL,
  media_release text NOT NULL,
  created       timestamptz NOT NULL DEFAULT current_timestamp
);

CREATE TABLE watchlist(

  id            uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  username       varchar(255) NOT NULL,
  media_id      varchar(255) NOT NULL,
  media_type    text NOT NULL,
  media_title   varchar(255) NOT NULL,
  media_poster  text NOT NULL,
  media_release text NOT NULL,
  created       timestamptz NOT NULL DEFAULT current_timestamp
);


create table trailers(
  id            uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  url text NOT NULL,
  code text NOT NULL,
  title text NOT NULL,
  media_id      varchar(255) NOT NULL,
  media_type    text NOT NULL,
  media_title   varchar(255) NOT NULL,
  media_poster  text NOT NULL,
  created       timestamptz NOT NULL DEFAULT current_timestamp
)


create table platforms_movies(
  id            uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  platform      text NOT NULL,
  media_id      varchar(255),
  created       timestamptz NOT NULL DEFAULT current_timestamp
);