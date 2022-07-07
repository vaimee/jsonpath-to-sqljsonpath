{
   const {
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
   } = require("./ast.js");

}

jsonPath = rootSelector selectors:(S @(dotSelector / dotWildSelector / indexSelector / indexWildcardSelector / sliceSelector / descendantSelector / filterSelector ))* {
    return new JSONPath(selectors)
}

rootSelector = '$'

dotSelector = '.' id:dotMemberName {
    return new DotSelector(id)
}
dotMemberName = first:nameFirst rest:nameChar* {
    return [first, ...rest].join('')
}
nameFirst= ALPHA / '_' / NONASCII
nameChar= DIGIT / nameFirst

dotWildSelector = '.''*' {
    return new DotWildSelector()
}

indexSelector="[" S @(quotedMemberName / elementIndex) S "]" 
quotedMemberName= name:stringLiteral {
    return new MemberNameIndexSelector(name)
}
elementIndex=int:INTEGER {
    return new IntegerIndexSelector(int)
}

indexWildcardSelector= "[" "*" "]" {
    return new IndexWildcardSelector()
}

sliceSelector= "[" S @sliceIndex S "]"
sliceIndex= start:(@start S)? ":" S end:(@end S)? step:(":" @(S @step)?)? {
    return new SliceSelector(start,end,step)
}
start= INTEGER
end= INTEGER
step= INTEGER

descendantSelector= ".." subSelector:(dotMemberName / indexSelector / indexWildcardSelector / "*") {
    return new DescendatSelector(subSelector)
}

filterSelector= "[" S filter:filter S "]" {
    return new FilterSelector(filter)
}
filter= "?" S @booleanExpr
booleanExpr= logicalOrExpr
logicalOrExpr= left:logicalAndExpr right:(S "||" S @logicalAndExpr)* {
    return new OrExpression(left, right)
}
logicalAndExpr= left:basicExpr right:(S "&&" @basicExpr)* {
    return new  AndExpression(left,right)
}
basicExpr= relationExpr / existExpr / parenExpr 
existExpr= negated:(NEG_OP S)? path:singularPath {
    return new ExistExpression(negated !== null, path)
}
singularPath= relSingularPath / absSingularPath
relSingularPath= "@" (S @(dotSelector / indexSelector))*
absSingularPath= rootSelector (S @(dotSelector / indexSelector))*
parenExpr= (NEG_OP S)? "(" S expression:booleanExpr S ")" {
    return new ParentesisExpression(expression)
}
relationExpr= compExpr / regexExpr
compExpr= left:comparable S operator:compOp S right:comparable {
    return new CompExpression(left,right, operator)
}
comparable= number / stringLiteral / true / false / null / singularPath
compOp= "==" / "=!" / "<" / ">" / "<=" / ">="
regexExpr= path:(singularPath / stringLiteral) S REGEX_OP S regex:regex {
    return new RegexExpression(path, regex)
}
regex=stringLiteral

listSelector= "[" S listEntry (S "," S listEntry)+ S"]"
listEntry= (quotedMemberName / elementIndex / sliceIndex / filter)

// Literals
stringLiteral= ('"' chars:doubleQuoted* '"' { return chars.join("")}) / ("'" chars:singleQuoted* "'" { return chars.join("") }) 
doubleQuoted= UNESCAPED / [\x27] / ESC [\x22] / ESC ESCAPABLE
singleQuoted= UNESCAPED / [\x22] / ESC [\x27] / ESC ESCAPABLE
true= "true" { return true}
false= "false" { return false}
null= "null" { return null}

number= INTEGER (frac)? (exp)? {
    return parseFloat(text())
}
frac= "." DIGIT+
exp= "e" ("-" / "+" )? DIGIT+

// Terminals
S= [ \t\r\n\f]*
NEG_OP="!"
REGEX_OP="=~"

// TODO: differs from spec
UNESCAPED=  [^\0-\x1F\x22\x27\x5C]
ESC = [\x5C]
ALPHA = [a-z]i
DIGIT = [0-9]
DIGIT1 = [1-9]
INTEGER = '-'? ("0" / (DIGIT1 DIGIT*) ) {
    return parseFloat(text());
}

H
  = [0-9a-f]i
// TODO: Verify if it differs from the spec
UNICODE= "\\" digits:$(H H? H? H? H? H?) ("\r\n" / [ \t\r\n\f])? {
      return String.fromCharCode(parseInt(digits, 16));
    }
ESCAPABLE= UNICODE / "\\" ch:[^\r\n\f0-9a-f]i { return ch; }

NONASCII
  = [\x80-\uFFFF]
