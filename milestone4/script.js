$(document).ready(function () {

  var books = [];
  var currentPage = 1;
  var booksPerPage = 10;
  var currentView = "grid";
  var collectionBooks = [];

  $("#searchButton").click(function () {
    var searchTerm = $("#searchInput").val().trim();

    if (searchTerm === "") {
      $("#searchResults").text("Please enter a book title or keyword.");
      return;
    }

    $("#searchResults").text("Loading books...");
    $("#searchButton").prop("disabled", true);
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
      },
      complete: function () {
        $("#searchButton").prop("disabled", false);
      }
    });
  });

  function displayBooks() {
    $("#searchResults").empty();
    $("#pageControls").empty();
    $("#searchResults")
      .removeClass("grid-view list-view")
      .addClass(currentView + "-view");

    var start = (currentPage - 1) * booksPerPage;
    var end = start + booksPerPage;
    var pageBooks = books.slice(start, end);

    var templateBooks = pageBooks.map(function (book) {
      return {
        key: book.key,
        title: book.title || "Unknown Title",
        coverUrl: book.cover_i
          ? "https://covers.openlibrary.org/b/id/" + book.cover_i + "-S.jpg"
          : ""
      };
    });

    var template = $("#bookTemplate").html();
    var html = Mustache.render(template, { books: templateBooks });
    $("#searchResults").html(html);

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

  $("#searchResults").on("click", ".book-link", function (event) {
    event.preventDefault();

    var key = $(this).attr("data-key");

    var selectedBook = books.find(function (book) {
      return book.key === key;
    });

    if (selectedBook) {
      displayBookDetails(selectedBook);

      $("html, body").animate({
        scrollTop: $("#detailsSection").offset().top
      }, 500);
    }
  });

  function displayBookDetails(book) {
    $("#bookDetails").text("Loading book details...");

    $.ajax({
      url: "https://openlibrary.org" + book.key + ".json",
      type: "GET",
      dataType: "json",
      success: function (data) {
        var description = "No description available.";

        if (typeof data.description === "string") {
          description = data.description;
        } else if (data.description && data.description.value) {
          description = data.description.value;
        }

        var coverId = data.covers && data.covers.length
          ? data.covers[0]
          : book.cover_i;

        var details = {
          title: data.title || book.title || "Unknown Title",
          key: book.key,
          authors: book.author_name && book.author_name.length
            ? book.author_name.join(", ")
            : "Unknown Author",
          description: description,
          subjects: data.subjects && data.subjects.length
            ? data.subjects.slice(0, 10).join(", ")
            : "No subjects available.",
          firstPublished: data.first_publish_date || book.first_publish_year || "Not available",
          coverUrl: coverId
            ? "https://covers.openlibrary.org/b/id/" + coverId + "-M.jpg"
            : "",
          openLibraryUrl: "https://openlibrary.org" + book.key
      };

      var template = $("#detailsTemplate").html();
      $("#bookDetails").html(Mustache.render(template, details));
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
        if (!data.works || data.works.length === 0) {
          $("#bookCollection").text("No books available.");
          return;
        }

        collectionBooks = data.works.map(function (book) {
          return {
            key: book.key,
            title: book.title || "Unknown Title",
            cover_i: book.cover_id,
            author_name: book.authors
              ? book.authors.map(function (author) {
                return author.name;
              })
            : [],
          coverUrl: book.cover_id
            ? "https://covers.openlibrary.org/b/id/" + book.cover_id + "-S.jpg"
            : ""
          };
        });

        var template = $("#collectionTemplate").html();
        $("#bookCollection").html(
          Mustache.render(template, { books: collectionBooks })
        );
      },
      error: function () {
        $("#bookCollection").text("Unable to load collection.");
      }
    });
  }

  $("#bookCollection").on("click", ".collection-link", function (event) {
    event.preventDefault();

    var key = $(this).attr("data-key");

    var selectedBook = collectionBooks.find(function (book) {
      return book.key === key;
    });

    if (selectedBook) {
      displayBookDetails(selectedBook);

      $("html, body").animate({
        scrollTop: $("#detailsSection").offset().top
      }, 500);
    }
  });

  $("#gridViewButton").click(function () {
    currentView = "grid";
    displayBooks();
  });

  $("#listViewButton").click(function () {
    currentView = "list";
    displayBooks();
  });

  $("#showSearchButton").click(function () {
    $("#searchSection").show();
    $("#resultsSection").show();
    $("#collectionSection").hide();
  });

  $("#showCollectionButton").click(function () {
    $("#searchSection").hide();
    $("#resultsSection").hide();
    $("#collectionSection").show();
  });

  $("#collectionSection").hide();
  
  loadCollection();
});
