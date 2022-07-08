export interface Selector {}

export interface Slice {
    start: number,
    end?: number
}

interface Condition {}

export class SQLJsonPath {
    private readonly _selectors: Selector[];
    
    public get selectors() : Selector[] {
        return this._selectors 
    }
    
    constructor(selectors: Selector[] = []){
        this._selectors = []
    }

    public toString(){
        const selectors = this.selectors.map( sel => sel.toString() )
        return `strict $${selectors.join("")}`
    }
}

export class KeyNameSelector implements Selector {
    private readonly _name: string;
    
    public get name() : string {
        return this._name
    }
    
    constructor(name:string){
        this._name = name;
    }

    toString(){
        return `.${this.name}`
    }
}

export class DotStarSelector implements Selector {
    toString(){
        return ".*"
    }

}

export class DescendantSelector implements Selector {

    toString(){
        return ".**"
    }

}

export class ArrayNumberSelector implements Selector {
    private readonly _slices: Slice[];
    
    public get slices(): Slice[] {
        return this._slices;
    }

    constructor(slices: Slice[] ){
        this._slices = slices;
    }

    toString(){
        const slices = this.slices.map( slice => {
            if(!slice.end){
                return ""+slice.start
            }
            return `${slice.start} to ${slice.end}`
        }).join(",")
        return `[${slices}]`
    }
}

export class ArrayStarSelector implements Selector {
    toString(){
        return "[*]"
    }
}

export class FilterSelector implements Selector {
    private readonly _expression: SQLJSONPathExpression;
    
    public get expression(): SQLJSONPathExpression {
        return this._expression;
    }
    
    constructor(expression:SQLJSONPathExpression){
        this._expression = expression
    }

    toString(){
        return `?(${this.expression.toString()})`
    }
}

export class SQLJSONPathExpression {
    private readonly _orExpression: LogicalOrExpression;
    
    public get root(): LogicalOrExpression {
        return this._orExpression;
    }
    
    constructor(orExpression: LogicalOrExpression){
        this._orExpression = orExpression;
    }

    toString(){
        return this.root.toString();
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
    
    constructor(left: LogicalAndExpression, right: LogicalAndExpression[] = []){
        this._left = left;
        this._right = right;
    }

    toString(){
        const leftExpr = this.left.toString()
        const rightExpr = this.right.map( expr => expr.toString()).join('||')
        return `${leftExpr}${rightExpr !== '' ? ' || '+rightExpr : ''}`;
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

    constructor(left: Condition, right: Condition[] = []) {
        this._left = left;
        this._right = right;
    }

    toString() {
        const leftExpr = this.left.toString()
        const rightExpr = this.right.map(expr => expr.toString()).join(' || ')
        return `${leftExpr}${rightExpr !== '' ? ' && ' + rightExpr : ''}`;
    }
}

export class ParenthesesCondition implements Condition{
    private readonly _condition: Condition;
    
    public get condition(): Condition {
        return this._condition;
    }
    
    constructor(condition:Condition){
        this._condition = condition;
    }

    toString(){
        return `(${this.condition.toString()})`
    }
}

export class ExistCondition implements Condition {
    private readonly _selector: RelativePathSelector;
    
    constructor(selector:RelativePathSelector){
        this._selector = selector;
    }
    
    public get selector(): RelativePathSelector {
        return this._selector;
    }

    toString(){
        return `exists(${this.selector})`
    }
}

export class CompareCondition {
    private readonly _left: number | boolean | RelativePathSelector | string;
    private readonly _right: number | boolean | RelativePathSelector | string;
    private readonly _operator: string;
    
    constructor(left: RelativePathSelector | number | boolean | string, right: RelativePathSelector | number| boolean | string, operator: Operator){
        this._left = left;
        this._right= right;
        this._operator = operator;
    }   

    public get left(): number | boolean | RelativePathSelector | string{
        return this._left;
    }
    
    public get right(): number | boolean | RelativePathSelector | string{
        return this._right;
    }
    
    public get operator(): string {
        return this._operator;
    }

    toString(){
        const left = typeof this.left === 'string' ? `"${this.left}"` : this.left;
        const right = typeof this.right === 'string' ? `"${this.right}"` : this.right;
        return `${left}${this.operator}${right}`
    }
}

export class RelativePathSelector {
    private readonly _steps: string[];
    
    constructor(steps: string[] = []){
        this._steps = steps;
    }
    
    public get steps(): string[] {
        return this._steps;
    }

    toString(){
        const dottedSteps = this.steps.join(".")
        const prefix = this.steps.length > 0 ? "." : "";
        return `@${prefix}${dottedSteps}`;
    }
}

export type Operator = "=="  | "!" | "<" | ">" | ">=" | "<=" | "!="