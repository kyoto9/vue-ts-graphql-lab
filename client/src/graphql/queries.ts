/**
 * ファイル: client/src/graphql/queries.ts
 * 目的:
 *  - GraphQLの「読む系（Query）」をまとめる
 *  - 文字列として書いたクエリを、画面からインポートして使う
 */
import { gql } from "@apollo/client/core";

// Todo一覧をサーバから取得するクエリ
export const GET_TODOS = gql`
  query GetTodos {
    todos {
      id
      title
      done
    }
  }
`;
