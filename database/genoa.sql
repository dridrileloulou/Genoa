CREATE TABLE "users" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL,
  "password" varchar NOT NULL,
  "role" varchar NOT NULL,
  "validé" boolean NOT NULL DEFAULT false
);

CREATE TABLE "membres" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "sexe" varchar,
  "prénom" varchar,
  "nom" varchar,
  "date_naissance" timestamp,
  "date_décès" timestamp,
  "lock_user_id" integer,
  "id_user" integer,
  "lock_time" timestamp,
  "informations_complémentaires" varchar,
  "photo" varchar,
  "privé" boolean,
  "id_union" integer,
  "biologique" bool
);

CREATE TABLE "unions" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "id_membre_1" integer,
  "id_membre_2" integer,
  "date_union" timestamp,
  "date_séparation" timestamp
);

CREATE TABLE "coordonnées" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "id_membre" integer,
  "adresse" varchar,
  "téléphone" varchar,
  "email" varchar
);

CREATE TABLE "professions" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "id_membre" integer,
  "métier" varchar,
  "date_début" timestamp,
  "date_fin" timestamp
);

CREATE TABLE "logs" (
  "id" INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  "id_user" integer,
  "table_modifiée" varchar,
  "id_enregistrement" integer,
  "action" varchar,
  "date" timestamp
);

ALTER TABLE "membres" ADD FOREIGN KEY ("lock_user_id") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "membres" ADD FOREIGN KEY ("id_user") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "membres" ADD FOREIGN KEY ("id_union") REFERENCES "unions" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "unions" ADD FOREIGN KEY ("id_membre_1") REFERENCES "membres" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "unions" ADD FOREIGN KEY ("id_membre_2") REFERENCES "membres" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "coordonnées" ADD FOREIGN KEY ("id_membre") REFERENCES "membres" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "professions" ADD FOREIGN KEY ("id_membre") REFERENCES "membres" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "logs" ADD FOREIGN KEY ("id_user") REFERENCES "users" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "membres" ADD CONSTRAINT unique_membre UNIQUE ("prénom", nom, date_naissance, "date_décès");

ALTER TABLE "membres" ADD CONSTRAINT unique_membre UNIQUE ("prénom", nom, date_naissance);
