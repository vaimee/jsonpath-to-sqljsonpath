import { knex as Knex, Knex as KnexClient } from 'knex';
import cts from '../../jsonpath-compliance-test-suite/cts.json';
import examples from './ietf-examples.json';
import extended from './extended-tests.json';
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

  function generateTests(tests: typeof cts.tests, table: string, skip: number[] = []) {
    for (let id = 0; id < tests.length; id++) {
      const test = tests[id];
      const shouldBeSkipped = skip.find((skippingID) => id === skippingID);
      const unit = shouldBeSkipped ? it.skip : it;
      if (!test.invalid_selector) {
        unit(`should transform ${test.name} (id: ${id}): ${test.selector}`, async () => {
          const queries = transform(test.selector);
          const queryResult = await knex.unionAll(
            queries.map((query) => {
              return knex.table(table).select(knex.raw('jsonb_path_query(document, ?) as result', query)).where({ id });
            }),
          );
          const mappedQueryResult = queryResult.map((result) => {
            return result.result;
          });
          expect(mappedQueryResult).toStrictEqual(test.result);
        });
      } else {
        unit(`should throw for ${test.name} (id: ${id}): ${test.selector}`, async () => {
          expect(transform.bind(transform, test.selector)).toThrow();
        });
      }
    }
  }

  describe('IETF standard suite tests', () => {
    /* Some JSONPath feature can't be translated to SQL/JSONpath.
     * Here we skip some well-known failing tests, due to the intrinsic difference
     * between the two query languages.
     */
    const wontFix = [57, 108, 129, 133, 134, 135, 136, 138, 139, 140, 144, 145, 153, 156, 157, 159];
    generateTests(cts.tests, 'tests', wontFix);
  });

  describe('IETF examples tests', () => {
    generateTests(examples.tests as unknown as typeof cts.tests, 'tests-examples');
  });

  describe('Extended tests', () => {
    generateTests(extended.tests as unknown as typeof cts.tests, 'tests-extended');
  });
});
