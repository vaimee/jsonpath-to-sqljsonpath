import parser from '../../parser/grammar';

function generateTests(queries: string[]) {
  for (const query of queries) {
    it(`should accept ${query}`, () => {
      expect(parser.parse.bind(parser, query)).not.toThrow();
    });
  }
}
describe('JSONPath parser', () => {
  describe('Base expressions', () => {
    // taken from https://datatracker.ietf.org/doc/html/draft-ietf-jsonpath-base#section-2
    const queries = [
      '$.store.book[*].author',
      '$..author',
      '$.store.*',
      '$.store..price',
      '$..book[2]',
      '$..book[-1]',
      '$..book[0,1]',
      '$..book[:2]',
      '$..book[?(@.isbn)]',
      '$..book[?(@.price<10)]',
      '$..*',
    ];
    generateTests(queries);
  });

  describe('Weird selectors', () => {
    // taken from https://datatracker.ietf.org/doc/html/draft-ietf-jsonpath-base#section-2
    const queries = ['$["\\\\"]', '$["\\/"]', '$["\\b"]'];
    generateTests(queries);
  });

  describe('Root selector', () => {
    const queries = ['$.j', '$.j.k'];
    generateTests(queries);
  });

  describe('Dot Wildcard selector', () => {
    const queries = ['$.o.*', '$.a.*'];
    generateTests(queries);
  });

  describe('Index selector', () => {
    const queries = ["$.o['j j']['k.k']", '$["a"]', '$.o["j j"]["k.k"]', '$.a[1]', '$.a[-2]'];
    generateTests(queries);

    it('should throw for overflowing index', () => {
      expect(
        parser.parse.bind(parser, '$[231584178474632390847141970017375815706539969331281128078915168015826259279872]'),
      ).toThrow();
    });
  });

  describe('Array Slice selector', () => {
    const queries = ['$[1:3]', '$[1:5:2]', '$[5:1:-2]', '$[::-1]'];
    generateTests(queries);
  });

  describe('Descendant Selector', () => {
    const queries = ['$..j', '$..[0]', '$..[*]', '$..*'];
    generateTests(queries);
  });

  describe('Filter selector', () => {
    const queries = [
      '$.a[?@>3.5]',
      '$.a[?@.b]',
      '$.a[?@<2 || @.b == "ik"]',
      '$.a[?@.b =~ "i.*"]',
      '$.o[?@>1 && @<4]',
      '$.o[?@.u || @.x]',
    ];
    generateTests(queries);
  });

  describe('List selector', () => {
    const queries = ['$[0,3]', '$[0,0]', '$[0:2, 5]'];
    generateTests(queries);
  });
});
