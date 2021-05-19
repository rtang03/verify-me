#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "auth_db" <<-EOSQL
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  CREATE SCHEMA IF NOT EXISTS common;
  CREATE TABLE IF NOT EXISTS accounts
    (
      id                   SERIAL,
      compound_id          VARCHAR(255) NOT NULL,
      user_id              INTEGER NOT NULL,
      provider_type        VARCHAR(255) NOT NULL,
      provider_id          VARCHAR(255) NOT NULL,
      provider_account_id  VARCHAR(255) NOT NULL,
      refresh_token        TEXT,
      access_token         TEXT,
      access_token_expires TIMESTAMPTZ,
      created_at           TIMESTAMPTZ NOT NULL DEFAULT Now(),
      updated_at           TIMESTAMPTZ NOT NULL DEFAULT Now(),
      PRIMARY KEY (id)
    );

  CREATE TABLE IF NOT EXISTS sessions
    (
      id            SERIAL,
      user_id       INTEGER NOT NULL,
      expires       TIMESTAMPTZ NOT NULL,
      session_token VARCHAR(255) NOT NULL,
      access_token  VARCHAR(255) NOT NULL,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT Now(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT Now(),
      PRIMARY KEY (id)
    );

  CREATE TABLE IF NOT EXISTS users
    (
      id             SERIAL,
      name           VARCHAR(255),
      email          VARCHAR(255),
      email_verified TIMESTAMPTZ,
      image          TEXT,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT Now(),
      updated_at     TIMESTAMPTZ NOT NULL DEFAULT Now(),
      active_tenant  VARCHAR(255),
      PRIMARY KEY (id)
    );

  CREATE TABLE IF NOT EXISTS verification_requests
    (
      id         SERIAL,
      identifier VARCHAR(255) NOT NULL,
      token      VARCHAR(255) NOT NULL,
      expires    TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT Now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT Now(),
      PRIMARY KEY (id)
    );

  CREATE TABLE IF NOT EXISTS tenant
    (
      id uuid DEFAULT uuid_generate_v4 (),
      slug VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(100),
      members TEXT,
      user_id INTEGER NOT NULL,
      db_name VARCHAR(100) NOT NULL,
      db_host VARCHAR(255),
      db_username VARCHAR(100),
      db_password TEXT,
      db_port INTEGER NOT NULL DEFAULT 5432,
      created_at TIMESTAMPTZ NOT NULL DEFAULT Now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT Now(),
      PRIMARY KEY (id)
    );

  CREATE UNIQUE INDEX compound_id
    ON accounts(compound_id);

  CREATE INDEX provider_account_id
    ON accounts(provider_account_id);

  CREATE INDEX provider_id
    ON accounts(provider_id);

  CREATE INDEX user_id
    ON accounts(user_id);

  CREATE UNIQUE INDEX session_token
    ON sessions(session_token);

  CREATE UNIQUE INDEX access_token
    ON sessions(access_token);

  CREATE UNIQUE INDEX email
    ON users(email);

  CREATE UNIQUE INDEX token
    ON verification_requests(token);

  CREATE UNIQUE INDEX slug
    ON tenant(slug);
EOSQL
