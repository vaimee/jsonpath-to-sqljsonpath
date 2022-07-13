/**
 * @typedef {RelSingularPath|AbsSingularPath} SingularPath
 */
/**
 * @class
 * @public
 * @param {Selector} selectors
 */
class JSONPath {
  constructor(selectors) {
    this.selectors = selectors;
  }
}

class DotSelector {
  constructor(id) {
    this.id = id;
  }
}

class DotWildSelector {}
class IndexSelector {}

class MemberNameIndexSelector extends IndexSelector {
  constructor(name) {
    super();
    this.name = name;
  }
}

class IntegerIndexSelector extends IndexSelector {
  constructor(index) {
    super();
    this.index = index;
  }
}

class IndexWildcardSelector {}

class SliceSelector {
  constructor(start, end, step) {
    this.start = start;
    this.end = end;
    this.step = step;
  }
}

class DescendantSelector {
  constructor(subSelector) {
    this.subSelector = subSelector;
  }
}

class ListSelector {
  constructor(subSelectors) {
    this.subSelectors = subSelectors;
  }
}

class FilterSelector {
  /**
   * @constructor
   * @param {OrExpression} filter
   */
  constructor(filter) {
    this.filter = filter;
  }
}

class OrExpression {
  /**
   * @public
   * @constructor
   * @param {AndExpression} left
   * @param {?AndExpression[]} right
   */
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }
}

class AndExpression {
  /**
   * @constructor
   * @param {CompExpression| RegexExpression | ParenthesisExpression|ExistExpression} left
   * @param {?(CompExpression| RegexExpression |ParenthesisExpression|ExistExpression)[]} right
   */
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }
}
class CompExpression {
  /**
   * @constructor
   * @param {number | string | boolean | null | SingularPath} left
   * @param {number | string | boolean | null | SingularPath} right
   * @param {"==" / "=!" / "<" / ">" / "<=" / ">="} operator
   */
  constructor(left, right, operator) {
    this.left = left;
    this.right = right;
    this.operator = operator;
  }
}
class ParenthesisExpression {
  /**
   * @constructor
   * @param {OrExpression} expression
   */
  constructor(expression) {
    this.expresion = expression;
  }
}
class RegexExpression {
  /**
   * @constructor
   * @param {SingularPath} path
   * @param {string} regex
   *
   */
  constructor(path, regex) {
    this.path = path;
    this.regex = regex;
  }
}
class ExistExpression {
  /**
   * @constructor
   * @param {boolean} negated
   * @param {SingularPath} path
   *
   */
  constructor(negated, path) {
    this.negated = negated;
    this.path = path;
  }
}

class RelSingularPath {
  /**
   * @constructor
   * @param {(DotSelector | IndexSelector)[]} path
   *
   */
  constructor(path) {
    this.path = path;
  }
}
class AbsSingularPath {
  /**
   * @constructor
   * @param {(DotSelector | IndexSelector)[]} path
   *
   */
  constructor(path) {
    this.path = path;
  }
}

module.exports = {
  JSONPath,
  DotSelector,
  DotWildSelector,
  IndexSelector,
  MemberNameIndexSelector,
  IntegerIndexSelector,
  IndexWildcardSelector,
  SliceSelector,
  DescendantSelector,
  ListSelector,
  FilterSelector,
  OrExpression,
  AndExpression,
  CompExpression,
  ParenthesisExpression,
  RegexExpression,
  ExistExpression,
  RelSingularPath,
  AbsSingularPath,
};
