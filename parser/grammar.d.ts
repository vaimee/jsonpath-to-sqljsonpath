import { parser } from 'peggy';
import { JSONPath } from './ast';

export default {
    SyntaxError,
    parse(jsonpath: string, options: parser.Options = {}): JSONPath
}
