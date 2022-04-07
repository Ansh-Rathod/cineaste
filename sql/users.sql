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
  images jsonb,
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


CREATE TABLE notifications(
   id         uuid UNIQUE PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
   owner_username text,
   owner_review_id uuid,
   owner_review_body text,
   reactor_username text,
   rector_body text,
   rector_reply_id uuid,
   message_type text,
   active boolean NOT NULL DEFAULT true,
   created_at    timestamptz NOT NULL DEFAULT current_timestamp
);

owner_username,
rector_body,
reactor_username,
rector_reply_id,
message_type


ALTER TABLE notifications
ADD CONSTRAINT notiuser_fk FOREIGN KEY (reactor_username) REFERENCES users(username)
MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE notifications
ADD CONSTRAINT review_fk FOREIGN KEY (owner_review_id) REFERENCES reviews(id)
MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE notifications
ADD CONSTRAINT reply_fk FOREIGN KEY (rector_reply_id) REFERENCES reviews(id)
MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;



