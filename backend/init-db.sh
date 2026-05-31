#!/bin/bash
set -e

# Create databases and users
# Databases: product, inventory, cart, order, user, payment
# Each database has a corresponding user and password with the same name.

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  -- User and database: product
  CREATE USER product WITH PASSWORD 'product';
  CREATE DATABASE product;
  GRANT ALL PRIVILEGES ON DATABASE product TO product;
  ALTER DATABASE product OWNER TO product;

  -- User and database: inventory
  CREATE USER inventory WITH PASSWORD 'inventory';
  CREATE DATABASE inventory;
  GRANT ALL PRIVILEGES ON DATABASE inventory TO inventory;
  ALTER DATABASE inventory OWNER TO inventory;

  -- User and database: cart
  CREATE USER cart WITH PASSWORD 'cart';
  CREATE DATABASE cart;
  GRANT ALL PRIVILEGES ON DATABASE cart TO cart;
  ALTER DATABASE cart OWNER TO cart;

  -- User and database: order
  CREATE USER "order" WITH PASSWORD 'order';
  CREATE DATABASE "order";
  GRANT ALL PRIVILEGES ON DATABASE "order" TO "order";
  ALTER DATABASE "order" OWNER TO "order";

  -- User and database: user
  CREATE USER "user" WITH PASSWORD 'user';
  CREATE DATABASE "user";
  GRANT ALL PRIVILEGES ON DATABASE "user" TO "user";
  ALTER DATABASE "user" OWNER TO "user";

  -- User and database: payment
  CREATE USER payment WITH PASSWORD 'payment';
  CREATE DATABASE payment;
  GRANT ALL PRIVILEGES ON DATABASE payment TO payment;
  ALTER DATABASE payment OWNER TO payment;
EOSQL

# Grant schema-level permissions inside each database
for db in product inventory cart "order" "user" payment; do
  echo "Granting permissions on public schema in database $db to user $db"
  psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$db" <<-EOSQL
    GRANT ALL ON SCHEMA public TO "$db";
EOSQL
done
