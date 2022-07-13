export interface Selector {
  clone(): Selector;
}

export interface Slice {
  start: number | string;
  end?: number | string;
}

interface Condition {
  clone(): Condition;
}

export class SQLJsonPath {
  private readonly _selectors: Selector[];

  public get selectors(): Selector[] {
    return this._selectors;
  }

  public constructor(selectors: Selector[] = []) {
    this._selectors = selectors;
  }

  public toString() {
    const selectors = this.selectors.map((sel) => sel.toString());
    return `$${selectors.join('')}`;
  }

  public clone() {
    const clonedSelectors = this.selectors.map((selector) => selector.clone());
    return new SQLJsonPath(clonedSelectors);
  }
}

export class KeyNameSelector implements Selector {
  private readonly _name: string;

  public get name(): string {
    return this._name;
  }

  public constructor(name: string) {
    this._name = name;
  }

  public toString() {
    const containSpace = this.name.includes('\u0020');
    return containSpace ? `."${this.name}"` : `.${this.name}`;
  }

  public clone() {
    return new KeyNameSelector(this.name);
  }
}
export class KeyNameStringSelector implements Selector {
  private readonly _name: string;

  public get name(): string {
    return this._name;
  }

  public constructor(name: string) {
    this._name = name;
  }

  public toString() {
    return `."${this.name}"`;
  }

  public clone() {
    return new KeyNameStringSelector(this.name);
  }
}

export class DotStarSelector implements Selector {
  public toString() {
    return '.*';
  }

  public clone() {
    return new DotStarSelector();
  }
}

export class DescendantSelector implements Selector {
  public toString() {
    return '.**';
  }
  public clone() {
    return new DescendantSelector();
  }
}

export class ArrayNumberSelector implements Selector {
  private readonly _slices: Slice[];

  public get slices(): Slice[] {
    return this._slices;
  }

  public constructor(slices: Slice[]) {
    this._slices = slices;
  }

  public toString() {
    const slices = this.slices
      .map((slice) => {
        if (!slice.end) {
          return '' + slice.start;
        }
        return `${slice.start} to ${slice.end}`;
      })
      .join(',');
    return `[${slices}]`;
  }

  public clone() {
    const clonedSlices = this.slices.map((slice) => Object.assign({}, slice));
    return new ArrayNumberSelector(clonedSlices);
  }
}

export class ArrayStarSelector implements Selector {
  public toString() {
    return '[*]';
  }

  public clone() {
    return new ArrayStarSelector();
  }
}

export class FilterSelector implements Selector {
  private readonly _expression: SQLJSONPathExpression;

  public get expression(): SQLJSONPathExpression {
    return this._expression;
  }

  public constructor(expression: SQLJSONPathExpression) {
    this._expression = expression;
  }

  public toString() {
    return `?(${this.expression.toString()})`;
  }

  public clone() {
    const clonedExpression = this.expression.clone();
    return new FilterSelector(clonedExpression);
  }
}

export class SQLJSONPathExpression {
  private readonly _orExpression: LogicalOrExpression;

  public get root(): LogicalOrExpression {
    return this._orExpression;
  }

  public constructor(orExpression: LogicalOrExpression) {
    this._orExpression = orExpression;
  }

  public toString() {
    return this.root.toString();
  }

  public clone() {
    return new SQLJSONPathExpression(this.root.clone());
  }
}

export class LogicalOrExpression {
  private readonly _left: LogicalAndExpression;
  private readonly _right: LogicalAndExpression[];

  public get left(): LogicalAndExpression {
    return this._left;
  }

  public get right(): LogicalAndExpression[] {
    return this._right;
  }

  public constructor(left: LogicalAndExpression, right: LogicalAndExpression[] = []) {
    this._left = left;
    this._right = right;
  }

  public toString() {
    const leftExpr = this.left.toString();
    const rightExpr = this.right.map((expr) => expr.toString()).join('||');
    return `${leftExpr}${rightExpr !== '' ? ' || ' + rightExpr : ''}`;
  }

  public clone() {
    const left = this.left.clone();
    const right = this.right.map((and) => and.clone());
    return new LogicalOrExpression(left, right);
  }
}

export class LogicalAndExpression {
  private readonly _left: Condition;
  private readonly _right: Condition[];

  public get left(): Condition {
    return this._left;
  }

  public get right(): Condition[] {
    return this._right;
  }

  public constructor(left: Condition, right: Condition[] = []) {
    this._left = left;
    this._right = right;
  }

  public toString() {
    const leftExpr = this.left.toString();
    const rightExpr = this.right.map((expr) => expr.toString()).join(' || ');
    return `${leftExpr}${rightExpr !== '' ? ' && ' + rightExpr : ''}`;
  }

  public clone() {
    const left = this.left.clone();
    const right = this.right.map((and) => and.clone());
    return new LogicalAndExpression(left, right);
  }
}

export class ParenthesesCondition implements Condition {
  private readonly _condition: Condition;

  public get condition(): Condition {
    return this._condition;
  }

  public constructor(condition: Condition) {
    this._condition = condition;
  }

  public toString() {
    return `(${this.condition.toString()})`;
  }

  public clone(): Condition {
    return new ParenthesesCondition(this.condition.clone());
  }
}

export class ExistCondition implements Condition {
  private readonly _selector: RelativePathSelector;

  public constructor(selector: RelativePathSelector) {
    this._selector = selector;
  }

  public get selector(): RelativePathSelector {
    return this._selector;
  }

  public toString() {
    return `exists(${this.selector})`;
  }

  public clone(): Condition {
    return new ExistCondition(this.selector.clone());
  }
}

export class CompareCondition implements Condition {
  private readonly _left: number | boolean | RelativePathSelector | string | null;
  private readonly _right: number | boolean | RelativePathSelector | string | null;
  private readonly _operator: Operator;

  public constructor(
    left: RelativePathSelector | number | boolean | string | null,
    right: RelativePathSelector | number | boolean | string | null,
    operator: Operator,
  ) {
    this._left = left;
    this._right = right;
    this._operator = operator;
  }

  public get left(): number | boolean | RelativePathSelector | string | null {
    return this._left;
  }

  public get right(): number | boolean | RelativePathSelector | string | null {
    return this._right;
  }

  public get operator(): Operator {
    return this._operator;
  }

  public toString() {
    const left = typeof this.left === 'string' ? `"${this.left}"` : this.left;
    const right = typeof this.right === 'string' ? `"${this.right}"` : this.right;
    return `${left}${this.operator}${right}`;
  }

  public clone(): Condition {
    return new CompareCondition(this._left, this._right, this.operator);
  }
}

export class RelativePathSelector {
  private readonly _steps: string[];

  public constructor(steps: string[] = []) {
    this._steps = steps;
  }

  public get steps(): string[] {
    return this._steps;
  }

  public toString() {
    const dottedSteps = this.steps.join('.');
    const prefix = this.steps.length > 0 ? '.' : '';
    return `@${prefix}${dottedSteps}`;
  }

  public clone() {
    const clonedSteps = this.steps.map((step) => Object.assign({}, step));

    return new RelativePathSelector(clonedSteps);
  }
}

export class CompareRegexCondition implements Condition {
  private readonly _left: number | boolean | RelativePathSelector | string;
  private readonly _regex: string;

  public constructor(left: RelativePathSelector | number | boolean | string, right: string) {
    this._left = left;
    this._regex = right;
  }

  public get left(): number | boolean | RelativePathSelector | string {
    return this._left;
  }

  public get regex(): number | boolean | RelativePathSelector | string {
    return this._regex;
  }

  public toString() {
    const left = typeof this.left === 'string' ? `"${this.left}"` : this.left;
    const regex = typeof this.regex === 'string' ? `"${this.regex}"` : this.regex;
    return `${left} like_regex ${regex}`;
  }

  public clone(): Condition {
    return new CompareRegexCondition(this._left, this._regex);
  }
}

export type Operator = '==' | '!' | '<' | '>' | '>=' | '<=' | '!=';
