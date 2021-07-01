const { gql } = require("apollo-server");

module.exports = gql`
  # base interfaces and input types for pagination and filtering, generic to all queries
  interface Node {
    id: ID!

    # we could have some more generic fields here like createdAt and updatedAt
  }

  interface PaginationResult {
    count: Int!
    nodes: [Node!]!
    cursor: String
    hasNextPage: Boolean!
  }

  input PaginationOptions {
    limit: Int
    cursor: String
  }

  input IntFilter {
    # less than, less or equals than, etc
    lt: Int
    let: Int
    gt: Int
    get: Int
    eq: Int
    neq: Int
  }

  input StringFilter {
    eq: String
    neq: String
    # fuzzy search
    like: String
  }

  # implementations
  type Book implements Node {
    id: ID!
    title: String!
    author: String!
    classic: Boolean!
  }

  type BooksResult implements PaginationResult {
    count: Int!
    # Book implements Node
    nodes: [Book!]!
    cursor: String
    hasNextPage: Boolean!

    # the books Query can include some extra meta-data besides what is defined PaginationResult
    classicCount: Int!
  }

  # We don't actually need to be able to filter/sort by every single field on every single query
  # this is just an example
  input BooksFilter {
    classic: Boolean
    title: StringFilter
    author: StringFilter
    year: IntFilter
  }

  # more complex sorting could be done with more unique values in the enum
  # for example: BooksSortBy.NAME_AUTHOR sorts by name first then author
  enum BooksSortBy {
    NAME
    AUTHOR
    YEAR
  }

  type Query {
    books(
      pagination: PaginationOptions
      filter: BooksFilter
      sortBy: BooksSortBy
    ): BooksResult
  }
`;
