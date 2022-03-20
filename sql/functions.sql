
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

update_apprating()