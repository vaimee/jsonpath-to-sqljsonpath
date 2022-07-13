import { Knex } from 'knex';
// Sadly knex seed does not pick the right tsconfig.json and we can't import
// those file using a regular import;
/* eslint-disable @typescript-eslint/no-var-requires */
const testSuite = require('../../../../jsonpath-compliance-test-suite/cts.json');
const exampleTestSuite = require('../../ietf-examples.json');

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('tests').del();
  await knex('tests-examples').del();

  await seedTable(knex, 'tests', testSuite.tests);
  await seedTable(knex, 'tests-examples', exampleTestSuite.tests);
}

async function seedTable(knex: Knex, table: string, tests: Record<string, unknown>[]) {
  const tableValues = tests
    .map(
      (
        element: Record<string, unknown>,
        index: number,
      ): { id: number; invalid_selector?: boolean; document?: unknown } => {
        return {
          id: index,
          ...element,
        };
      },
    )
    .filter((test) => {
      return !test.invalid_selector;
    })
    .map((test: { id: number; document?: unknown }) => {
      return {
        id: test.id,
        document: JSON.stringify(test.document),
      };
    });
  // Inserts seed entries
  await knex(table).insert(tableValues);
}
