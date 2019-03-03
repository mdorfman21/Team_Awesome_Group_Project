function getCocktailAPI() {
  //need to get the correct value from checkboxes not input
  var searchCategory = $("#category").val();
  console.log(searchCategory);
  var queryURL =
    "https://www.thecocktaildb.com/api/json/v1/1/filter.php?c=" +
    searchCategory;

  //the ajax call to the cocktaildb api to get the list of drinks by searching with an ingredient
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    console.log(response);
    var results = response.drinks;
    console.log(results);

    results.forEach(result => {
      console.log(result);
    });

    //get the first 10 results and write them to the screen
    // for (var i = 0; i < 10; i++) {
    //   var card = $("<div>");
    //   var drinkImage = $("<img>");
    //   var drinkTitle = $("<p>");
    //   card.addClass("card");
    //   drinkImage.attr("src", results[i].strDrinkThumb);
    //   drinkTitle.text(results[i].strDrink);
    //   card.append(drinkTitle);
    //   card.append(drinkImage);
    //   $("#append-to").append(card);
    // }
  });
}

$("#submit").on("click", getCocktailAPI);
