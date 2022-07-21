import {
  DotSelector,
  SliceSelector,
  DotWildSelector,
  IndexWildcardSelector,
  MemberNameIndexSelector,
  ListSelector,
  IntegerIndexSelector,
  FilterSelector,
  CompExpression,
  RegexExpression,
  ParenthesisExpression,
  ExistExpression,
  OrExpression,
  AndExpression,
  SingularPath,
  DescendantSelector,
} from '../parser/ast';
import parser from '../parser/grammar';
import {
  ArrayNumberSelector,
  ArrayStarSelector,
  DotStarSelector,
  KeyNameSelector,
  KeyNameStringSelector,
  Slice,
  SQLJsonPath,
  FilterSelector as SQLFilterSelector,
  LogicalOrExpression,
  LogicalAndExpression,
  SQLJSONPathExpression,
  CompareCondition,
  ExistCondition,
  RelativePathSelector,
  CompareRegexCondition,
  DescendantSelector as SQLDescendantSelector,
  ParenthesesCondition,
} from './sql';

export function transform(queryJSONPath: string): Array<string> {
  const jsonPathQuery = parser.parse(queryJSONPath);
  const paths: SQLJsonPath[] = [new SQLJsonPath()];

  for (const selector of jsonPathQuery.selectors) {
    if (selector instanceof DotSelector) {
      paths.forEach((path) => path.selectors.push(new KeyNameSelector(selector.id)));
    } else if (selector instanceof SliceSelector) {
      paths.forEach((path) => path.selectors.push(transformSliceSelector(selector)));
    } else if (selector instanceof DotWildSelector) {
      if (paths[1] === undefined) {
        paths[1] = paths[0].clone();
      }
      paths[0].selectors.push(new DotStarSelector());
      paths[1].selectors.push(
        new ArrayStarSelector(),
        new SQLFilterSelector(
          new SQLJSONPathExpression(
            new LogicalOrExpression(
              new LogicalAndExpression(
                new CompareCondition(new RelativePathSelector(), new RelativePathSelector(), '=='),
              ),
            ),
          ),
        ),
      );
    } else if (selector instanceof IndexWildcardSelector) {
      paths.forEach((path) => path.selectors.push(new ArrayStarSelector()));
    } else if (selector instanceof MemberNameIndexSelector) {
      paths.forEach((path) => path.selectors.push(new KeyNameStringSelector(selector.name)));
    } else if (selector instanceof IntegerIndexSelector) {
      paths.forEach((path) => path.selectors.push(transformIntegerIndexSelector(selector)));
    } else if (selector instanceof ListSelector) {
      paths.forEach((path) => path.selectors.push(transformListSelector(selector)));
    } else if (selector instanceof FilterSelector) {
      if (paths[1] === undefined) {
        paths[1] = paths[0].clone();
      }
      paths[0].selectors.push(new DotStarSelector());
      paths[1].selectors.push(new ArrayStarSelector());
      paths.forEach((path) => path.selectors.push(transformFilterSelector(selector)));
    } else if (selector instanceof DescendantSelector) {
      paths.forEach((path) => path.selectors.push(new SQLDescendantSelector()));
    }
  }

  return paths.map((path) => path.toString());
}

function transformSliceSelector(selector: SliceSelector): ArrayNumberSelector {
  let start = selector.start ?? 0;
  if (start < 0 && start >= -2147483647) {
    start = start === -1 ? 'last' : `last ${start + 1}`;
  }
  let end = selector.end ? selector.end - 1 : 'last';

  if (selector.end < 0 && end >= -2147483647) {
    end = `last ${selector.end}`;
  }

  if (start > 2147483647) {
    start = 'last';
  }

  if (start < -2147483647) {
    start = 0;
  }

  if (end > 2147483647) {
    end = 'last';
  }

  if (end < -2147483647) {
    end = 0;
  }

  const slices: Slice[] = [{ start, end }];

  if (selector.step && !`${end}`.includes('last')) {
    if (selector.step < 0) {
      throw new Error('SQL/JSONPath only support arrays with ascending order');
    }

    slices.pop();
    for (let i = start; i <= end; i += selector.step) {
      slices.push({ start: i });
    }
  }
  return new ArrayNumberSelector(slices);
}

function transformIntegerIndexSelector(selector: IntegerIndexSelector): ArrayNumberSelector {
  let start = selector.index;
  if (start < 0) {
    start = start === -1 ? 'last' : `last ${start + 1}`;
  }
  return new ArrayNumberSelector([{ start }]);
}

function transformFilterSelector(selector: FilterSelector): SQLFilterSelector {
  const logicalOr = transformExpression(selector.filter);
  const SQLExpression = new SQLJSONPathExpression(logicalOr);

  return new SQLFilterSelector(SQLExpression);
}

function transformExpression(element: unknown): any {
  if (element instanceof OrExpression) {
    const left = transformExpression(element.left);
    const right = [];
    for (const rightElement of element.right ?? []) {
      right.push(transformExpression(rightElement));
    }
    return new LogicalOrExpression(left, right);
  } else if (element instanceof AndExpression) {
    const left = transformExpression(element.left);
    const right = [];
    for (const rightElement of element.right ?? []) {
      right.push(transformExpression(rightElement));
    }
    return new LogicalAndExpression(left, right);
  } else if (element instanceof CompExpression) {
    let left: typeof element.left | RelativePathSelector = element.left;
    let right: typeof element.left | RelativePathSelector = element.right;

    if (left !== null && typeof left === 'object') {
      left = transformSingularPath(left);
    }
    if (right !== null && typeof right === 'object') {
      right = transformSingularPath(right);
    }

    return new CompareCondition(left, right, element.operator);
  } else if (element instanceof RegexExpression) {
    return new CompareRegexCondition(transformSingularPath(element.path), element.regex);
  } else if (element instanceof ParenthesisExpression) {
    return new ParenthesesCondition(transformExpression(element.expresion));
  } else if (element instanceof ExistExpression) {
    return new ExistCondition(transformSingularPath(element.path));
  } else {
    throw new Error('Unsupported expression type');
  }
}

function transformSingularPath(singPath: SingularPath): RelativePathSelector {
  const paths = [];
  for (const selector of singPath.path) {
    if (selector instanceof DotSelector) {
      paths.push(selector.id);
    } else if (selector instanceof MemberNameIndexSelector) {
      paths.push(new KeyNameStringSelector(selector.name).toString().substring(1));
    } else {
      throw new Error('Not supported');
    }
  }
  return new RelativePathSelector(paths);
}

function transformListSelector(selector: ListSelector): ArrayNumberSelector {
  const found = selector.subSelectors.find(
    (selector: unknown) => !(selector instanceof IntegerIndexSelector || selector instanceof SliceSelector),
  );

  if (found) {
    throw new Error(
      'Not implemented; we are currently not supporting returning multiple JSONPath queries from ListSelectors',
    );
  }
  // there is no filter or path selectors I can use ArrayNumberSelector
  const slices: Slice[] = [];
  for (const subSelector of selector.subSelectors) {
    let arraySelector;
    if (subSelector instanceof IntegerIndexSelector) {
      arraySelector = transformIntegerIndexSelector(subSelector);
    } else {
      arraySelector = transformSliceSelector(subSelector);
    }
    slices.push(...arraySelector.slices);
  }
  return new ArrayNumberSelector(slices);
}
