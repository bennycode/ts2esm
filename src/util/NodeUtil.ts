import {Expression, Statement} from 'ts-morph';

export class NodeUtil {
  static extractComment(input: Statement | Expression) {
    const statementWithComment = input.getFullText();
    const pureStatement = input.getText();
    const comment = statementWithComment.replace(pureStatement, '');
    const statement = statementWithComment.replace(comment, '');
    return {
      comment,
      statement,
    };
  }
}
