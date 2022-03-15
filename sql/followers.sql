CREATE TABLE followers (
  user_id      text NOT NULL,
  follower_id  text NOT NULL,
  created      timestamptz NOT NULL DEFAULT current_timestamp,
  PRIMARY KEY(user_id, follower_id)
);

ALTER TABLE followers
  ADD CONSTRAINT follower_fk FOREIGN KEY (follower_id) REFERENCES users (username)
  MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;

ALTER TABLE followers
  ADD CONSTRAINT user_fk FOREIGN KEY (user_id) REFERENCES users (username)
  MATCH FULL ON UPDATE CASCADE ON DELETE CASCADE;

-- Don't allow users to follow themselves
ALTER TABLE followers
  ADD CONSTRAINT user_id CHECK (user_id != follower_id);

  

-- create trigger for increment_counter

CREATE TRIGGER update_follower_following
  AFTER INSERT OR UPDATE OR DELETE ON followers
  FOR EACH ROW EXECUTE PROCEDURE counter_cache('users', 'following', 'follower_id', 'username');

CREATE TRIGGER update_user_followers
  AFTER INSERT OR UPDATE OR DELETE ON followers
  FOR EACH ROW EXECUTE PROCEDURE counter_cache('users', 'followers', 'user_id', 'username');