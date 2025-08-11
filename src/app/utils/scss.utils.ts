import {isPlainObject} from "lodash";

export function createScssString(value: any): string {
  return _createScssString(value, 0);
}

export function createScssObjects(data: Array<{ name: string, comment?: string[], content: any }>): string {
  const result: string[] = [];
  data.map((item, index) => {

    // add new line to result if not first item
    if(index > 0){
      result.push('');
    }

    // add comments
    if(item.comment){
      result.push('/**');
      item.comment.map(_ => result.push(' * ' + _.trim()));
      result.push(' */');
    }

    // add content
    result.push(`$${item.name}: ${createScssString(item.content)};`);

  });
  return result.join('\n');
}

function _createScssString(value: any, indentLevel: number = 0): string {
  if(value !== undefined){
    if (value === null) {
      return 'null';
    } else if(['string', 'boolean', 'number'].includes(typeof value)){
      return value.toString();
    } else if(Array.isArray(value)) {
      return _createScssStringArray(value, indentLevel);
    } else if(isPlainObject(value)) {
      return _createScssStringObject(value, indentLevel);
    }
  }
}

function _createScssStringObject(value: any, indentLevel: number = 0, indentSpace: string|null = null): string {

  // increase indent by one
  indentLevel++;
  indentSpace = _indentString(indentLevel);

  // create pairs
  const keyValuePairs = Object.keys(value)
    .reduce((result, key) => {
      const keyValue = _createScssString(value[key], indentLevel);
      if(keyValue !== undefined){
        result.push(`"${key}": ${keyValue}`);
      }
      return result;
    }, []);

  // create empty result
  const result: string[] = [];

  // add opening tag
  result.push('(');

  // add value pairs
  result.push([
    indentSpace,
    keyValuePairs.join(',\n' + indentSpace)
  ].join(''));

  // add closing tag
  result.push([
    _indentString(indentLevel - 1),
    ')',
  ].join(''));

  // return result
  return result.join('\n');

}

function _createScssStringArray(value: any[], indent: number = 0): string {
  return [
    '(',
    value.filter(_ => _ !== undefined).map(_ => _createScssString(_, indent)).join(', '),
    ')'
  ].join('');
}

function _indentString(indentLevel: number): string {
  return ' '.repeat(indentLevel * 2);
}