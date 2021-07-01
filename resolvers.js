const books = require("./data");

module.exports = {
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
        nextPageCursor: nodes.length === 0 ? null : nodes[nodes.length - 1].id,
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
