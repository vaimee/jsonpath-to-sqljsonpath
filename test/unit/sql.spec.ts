import {
  SQLJsonPath,
  KeyNameSelector,
  DotStarSelector,
  ArrayStarSelector,
  ArrayNumberSelector,
  DescendantSelector,
  FilterSelector,
  LogicalAndExpression,
  CompareCondition,
  RelativePathSelector,
  SQLJSONPathExpression,
  LogicalOrExpression,
  ExistCondition,
} from '../../src/sql';

describe('SQL/JSONPath generator', () => {
  it('should produce $', () => {
    const query = new SQLJsonPath().toString();
    expect(query).toBe('$');
  });

  it('should produce $.hello', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new KeyNameSelector('hello'));
    const query = path.toString();

    expect(query).toBe('$.hello');
  });

  it('should produce $.hello.foo', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new KeyNameSelector('hello'));
    path.selectors.push(new KeyNameSelector('foo'));
    const query = path.toString();

    expect(query).toBe('$.hello.foo');
  });

  it('should produce $.*', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new DotStarSelector());
    const query = path.toString();

    expect(query).toBe('$.*');
  });

  it('should produce $.**', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new DescendantSelector());
    const query = path.toString();

    expect(query).toBe('$.**');
  });

  it('should produce $[*]', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new ArrayStarSelector());
    const query = path.toString();

    expect(query).toBe('$[*]');
  });

  it('should produce $[1]', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new ArrayNumberSelector([{ start: 1 }]));
    const query = path.toString();

    expect(query).toBe('$[1]');
  });

  it('should produce $[1 to 3]', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new ArrayNumberSelector([{ start: 1, end: 3 }]));
    const query = path.toString();

    expect(query).toBe('$[1 to 3]');
  });

  it('should produce $[1 to 3, 2 , 5 to 6]', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new ArrayNumberSelector([{ start: 1, end: 3 }, { start: 2 }, { start: 5, end: 6 }]));
    const query = path.toString();

    expect(query).toBe('$[1 to 3,2,5 to 6]');
  });

  it('should produce $.hello.foo.*', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new KeyNameSelector('hello'));
    path.selectors.push(new KeyNameSelector('foo'));
    path.selectors.push(new DotStarSelector());
    const query = path.toString();

    expect(query).toBe('$.hello.foo.*');
  });

  it('should produce $.hello.foo[*]', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new KeyNameSelector('hello'));
    path.selectors.push(new KeyNameSelector('foo'));
    path.selectors.push(new ArrayStarSelector());
    const query = path.toString();

    expect(query).toBe('$.hello.foo[*]');
  });

  it('should produce $.hello?(@>130)', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new KeyNameSelector('hello'));
    path.selectors.push(
      new FilterSelector(
        new SQLJSONPathExpression(
          new LogicalOrExpression(new LogicalAndExpression(new CompareCondition(new RelativePathSelector(), 130, '>'))),
        ),
      ),
    );
    const query = path.toString();

    expect(query).toBe('$.hello?(@>130)');
  });

  it('should produce $.hello?(@>130 && true==@.foo)', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new KeyNameSelector('hello'));
    path.selectors.push(
      new FilterSelector(
        new SQLJSONPathExpression(
          new LogicalOrExpression(
            new LogicalAndExpression(new CompareCondition(new RelativePathSelector(), 130, '>'), [
              new CompareCondition(true, new RelativePathSelector(['foo']), '=='),
            ]),
          ),
        ),
      ),
    );
    const query = path.toString();

    expect(query).toBe('$.hello?(@>130 && true==@.foo)');
  });

  it('should produce $.hello?(@.foo.bar=="hi")', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new KeyNameSelector('hello'));
    path.selectors.push(
      new FilterSelector(
        new SQLJSONPathExpression(
          new LogicalOrExpression(
            new LogicalAndExpression(new CompareCondition(new RelativePathSelector(['foo', 'bar']), 'hi', '==')),
          ),
        ),
      ),
    );
    const query = path.toString();

    expect(query).toBe('$.hello?(@.foo.bar=="hi")');
  });

  it('should produce $.hello?(@.foo=="hi")?(@.foo>=2)', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new KeyNameSelector('hello'));
    path.selectors.push(
      new FilterSelector(
        new SQLJSONPathExpression(
          new LogicalOrExpression(
            new LogicalAndExpression(new CompareCondition(new RelativePathSelector(['foo']), 'hi', '==')),
          ),
        ),
      ),
    );
    path.selectors.push(
      new FilterSelector(
        new SQLJSONPathExpression(
          new LogicalOrExpression(
            new LogicalAndExpression(new CompareCondition(new RelativePathSelector(['foo']), 2, '>=')),
          ),
        ),
      ),
    );
    const query = path.toString();

    expect(query).toBe('$.hello?(@.foo=="hi")?(@.foo>=2)');
  });

  it('should produce $.hello?(exists(@.b))', () => {
    const path = new SQLJsonPath();
    path.selectors.push(new KeyNameSelector('hello'));
    path.selectors.push(
      new FilterSelector(
        new SQLJSONPathExpression(
          new LogicalOrExpression(new LogicalAndExpression(new ExistCondition(new RelativePathSelector(['b'])))),
        ),
      ),
    );
    const query = path.toString();

    expect(query).toBe('$.hello?(exists(@.b))');
  });
});
