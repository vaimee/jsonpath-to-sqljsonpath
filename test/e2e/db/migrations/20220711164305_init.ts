import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable('tests', (table) => {
      table.increments('id').primary();
      table.jsonb('document').notNullable();
    })
    .createTable('tests-examples', (table) => {
      table.increments('id').primary();
      table.jsonb('document').notNullable();
    });
}

// eslint-disable-next-line @typescript-eslint/no-empty-function
export async function down(): Promise<void> {}
