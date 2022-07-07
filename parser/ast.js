class JSONPath {
    constructor(selectors){
        this.selectors = selectors;
    }
}

class DotSelector {
    constructor(id) {
        this.id = id
    }
}

class DotWildSelector {
    constructor() {
    }
}
class IndexSelector {
    constructor() {
    }
}

class MemberNameIndexSelector extends IndexSelector {
    constructor(name) {
        super()
        this.name = name
    }
}

class IntegerIndexSelector extends IndexSelector {
    constructor(index) {
        super()
        this.index = index
    }
}

class IndexWildcardSelector {
    constructor() {
    }
}

class SliceSelector {
    constructor(start, end, step) {
        this.start = start
        this.end = end
        this.step = step
    }
}

class DescendatSelector {
    constructor(subSelector) {
        this.subSelector = subSelector
    }
}

class FilterSelector {
    constructor(filter) {
        this.filter = filter
    }
}

class Expression {
    constructor(root) {
        this.root = root
    }
}

class OrExpression {
    constructor(left, right) {
        this.left = left
        this.right = right
    }
}

class AndExpression {
    constructor(left, right) {
        this.left = left
        this.right = right
    }
}

class CompExpression {
    constructor(left, right, operator) {
        this.left = left
        this.right = right
        this.operator = operator
    }
}

class ParentesisExpression {
    constructor(expression) {
        this.expresion = expression
    }
}

class RegexExpression {
    constructor(path, regex) {
        this.path = path
        this.regex = regex
    }
}

 class ExistExpression {
    constructor(negated, path) {
        this.negated = negated
        this.path = path
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
    DescendatSelector,
    FilterSelector,
    Expression,
    OrExpression,
    AndExpression,
    CompExpression,
    ParentesisExpression,
    RegexExpression,
    ExistExpression
};