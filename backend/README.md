# Database Setup & Initialization Guide

This repository uses **PostgreSQL** with automatic script initialization managed by Spring Boot.

---

## 🛠️ Environment & Database Details

* **Database Engine:** PostgreSQL
* **Database Name:** `cc_app`
* **Port:** `5432`
* **App Server Port:** `8081`

---

## 🚀 How Database Initialization Works

When you start the Spring Boot application:
1. Spring Boot executes `src/main/resources/schema.sql` to create `roles`, `users`, and `budgets` tables if they do not exist.
2. Spring Boot executes `src/main/resources/data.sql` to seed the initial roles (`ROLE_ADMIN`, `ROLE_USER`) and the admin account.
3. JPA boots up after initialization to handle entity mappings.

---

## 🔑 Default Admin Credentials

Upon launching the application for the first time, you can log in with:

| Property | Value |
| :--- | :--- |
| **Email** | `admin@gmail.com` |
| **Password** | `Password1!` |
| **Role** | `ROLE_ADMIN` |

---

## 📊 Database Schema Summary

### `roles`
* `id` (`SERIAL`): Primary Key
* `name` (`VARCHAR(20)`): Unique role name (`ROLE_ADMIN`, `ROLE_USER`)

### `users`
* `id` (`BIGSERIAL`): Primary Key
* `name` (`VARCHAR(100)`): Full name
* `email` (`VARCHAR(255)`): Unique login email
* `password_hash` (`VARCHAR(255)`): BCrypt hashed password
* `role_id` (`INT`): Foreign Key to `roles.id`

### `budgets`
* `id` (`BIGSERIAL`): Primary Key
* `user_id` (`BIGINT`): Foreign Key to `users.id`
* `amount` (`DECIMAL(10,2)`): Target budget amount
* `month_year` (`VARCHAR(7)`): Target month in `YYYY-MM` format
* *Constraint:* `unique_user_month` ensures a user has only one budget per month.