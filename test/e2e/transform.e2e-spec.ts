import { knex as Knex, Knex as KnexClient } from 'knex';
import cts from '../../jsonpath-compliance-test-suite/cts.json';
import examples from './ietf-examples.json';
import { transform } from '../../src/transformer';

describe('Transform', () => {
  let knex: KnexClient;

  beforeAll(() => {
    knex = Knex({
      client: 'pg',
      connection: {
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
      },
    });
  });

  afterAll(async () => {
    await knex.destroy();
  });

  function generateTests(tests: typeof cts.tests, table: string) {
    for (let id = 0; id < tests.length; id++) {
      const test = tests[id];
      if (!test.invalid_selector) {
        it(`should transform ${test.name} (id: ${id}): ${test.selector}`, async () => {
          const queries = transform(test.selector);
          console.log(queries);

          const queryResult = await knex.unionAll(
            queries.map((query) => {
              return knex.table(table).select(knex.raw('jsonb_path_query(document, ?) as result', query)).where({ id });
            }),
          );
          const mappedQueryResult = queryResult.map((result) => {
            return result.result;
          });
          console.log(queries, mappedQueryResult, test.result);

          expect(mappedQueryResult).toStrictEqual(test.result);
        });
      } else {
        it(`should throw for ${test.name}: ${test.selector}`, async () => {
          expect(transform.bind(transform, test.selector)).toThrow();
        });
      }
    }
  }

  describe('IETF standard suite tests', () => {
    generateTests(cts.tests, 'tests');
  });

  describe('IETF examples tests', () => {
    generateTests(examples.tests as unknown as typeof cts.tests, 'tests-examples');
  });
});
