/**
 * ファイル: client/src/graphql/mutations.ts
 * 目的:
 *  - GraphQLの「書く系（Mutation）」をまとめる
 *  - “新規追加”“完了切り替え” を定義
 */
import { gql } from "@apollo/client/core";

// 新しいTodoを追加
export const ADD_TODO = gql`
  mutation AddTodo($title: String!) {
    addTodo(title: $title) {
      id
      title
      done
    }
  }
`;

// Todoの完了状態を切り替え
export const TOGGLE_TODO = gql`
  mutation ToggleTodo($id: ID!) {
    toggleTodo(id: $id) {
      id
      title
      done
    }
  }
`;

// Todoを削除
export const DELETE_TODO = gql`
  mutation DeleteTodo($id: ID!) {
    deleteTodo(id: $id) {
      id
      title
      done
    }
  }
`;
