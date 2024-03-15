import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', function (table) {
    table.increments('id').primary()
    table.string('email').notNullable().unique()
    table.string('password').notNullable()
    table.boolean('is_employer').defaultTo(false)
    table.string('first_name').notNullable()
    table.string('last_name').notNullable()
    table.string('phone_number').notNullable()
    table.string('company_name')
    table.string('role')
    table.string('profession')
    table.boolean('is_email_verified').defaultTo(false)

    table.timestamps(true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users')
}
