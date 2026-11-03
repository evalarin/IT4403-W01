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
          books = [];
          $("#pageControls").empty();
          $("#searchResults").text("No books found.");
          return;
        }

        books = data.docs;
        currentPage = 1;
        displayBooks();
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

      var title = $("<a>")
        .attr("href", "#")
        .text(book.title || "Unknown Title");

      title.click(function (event) {
        event.preventDefault();
        displayBookDetails(book);

        $("html, body").animate({
          scrollTop: $("#detailsSection").offset().top
        }, 500);
      });
      
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

  function displayBookDetails(book) {
    $("#bookDetails").text("Loading book details...");

    $.ajax({
      url: "https://openlibrary.org" + book.key + ".json",
      type: "GET",
      dataType: "json",
      success: function (data) {
        $("#bookDetails").empty();

        var title = data.title || book.title || "Unknown Title";
        var authors = book.author_name
          ? book.author_name.join(", ")
          : "Unkown Author";

        var description = "No description available.";

        if (typeof data.description === "string") {
          description = data.description;
        } else if (data.description && data.description.value) {
          description = data.description.value;
        }

        var subjects = data.subjects
          ? data.subjects.slice(0, 10).join(", ")
          : "No subjects available.";

        $("#bookDetails").append($("<h3>").text(title));
        $("#bookDetails").append($("<p>").text("Work ID: " + book.key));
        $("#bookDetails").append($("<p>").text("Author(s): " + authors));
        $("#bookDetails").append($("<p>").text("Description: " + description));
        $("#bookDetails").append($("<p>").text("Subjects: " + subjects));

        var coverId = data.covers && data.covers.length
          ? data.covers[0]
          : book.cover_i;

        if (coverId) {
          $("#bookDetails").append(
            $("<img>")
              .attr("src", "https://covers.openlibrary.org/b/id/" + coverId + "-M.jpg")
              .attr("alt", "Cover of " + title)
            );
        } else {
          $("#bookDetails").append($("<p>").text("No cover available."));
        }

        $("#bookDetails").append(
          $("<p>").append(
            $("<a>")
              .attr("href", "https://openlibrary.org" + book.key)
              .attr("target", "_blank")
              .attr("rel", "noopener noreferrer")
              .text("View on Open Library")
            )
          );
      },
      error: function () {
        $("#bookDetails").text("Unable to load book details. Please try again.");
      }
    });
  }

  function loadCollection() {
    $("#bookCollection").text("Loading collection...");

    $.ajax({
      url: "https://openlibrary.org/subjects/fantasy.json",
      type: "GET",
      dataType: "json",
      data: {
        limit: 10
      },
      success: function (data) {
        $("#bookCollection").empty();

        if (!data.works || data.works.length === 0) {
          $("#bookCollection").text("No books available.");
          return;
        }

        $.each(data.works, function (index, book) {
          var bookItem = $("<div>").addClass("book-item");

          var title = $("<a>")
            .attr("href", "#")
            .text(book.title || "Unknown Title");

          title.click(function (event) {
            event.preventDefault();

            var selectedBook = {
              key: book.key,
              title: book.title,
              cover_i: book.cover_id,
              author_name: book.authors
                ? book.authors.map(function (author) {
                  return author.name;
                })
                : []
            };

            displayBookDetails(selectedBook);

            $("html, body").animate({
              scrollTop: $("#detailsSection").offset().top
            }, 500);
          });

          bookItem.append(title);

          if (book.cover_id) {
            bookItem.append(
              $("<img>")
                .attr("src", "https://covers.openlibrary.org/b/id/" + book.cover_id + "-S.jpg")
                .attr("alt", "Cover of " + (book.title || "book"))
              );
          } else {
            bookItem.append($("<p>").text("No cover available."));
          }

          $("#bookCollection").append(bookItem);
        });
      },
      error: function () {
        $("#bookCollection").text("Unable to load collection.");
      }
    });
  }

  loadCollection();
});
