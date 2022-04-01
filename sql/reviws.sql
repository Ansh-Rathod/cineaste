
CREATE TABLE reviews(
  id         uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  creator_username   text NOT NULL,
  body       text NOT NULL,
  media      jsonb,
  movie      jsonb,
  likes      integer NOT NULL DEFAULT 0,
  replies    integer NOT NULL DEFAULT 0,
  mentions   text[] NOT NULL DEFAULT '{}',
  tags       text[] NOT NULL DEFAULT '{}',
  repling_to text[] NOT NULL DEFAULT '{}',
  created_at    timestamptz NOT NULL DEFAULT current_timestamp
);



ALTER TABLE reviews
ADD CONSTRAINT user_fk FOREIGN KEY (creator_username) REFERENCES users (username)
MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;



CREATE TRIGGER parse_mentions
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE PROCEDURE parse_mentions_from_review();


CREATE TRIGGER parse_taggings
BEFORE INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE PROCEDURE parse_tags_from_review();

CREATE TRIGGER create_taggings
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW EXECUTE PROCEDURE create_new_taggings();



CREATE TABLE mentions (
  user_id   text NOT NULL,
  review_id  uuid NOT NULL,
  PRIMARY KEY(user_id, review_id)
);


ALTER TABLE mentions
  ADD CONSTRAINT tweet_fk FOREIGN KEY (review_id) REFERENCES reviews (id)
  MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;



CREATE TABLE taggings (
  tag_id    uuid NOT NULL,
  review_id  uuid NOT NULL,
  PRIMARY KEY(tag_id, review_id)
);

CREATE TABLE hashtags (
  id       uuid PRIMARY KEY NOT NULL DEFAULT uuid_generate_v4(),
  name     text NOT NULL UNIQUE,
  reviews   integer NOT NULL DEFAULT 0,
  created  timestamptz NOT NULL DEFAULT current_timestamp
);

ALTER TABLE taggings
ADD CONSTRAINT tag_fk FOREIGN KEY (tag_id) REFERENCES hashtags (id)
MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE taggings
ADD CONSTRAINT tweet_fk FOREIGN KEY (review_id) REFERENCES reviews (id)
MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;

  

CREATE TABLE liked (
  user_id   text NOT NULL,
  review_id  uuid NOT NULL,
  PRIMARY KEY(user_id, review_id)
);
ALTER TABLE liked
  ADD CONSTRAINT user_fk FOREIGN KEY (user_id) REFERENCES users (username)
  MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE liked
  ADD CONSTRAINT tweet_fk FOREIGN KEY (review_id) REFERENCES reviews (id)
  MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;

  
CREATE TRIGGER update_review_favorites
  AFTER INSERT OR UPDATE OR DELETE ON liked
  FOR EACH ROW EXECUTE PROCEDURE counter_cache_for_uuid('reviews', 'likes', 'review_id', 'id');



CREATE TABLE replies (
  review_id  uuid NOT NULL,
  reply_id  uuid NOT NULL,
  PRIMARY KEY(review_id, reply_id)
);

ALTER TABLE replies
  ADD CONSTRAINT tweet_fk FOREIGN KEY (review_id) REFERENCES reviews (id)
  MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE replies
  ADD CONSTRAINT reply_fk FOREIGN KEY (reply_id) REFERENCES reviews (id)
  MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;


CREATE TRIGGER update_review_replies
  AFTER INSERT OR UPDATE OR DELETE ON replies
  FOR EACH ROW EXECUTE PROCEDURE counter_cache_for_uuid('reviews', 'replies', 'review_id', 'id');


CREATE table report_reviews(
  review_id uuid NOT NULL,
  reportd_by text,
  created_at timestamptz NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY(review_id,reportd_by)
)

ALTER TABLE report_reviews
  ADD CONSTRAINT review_fk FOREIGN KEY (review_id) REFERENCES reviews (id)
  MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE report_reviews
  ADD CONSTRAINT reported_by_fk FOREIGN KEY (reportd_by) REFERENCES users (username)
  MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;
  


CREATE OR REPLACE FUNCTION create_new_mentions()
  RETURNS trigger AS $$
    DECLARE
      username text;
    BEGIN
      FOREACH username IN ARRAY NEW.mentions LOOP
        BEGIN

            INSERT INTO mentions (user_id, review_id)
            VALUES (username, NEW.id);
        END;
      END LOOP;

      RETURN NEW;
    END;
  $$ LANGUAGE plpgsql;

  CREATE TRIGGER create_taggings
  AFTER INSERT OR UPDATE ON reviews
  FOR EACH ROW EXECUTE PROCEDURE create_new_taggings();


  