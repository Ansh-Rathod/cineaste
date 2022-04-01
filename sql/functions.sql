
CREATE FUNCTION counter_cache()
  RETURNS trigger AS $$
    DECLARE
      table_name text := quote_ident(TG_ARGV[0]);
      counter_name text := quote_ident(TG_ARGV[1]);
      fk_name text := quote_ident(TG_ARGV[2]);
      pk_name text := quote_ident(TG_ARGV[3]);
      fk_changed boolean;
      fk_value text;
      record record;
    BEGIN
      IF TG_OP = 'UPDATE' THEN
        record := NEW;
        EXECUTE 'SELECT ($1).' || fk_name || ' != ' || '($2).' || fk_name
        INTO fk_changed
        USING OLD, NEW;
      END IF;

      IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND fk_changed) THEN
        record := OLD;
        EXECUTE 'SELECT ($1).' || fk_name INTO fk_value USING record;
        PERFORM increment_counter(table_name, counter_name, pk_name, fk_value, -1);
      END IF;

      IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND fk_changed) THEN
        record := NEW;
        EXECUTE 'SELECT ($1).' || fk_name INTO fk_value USING record;
        PERFORM increment_counter(table_name, counter_name, pk_name, fk_value, 1);
      END IF;

      RETURN record;
    END;
  $$ LANGUAGE plpgsql;




CREATE OR REPLACE FUNCTION counter_cache_for_uuid()
  RETURNS trigger AS $$
    DECLARE
      table_name text := quote_ident(TG_ARGV[0]);
      counter_name text := quote_ident(TG_ARGV[1]);
      fk_name text := quote_ident(TG_ARGV[2]);
      pk_name text := quote_ident(TG_ARGV[3]);
      fk_changed boolean;
      fk_value uuid;
      record record;
    BEGIN
      IF TG_OP = 'UPDATE' THEN
        record := NEW;
        EXECUTE 'SELECT ($1).' || fk_name || ' != ' || '($2).' || fk_name
        INTO fk_changed
        USING OLD, NEW;
      END IF;

      IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND fk_changed) THEN
        record := OLD;
        EXECUTE 'SELECT ($1).' || fk_name INTO fk_value USING record;
        EXECUTE 'UPDATE '|| table_name||' SET ' || counter_name || '=' || counter_name || '+' || -1|| ' WHERE ' || quote_ident(pk_name) || ' = $1'
        USING fk_value;
      END IF;

      IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND fk_changed) THEN
        record := NEW;
        EXECUTE 'SELECT ($1).' || fk_name INTO fk_value USING record;
        EXECUTE 'UPDATE '|| table_name||' SET ' || counter_name || '=' || counter_name || '+' || 1|| ' WHERE ' || quote_ident(pk_name) || ' = $1'
        USING fk_value;
      END IF;

      RETURN record;
    END;
  $$ LANGUAGE plpgsql;





CREATE OR REPLACE FUNCTION add_like_notification()
  RETURNS trigger AS $$
    DECLARE 
      owner_username text;
      owner_review_id  uuid;
      owner_review_body  text;
      
      reactor_username text;
    BEGIN
       
       
       IF TG_OP = 'INSERT' THEN
          owner_review_id := NEW.review_id;
          reactor_username  := NEW.user_id;
          EXECUTE 'select body,creator_username from reviews where id=$1;'
          USING owner_review_id
          INTO owner_review_body,owner_username;

          IF (owner_username != reactor_username) THEN 
              EXECUTE 'insert into notifications(
                owner_username,
                owner_review_id,
                owner_review_body,
                reactor_username,
                message_type) values ($1,$2,$3,$4,''LIKE'');' 
              USING owner_username,owner_review_id,owner_review_body,reactor_username;
          END IF;
       END IF;

       IF TG_OP = 'DELETE' THEN
          owner_review_id := OLD.review_id;
          reactor_username  := OLD.user_id;
          EXECUTE 'select creator_username from reviews where id=$1;'
          USING owner_review_id
          INTO owner_username;
          EXECUTE 'delete from notifications 
          where owner_username = $1 and reactor_username = $2 and owner_review_id = $3 and message_type = ''LIKE'';'
          USING owner_username,reactor_username,owner_review_id;
       END IF;

    RETURN NEW;
    END; 
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION add_follow_notification()
  RETURNS trigger AS $$
    DECLARE 
      owner_username text;
    
      reactor_username text;
    BEGIN
       
       
       IF TG_OP = 'INSERT' THEN
          owner_username := NEW.user_id;
          reactor_username  := NEW.follower_id;

          IF (owner_username != reactor_username) THEN 
              EXECUTE 'insert into notifications(
                owner_username,
                reactor_username,
                message_type) values ($1,$2,''FOLLOW'');' 
              USING owner_username,reactor_username;
          END IF;
       END IF;

       IF TG_OP = 'DELETE' THEN
       
          owner_username := OLD.user_id;
          reactor_username  := OLD.follower_id;

          EXECUTE 'delete from notifications 
          where owner_username = $1 and reactor_username = $2 
          and message_type = ''FOLLOW'';'
          USING owner_username,reactor_username;
       END IF;

    RETURN NEW;
    END; 
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_mention_notification()
  RETURNS trigger AS $$
    DECLARE 
      owner_username text;
      reactor_username text;
      reactor_reply_id uuid;
      reactor_reply_body text;
    BEGIN
       
       
       IF TG_OP = 'INSERT' THEN
          owner_username := NEW.user_id;
          reactor_reply_id  := NEW.review_id;
          EXECUTE 'select creator_username,body from reviews where id=$1;'
          USING reactor_reply_id
          INTO reactor_username,reactor_reply_body;

          IF (owner_username != reactor_username) THEN 
              EXECUTE 'insert into notifications(
                owner_username,
                reactor_username,
                rector_reply_id,
                rector_body,
                message_type) values ($1,$2,$3,$4,''MENTION'');' 
              USING owner_username,reactor_username,reactor_reply_id,reactor_reply_body;
          END IF;
       END IF;

       IF TG_OP = 'DELETE' THEN
       
          owner_username := OLD.user_id;
          reactor_reply_id  := OLD.review_id;
          EXECUTE 'select creator_username,body from reviews where id=$1;'
          USING reactor_reply_id
          INTO reactor_username,reactor_reply_body;

          EXECUTE 'delete from notifications 
          where owner_username = $1 and reactor_username = $2 
          and rector_reply_id = $3
          and message_type = ''MENTION'';'
          USING owner_username,reactor_username,reactor_reply_id;
       END IF;

    RETURN NEW;
    END; 
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION add_replies_notification()
  RETURNS trigger AS $$
    DECLARE 
      owner_username text;
      owner_review_id  uuid;
      owner_review_body  text;
      reactor_reply_id uuid; 
      reactor_reply_body text; 
      reactor_username text;

    BEGIN
      
       IF TG_OP = 'INSERT' THEN
          owner_review_id := NEW.review_id;
          reactor_reply_id  := NEW.reply_id;
          EXECUTE 'select creator_username,body from reviews where id=$1;'
          USING owner_review_id
          INTO owner_username,owner_review_body;
          EXECUTE 'select creator_username,body from reviews where id=$1;'
          USING reactor_reply_id
          INTO reactor_username,reactor_reply_body;

          IF (owner_username != reactor_username) THEN 
              EXECUTE 'insert into notifications(
                owner_username,
                owner_review_id,
                owner_review_body,
                rector_reply_id,
                rector_body,
                reactor_username,
                message_type
                ) values ($1,$2,$3,$4,$5,$6,''REPLY'');' 
              USING owner_username,owner_review_id,owner_review_body,
              reactor_reply_id,reactor_reply_body,
              reactor_username;
          END IF;
      END IF;
      IF TG_OP = 'DELETE' THEN
          owner_review_id := OLD.review_id;
          reactor_reply_id  := OLD.reply_id;
          EXECUTE 'select creator_username from reviews where id=$1;'
          USING owner_review_id
          INTO owner_username;
          EXECUTE 'select creator_username from reviews where id=$1;'
          USING reactor_reply_id
          INTO reactor_username;
          EXECUTE 'delete from notifications 
          where owner_username = $1 and reactor_username = $2 and
           owner_review_id = $3
           and rector_reply_id = $4
           and message_type = ''REPLY'';'
          USING owner_username,reactor_username,owner_review_id,reactor_reply_id;
      END IF;

    RETURN NEW;
    END; 
$$ LANGUAGE plpgsql;






























-- increment_counter 
CREATE FUNCTION increment_counter(table_name text, column_name text, pk_name text, pk_value text, step integer)
  RETURNS VOID AS $$
    DECLARE
      table_name text := quote_ident(table_name);
      column_name text := quote_ident(column_name);
      conditions text := ' WHERE ' || quote_ident(pk_name) || ' = $1';
      updates text := column_name || '=' || column_name || '+' || step;
    BEGIN
      EXECUTE 'UPDATE ' || table_name || ' SET ' || updates || conditions
      USING pk_value;
    END;
  $$ LANGUAGE plpgsql;

CREATE FUNCTION parse_tokens(content text, prefix text)
  RETURNS text[] AS $$
    DECLARE
      regex text;
      matches text;
      subquery text;
      captures text;
      tokens text[];
    BEGIN
      regex := prefix || '(\S+)';
      matches := 'regexp_matches($1, $2, $3) as captures';
      subquery := '(SELECT ' || matches || ' ORDER BY captures) as matches';
      captures := 'array_agg(matches.captures[1])';

      EXECUTE 'SELECT ' || captures || ' FROM ' || subquery
      INTO tokens
      USING LOWER(content), regex, 'g';

      IF tokens IS NULL THEN
        tokens = '{}';
      END IF;

      RETURN tokens;
    END;
  $$ LANGUAGE plpgsql STABLE;



CREATE FUNCTION parse_mentions_from_review()
  RETURNS trigger AS $$
    BEGIN
      NEW.mentions = parse_tokens(NEW.body, '@');
      RETURN NEW;
    END;
$$ LANGUAGE plpgsql;


CREATE FUNCTION parse_tags_from_review()
  RETURNS trigger AS $$
    BEGIN
      NEW.tags = parse_tokens(NEW.body, '#');
      RETURN NEW;
    END;
  $$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION create_new_taggings()
  RETURNS trigger AS $$
    DECLARE
      tag text;
      user_id uuid;
    BEGIN
      FOREACH tag IN ARRAY NEW.tags LOOP
        BEGIN
          tag := LOWER(tag);
          INSERT INTO hashtags (name) VALUES (tag);
        EXCEPTION WHEN unique_violation THEN
        END;

        BEGIN
          EXECUTE 'SELECT id FROM hashtags WHERE name = $1'
          INTO user_id
          USING tag;

          INSERT INTO taggings (tag_id, review_id)
          VALUES (user_id, NEW.id);
        EXCEPTION WHEN unique_violation THEN
        END;
      END LOOP;

      RETURN NEW;
    END;
$$ LANGUAGE plpgsql;



CREATE FUNCTION make_avg_rating()
  RETURNS double precision AS $$
    DECLARE
    BEGIN
     RETURN QUERY EXECUTE 'select round(avg((movie->'quote_indent(rating)')::numeric),1) from 
               reviews where movie->'rating'is not null and movie->>'id'='60574' and movie->>'type'='tv';'
       
    END;
$$ LANGUAGE plpgsql;



create table apprating(
  type text,
  id varchar(255) NOT NULL UNIQUE PRIMARY KEY,
  rating numeric,
);



CREATE OR REPLACE FUNCTION update_apprating()
RETURNS TRIGGER AS $$
    DECLARE
    id text;
    type text;

    BEGIN
    EXECUTE 'select movie->''id'' as id from reviews where id= $1'
    USING NEW.id
    INTO id; 
    EXECUTE 'select movie->''type'' as id from reviews where id= $1'
    USING NEW.id
    INTO type; 
    PERFORM make_avg_rating(id,type);
    END; 
$$ LANGUAGE plpgsql;














CREATE OR REPLACE FUNCTION update_apprating()
RETURNS TRIGGER AS $$
    DECLARE
    id text;
    type text;

    BEGIN 
    IF NEW.movie IS NOT NULL THEN
       EXECUTE 'select movie->>''id'' from reviews where id= $1'
       USING NEW.id
       INTO id; 
       EXECUTE 'select movie->>''type'' from reviews where id= $1'
       USING NEW.id
       INTO type; 
       PERFORM make_avg_rating(id,type);
    END IF;
    RETURN NEW;
    END; 
$$ LANGUAGE plpgsql;

CREATE  OR REPLACE FUNCTION make_avg_rating(id text, type text)
  RETURNS  numeric AS $$

    DECLARE
    rating numeric;

    BEGIN
     EXECUTE format('select round(avg((movie->>''rating'')::numeric),1) from reviews where movie->''rating''
      is not null and movie->>''id''=$1 and movie->>''type''=$2;')
     USING id,type 
     INTO rating;
     EXECUTE format(
         'insert into apprating(rating,id,type) values ($1,$2,$3) on conflict (id) do update set rating =$1;')
     USING rating,id,type;    
     
     return rating;
    END;
  $$ LANGUAGE plpgsql;

  CREATE FUNCTION parse_mentions_from_reviews()
  RETURNS trigger AS $$
    BEGIN
      NEW.mentions = parse_tokens(NEW.post, '@');
      RETURN NEW;
    END;
  $$ LANGUAGE plpgsql;