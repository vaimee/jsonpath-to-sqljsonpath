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
        return `${leftExpr} ${rightExpr !== '' ? '|| '+rightExpr : ''} `;
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
        return `${leftExpr} ${rightExpr !== '' ? '&& ' + rightExpr : ''} `;
    }
}

export class ParenthesesCondition {
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

export class ExistCondition {
    
}

export class CompareCondition {

}