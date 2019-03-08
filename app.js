var config = {
  apiKey: "AIzaSyBEJ9arbT3vnXcQrLp-JzzgZ8WrlSYIjg8",
  authDomain: "alcohol-engine.firebaseapp.com",
  databaseURL: "https://alcohol-engine.firebaseio.com",
  projectId: "alcohol-engine",
  storageBucket: "alcohol-engine.appspot.com",
  messagingSenderId: "504435190757"
};
firebase.initializeApp(config);

var database = firebase.database();

function getCocktailAPI() {
  //need to get the correct value from checkboxes not input
  var searchCategory = $("#category").val();
  console.log(searchCategory);
  var queryURL =
    "https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Alcoholic";

  //the ajax call to the cocktaildb api to get the list of drinks by searching with an ingredient
  $.ajax({
    url: queryURL,
    method: "GET"
  }).then(function(response) {
    console.log(response);
    var results = response.drinks;
    console.log(results);

    var drinkListArray = [];

    results.forEach(result => {
      console.log(result);
      var drinkID = result.idDrink;
      drinkListArray.push(drinkID);
    });
    console.log(drinkListArray);

    drinkListArray.forEach(drink => {
      $.ajax({
        url:
          "https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=" + drink,
        method: "GET"
      }).then(function(drinkResponse) {
        var results = drinkResponse.drinks[0];
        var IDofDrink = drinkResponse.drinks.idDrink;
        // fullDetailedArray.push(drinkResponse.drinks);
        var ingredientsList = [];
        for (var key in results) {
          if (
            results.hasOwnProperty(key) &&
            key.includes("strIngredient") &&
            results[key] !== ""
          ) {
            var measurementKey = key.replace("strIngredient", "strMeasure");
            var ingredient = {
              name: results[key],
              measurement: results[measurementKey]
            };
            ingredientsList.push(ingredient);
            console.log(ingredientsList);
          }
        }

        console.log("TEST ME", results);
        database.ref(IDofDrink).push({
          strID: results.idDrink,
          strDrink: results.strDrink,
          strCategory: results.strCategory,
          strGlass: results.strGlass,
          strInstructions: results.strInstructions,
          strDrinkThumb: results.strDrinkThumb,
          ingredients: ingredientsList
        });
      });
    });
  });
}

$("#submit").on("click", function(e) {
  e.preventDefault();
  $("#recipe-output").empty();
  var searchByTerms = [];
  $("#div-that-holds-checkboxes")
    .find("input[type='checkbox']")
    .each(function() {
      if ($(this).prop("checked") == true) {
        searchByTerms.push($(this).val());
      }
    });
  console.log(searchByTerms);

  database.ref().on("value", function(snapshot) {
    var results = snapshot.val();
    console.log("LOOK AT THIS", results);

    var recipes = Object.values(results);
    console.log(recipes);

    var testFilter = recipes.filter(recipe => {
      var trueStatus = true;
      for (var i = 0; i < searchByTerms.length; i++) {
        // console.log(searchByTerms[i]);
        // console.log(recipe.ingredients);
        var found = recipe.ingredients.find(x => x.name === searchByTerms[i]);
        if (!found) {
          trueStatus = false;
          break;
        }
      }

      return trueStatus;
    });
    console.log(testFilter);
    var promiseArray = [];
    for (var i = 0; i < 6; i++) {
      if (!testFilter[i]) {
        break;
      } else {
        var promise = $.ajax({
          url:
            "https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=" +
            testFilter[i].strID,
          method: "GET"
        });
        promiseArray.push(promise);
      }
    }
    console.log(promiseArray);
    Promise.all(promiseArray).then(function(resolvedPromises) {
      resolvedPromises.forEach((resolvedPromise, index) => {
        var y = testFilter[index];
        var drinkImage = $("<img>");
        var name = $("<p>");
        var howTo = $("<p>").addClass("drink-howTo");
        var instructions = $("<p>");
        var parentDiv = $("<div>").addClass("card");
        var drinkNumber = $("<p>");

        drinkImage
          .attr("src", resolvedPromise.drinks[0].strDrinkThumb)
          .addClass("drink-images");
        name.text(y.strDrink).addClass("drink-name");
        instructions.text(y.strInstructions).addClass("drink-instructions");
        drinkNumber.text("Drink #" + (index + 1)).addClass("drinkNumber");
        y.ingredients.forEach(z => {
          var comboMeasure = $("<p>");
          comboMeasure
            .text(z.measurement + "" + z.name)
            .addClass("drink-comboMeasure");
          howTo.append(comboMeasure);
        });
        parentDiv.append(drinkNumber);
        parentDiv.append(name);
        parentDiv.append(drinkImage);
        parentDiv.append(howTo);
        parentDiv.append(instructions);
        $("#recipe-output").append(parentDiv);
      });
    });
  });
});
