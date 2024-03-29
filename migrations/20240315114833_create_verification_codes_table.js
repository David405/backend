const { knex } = require('knex')

module.exports = async function up(knex) {
  await knex.schema.createTable('verification_codes', function (table) {
    table.increments('id').primary()
    table
      .integer('user_id')
      .unsigned()
      .notNullable()
      .references('id')
      .inTable('users')
      .onDelete('CASCADE')
    table.string('code').notNullable()
    table.timestamp('created_at').defaultTo(knex.fn.now())
    table.unique(['user_id', 'code'])
  })
}

module.exports = async function down(knex) {
  await knex.schema.dropTableIfExists('verification_codes')
}
