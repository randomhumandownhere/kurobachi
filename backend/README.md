# what the fuck candy??
uhhh why hello here's a random api..! why? i have no idea. it has um tortured me for some time,,,, heh. anyways, here's a random readme because uhhh i am retarded. please correct me if i get anything wrong!! :p

sooo uhh `.env`,,, here's what you gotta want:

```
PORT=3000
SUPABASE_ID=mlixvgdnczwqkjqmazcn
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1saXh2Z2RuY3p3cWtqcW1hemNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzNzM0ODIsImV4cCI6MjA2OTk0OTQ4Mn0.yi2IfiWZHsE4LC7i_QWFRd5VnSiHcbeJ-ELte2K23RA
```

## what supabase what
sooo, idk how to do this, is there an export function??? whatever. *what kinda stuff you do candy??* tbh i forgot... but uh set up auth and all :p

### auth auth auth
no clue how to do this properly, but i disabled the email verification part and simply just,,, setup oauth (mainly for extension). find a guide for this, but it kinda involves google cloud console, whatever its called. i chose the web app option, and entered the details in supabase.

### users???
see [this](https://supabase.com/docs/guides/auth/managing-user-data), its what i did and uhh use that for foreign key with the other table, tracker.

### what is jwt
for the api jwt is used for uhh authentication whatever they call it. i hope i did it correctly?? ah well at least it works as a prototype. basically, in the project settings, go to jwt keys and use RS256 signing algorithm (make a new one, probably, at least thats what i did)

### rls
for the tracker table, you gotta add select and insert for authenticated users.

also, whatever supabase gave me (reference)
```
-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  first_name text,
  last_name text,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.tracker (
  user_id uuid NOT NULL,
  url text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  CONSTRAINT tracker_pkey PRIMARY KEY (id),
  CONSTRAINT tracker_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

## endpoints??
for now, it has embarassingly one of it. and uhh as of now i simply test it with the extension?? its quite literally a button the sends a get request to localhost:3000 but well, it works :p

i have a skill issue so uhh too bad, you may need to fix it ben

---

### `/list`
go ahead... takes the user id from token and returns something like this (idk how to write this). it is `<url>: <frequency>`, and the times you can consider it 10 seconds?? for now?? like *10 will leave you with x seconds, the (estimated) total time.
```json
{
    "example.com": 5,
    "github.com": 3,
    "app.slack.com": 1
}
```
