$(document).ready(function () {

  var books = [];
  var currentPage = 1;
  var booksPerPage = 10;

  $("#searchButton").click(function () {
    var searchTerm = $("#searchInput").val().trim();

    if (searchTerm === "") {
      $("#searchResults").text("Please enter a book title or keyword.");
      return;
    }

    $("#searchResults").text("Loading books...");
    $("#pageControls").empty();

    $.ajax({
      url: "https://openlibrary.org/search.json",
      type: "GET",
      dataType: "json",
      data: {
        q: searchTerm,
        limit: 50,
        fields: "key,title,author_name,first_publish_year,cover_i"
      },
      success: function (data) {
        $("#searchResults").empty();

        if (!data.docs || data.docs.length === 0) {
          $("#searchResults").text("No books found.");
          return;
        }

        $.each(data.docs.slice(0,10), function (index, book) {
          var bookItem = $("<div>").addClass("book-item");

          var title = $("<p>").text(book.title || "Unknown Title");
          bookItem.append(title);

          if (book.cover_i) {
            var cover = $("<img>")
              .attr("src", "https://covers.openlibrary.org/b/id/" + book.cover_i + "-S.jpg")
              .attr("alt", "Cover of " + (book.title || "book"));

              bookItem.append(cover);
          } else {
            bookItem.append($("<p>").text("No cover available."));
          }

          $("#searchResults").append(bookItem);
        });
      },
      error: function () {
        $("#searchResults").text("Unable to load books. Please try again.");
      }
    });
  });

  function displayBooks() {
    $("#searchResults").empty();
    $("#pageControls").empty();

    var start = (currentPage - 1) * booksPerPage;
    var end = start + booksPerPage;
    var pageBooks = books.slice(start, end);

    $.each(pageBooks, function (index, book) {
      var bookItem = $("<div>").addClass("book-item");

      var title = $("<p>").text(book.title || "Unknown Title");
      bookItem.append(title);

      if (book.cover_i) {
        var cover = $("<img>")
          .attr("src", "https://covers.openlibrary.org/b/id/" + book.cover_i + "-S.jpg")
          .attr("alt", "Cover of " + (book.title || "book"));

        bookItem.append(cover);
      } else {
        bookItem.append($("<p>").text("No cover available."));
      }

      $("#searchResults").append(bookItem);
    });

    var totalPages = Math.ceil(books.length / booksPerPage);

    if (totalPages > 1) {
      for (var i = 1; i <= totalPages; i++) {
        var pageButton = $("<button>").text(i);

        if (i === currentPage) {
          pageButton.prop("disabled", true);
        }

        pageButton.click(function () {
          currentPage = Number($(this).text());
          displayBooks();
        });

        $("#pageControls").append(pageButton);
      }
    }

    $("#pageControls").append(
      $("<p>").text("Page " + currentPage + " of " + totalPages)
    );
  }
});
