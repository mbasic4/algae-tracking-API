CREATE TABLE "users" (
  "id" SERIAL PRIMARY KEY,
  "first_name" VARCHAR(256) NOT NULL,
  "last_name" VARCHAR(256) NOT NULL,
  "email" VARCHAR(256) UNIQUE,
  "password_hash" VARCHAR(256) NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE "citizen_scientists" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL,
  "location_id" INT NOT NULL,
  "address" VARCHAR(256) NOT NULL
);

CREATE TABLE "biologists" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INT NOT NULL
);

CREATE TABLE "locations" (
  "id" SERIAL PRIMARY KEY,
  "location" GEOGRAPHY(POINT,4326)
);

ALTER TABLE "citizen_scientists" ADD CONSTRAINT "fk_citizen_scientists_users" FOREIGN KEY ("user_id") REFERENCES "users" ("id");
ALTER TABLE "citizen_scientists" ADD CONSTRAINT "fk_citizen_scientists_locations" FOREIGN KEY ("location_id") REFERENCES "locations" ("id");
ALTER TABLE "biologists" ADD CONSTRAINT "fk_biologists_users" FOREIGN KEY ("user_id") REFERENCES "users" ("id");
