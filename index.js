const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
  # base interfaces and input types for pagination and filtering
  interface Node {
    id: ID!
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
    # equals
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

  enum BooksSortBy {
    NAME
    AUTHOR
    YEAR
  }

  type Query {
    books(
      pagination: PaginationOptions
      filter: BooksFilter
      # some places we might want to be able to sort by 2 or more values
      # so this sortBy could be an array in some queries, but that should be very rare
      # argueably we might want to make it an array always in order to avoid having to make breaking changes to the API
      # and the queries that don't need to sort by multiple values just use the first value in the array and ignore the others
      sortBy: BooksSortBy
    ): BooksResult
  }
`;

const books = [
  {
    id: "1",
    title: "Book1",
    author: "Author1",
    classic: false,
    year: 1900,
  },
  {
    id: "2",
    title: "Book2",
    author: "Author2",
    classic: true,
    year: 1910,
  },
  {
    id: "3",
    title: "Book3",
    author: "Author3",
    classic: false,
    year: 1990,
  },
  {
    id: "4",
    title: "Book4",
    author: "Author4",
    classic: true,
    year: 1950,
  },
  {
    id: "5",
    title: "Book5",
    author: "Author5",
    classic: false,
    year: 1940,
  },
  {
    id: "6",
    title: "Book6",
    author: "Author6",
    classic: true,
    year: 1980,
  },
  {
    id: "7",
    title: "Book7",
    author: "Author7",
    classic: false,
    year: 1950,
  },
  {
    id: "8",
    title: "Book8",
    author: "Author8",
    classic: true,
    year: 1930,
  },
];

const resolvers = {
  Query: {
    books: (ctx, args) => {
      let {
        pagination: { limit, cursor },
        filter: {
          classic: classicFilter,
          title: titleFilter,
          author: authorFilter,
          year: yearFilter,
        },
        sortBy,
      } = args;

      if (limit == null || limit > 5 || limit <= 0) {
        limit = 5;
      }

      console.log(JSON.stringify(args, null, 4));

      let nodes = [...books];

      // filtering by classic
      if (classicFilter != null) {
        nodes = nodes.filter((book) => {
          console.log(classicFilter, book.classic);
          return book.classic === classicFilter;
          return true;
        });
      }

      // filtering by year
      if (yearFilter != null) {
        nodes = nodes.filter((book) => {
          return numberFilter(book.year, yearFilter);
        });
      }

      // filtering by author
      if (authorFilter != null) {
        nodes = nodes.filter((book) => {
          return stringFilter(book.author, authorFilter);
        });
      }

      // filtering by title
      if (titleFilter != null) {
        nodes = nodes.filter((book) => {
          return stringFilter(book.title, titleFilter);
        });
      }

      // applying sort by
      if (sortBy != null) {
        s = sortBy.toLowerCase();
        nodes = nodes.sort((a, b) => {
          return a[s] < b[s];
        });
      }

      // starting from cursor position +1 in result-set
      nodes = nodes.filter((book) => {
        if (cursor == null) {
          return true;
        }
        return parseInt(book.id) > parseInt(cursor);
      });

      hasNextPage = nodes.length > limit;

      // counting classic books in result set
      const classicCount = nodes.reduce((accumulator, book) => {
        return book.classic ? accumulator + 1 : accumulator;
      }, 0);

      // applying limit
      nodes = nodes.slice(0, limit);

      return {
        // the last element ID
        cursor: nodes.length === 0 ? null : nodes[nodes.length - 1].id,
        count: nodes.length,
        hasNextPage,
        nodes,
      };
    },
  },
};

function stringFilter(value, filter) {
  if (filter.eq != null && value !== filter.eq) {
    return false;
  }
  if (filter.neq != null && value === filter.neq) {
    return false;
  }
  if (filter.like != null && value.toLowerCase().indexOf(filter.like) === -1) {
    return false;
  }

  return true;
}

function numberFilter(value, filter) {
  if (filter.eq != null && value !== filter.eq) {
    return false;
  }
  if (filter.neq != null && value === filter.neq) {
    return false;
  }
  if (filter.lt != null && value >= filter.lt) {
    return false;
  }
  if (filter.let != null && value > filter.let) {
    return false;
  }
  if (filter.gt != null && value <= filter.gt) {
    return false;
  }
  if (filter.get != null && value < filter.get) {
    return false;
  }

  return true;
}

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
