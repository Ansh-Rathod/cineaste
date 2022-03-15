CREATE TABLE users (
  id            varchar(255) NOT NULL UNIQUE,
  username      text NOT NULL UNIQUE,
  display_name  text NOT NULL,
  email         varchar(255) NOT NULL UNIQUE,
  avatar_url    text,
  backdrop_url  text,
  bio           text,
  followers     integer NOT NULL DEFAULT 0,
  following     integer NOT NULL DEFAULT 0,
  reviews       integer NOT NULL DEFAULT 0,
  created       timestamptz NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY(id, username)
);


create table movie_info(
  id varchar(255) NOT NULL UNIQUE,
  title text NOT NULL,
  overview text,
  poster_path text,
  backdrop_path text,
  release_date text,
  popularity float4 NOT NULL,
  runtime integer,
  tagline text,
  vote_average float4 NOT NULL,
  similar_movies jsonb,
  movie_cast jsonb,
  crew jsonb,
  videos jsonb,
  genres jsonb,
  production_countries jsonb,
  spoken_languages jsonb,
  app_rating integer default 0,
  week_num integer,
  PRIMARY KEY(id)

)

create table tv_info(
  id varchar(255) NOT NULL UNIQUE,
  title text NOT NULL,
  overview text,
  poster_path text,
  backdrop_path text,
  release_date text,
  language text,
  popularity float4 NOT NULL,
  seasons integer,
  episodes integer,
  tagline text,
  vote_average float4 NOT NULL,
  similar_shows jsonb,
  tv_cast jsonb,
  crew jsonb,
  videos jsonb,
  genres jsonb,
  production_countries jsonb,
  spoken_languages jsonb,
  app_rating integer default 0,
  week_num integer,

  PRIMARY KEY(id)

)

create table person(
  birthday text,
  deathday text,
  gender   integer,
  id       varchar(255) NOT NULL UNIQUE,
  imdb_id   text,
  name      text,
  place_of_birth text,
  profile_path  text,
  biography   text,  
  movies jsonb,
  tvshows jsonb,
  external_ids jsonb,
  week_num integer,
  PRIMARY KEY(id)
)
