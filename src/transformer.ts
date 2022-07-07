import parser from "../parser/grammar";

console.log(parser.parse("$.*[1:5][?(@.lollo == true)]"))

export default function transform(queryJSONPath:string): Array<string> {
    
}