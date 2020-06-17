// BUDGET CONTROLLER
var budgetController = (function () {
  // function constructor for expense
  var Expense = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };
  Expense.prototype.calcPercentage = function (totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  Expense.prototype.getPercentages = function () {
    return this.percentage;
  };

  var Income = function (id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var totalSum = function (type) {
    var sum = 0;
    data.allItems[type].forEach(function (cur) {
      sum += cur.value;
    });
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: [],
    },
    totals: {
      inc: 0,
      exp: 0,
    },
    budget: 0,
    percentage: -1,
  };

  return {
    item: function (type, des, val) {
      var newItem, ID;

      //Create new ID
      // [1,2,3,4,5] , next ID = 6
      // [1,3,6,7,8] , next ID = 6 (which is not possible)
      // ID = last ID + 1
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else ID = 0;

      // create new item based on the type
      if (type === "inc") {
        newItem = new Income(ID, des, val);
      } else if (type == "exp") {
        newItem = new Expense(ID, des, val);
      }

      // push that new item into data structures
      data.allItems[type].push(newItem);
      //data.totals.type += val;

      //return that item
      return newItem;
    },

    deleteItem: function (type, id) {
      data.allItems[type].splice(id, 1);
    },

    calculateBudget: function () {
      //calculate total income and expenses
      totalSum("exp");
      totalSum("inc");

      //calculate budget=income-expenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate percentage of income spend on expenses
      if (data.totals.inc > 0) {
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function () {
      // expense/income *100
      data.allItems.exp.forEach(function (cur) {
        cur.calcPercentage(data.totals.inc);
      });
    },

    getPercentage: function () {
      var allPercentage = data.allItems.exp.map(function (cur) {
        return cur.getPercentages();
      });
      return allPercentage;
    },

    getBudget: function () {
      return {
        budget: data.budget,
        totalInc: data.totals.inc,
        totalexp: data.totals.exp,
        percentage: data.percentage,
      };
    },

    test: function () {
      console.log(data);
    },
  };
})();

// UI CONTROLLER
var UIcontroller = (function () {
  var DOMstrings = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    addButton: ".add__btn",
    incomeContainer: ".income__list",
    expenseContainer: ".expenses__list",
    budgetContainer: ".budget__value",
    budgetIncomeContainer: ".budget__income--value",
    budgetExpenseContainer: ".budget__expenses--value",
    percentageContainer: ".budget__expenses--percentage",
    container: ".container",
    percentForExpense: ".item__percentage",
    dateLabel: ".budget__title--month",
  };

  var formatNumber = function (num, type) {
    var numSplit;
    /*
        1) add + or - before the number
        2) add commans
        3) round off the decimels upto 2 digits
         */

    num = Math.abs(num);
    num = num.toFixed(2);

    numSplit = num.split(".");
    int = numSplit[0];
    if (int.length > 3) {
      int =
        int.substr(0, int.length - 3) +
        "," +
        int.substr(int.length - 3, int.length);
    }

    dec = numSplit[1];

    return (type === "exp" ? "-" : "+") + " " + int + "." + dec;
  };

  var nodeListForEach = function (list, callback) {
    for (var i = 0; i < list.length; i++) {
      callback(list[i], i);
    }
  };

  return {
    getInput: function () {
      return {
        type: document.querySelector(DOMstrings.inputType).value, //will be either 'inc' or 'exp';
        description: document.querySelector(DOMstrings.inputDescription).value,
        value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
      };
    },

    addListItem: function (obj, type) {
      var html, newHtml, element;
      //Create html strings with some placeholder text
      if (type === "inc") {
        element = DOMstrings.incomeContainer;
        html =
          '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        element = DOMstrings.expenseContainer;
        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">%percentage%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      // replace those placeholders with some actual data
      // we will use a new method to replace some parts of html strings with data
      newHtml = html.replace("%id%", obj.id); // first parameter is the string to be replaced and 2nd is to be replaced with
      newHtml = newHtml.replace("%description%", obj.description); //we will replace in newHtml now otherwise it will use the original string
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));
      newHtml = newHtml.replace("%percentage", obj.percentage);

      //adding that data onto the UI
      document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
      //console.log(newHtml)
    },

    deleteListitem: function (selectorId) {
      var el;
      el = document.getElementById(selectorId);
      el.parentNode.removeChild(el);
    },

    clearFields: function () {
      document.querySelector(DOMstrings.inputDescription).value = "";
      document.querySelector(DOMstrings.inputValue).value = "";
      document.querySelector(DOMstrings.inputDescription).focus();
    },

    budgetUI: function (budgetObj) {
      var type;
      budgetObj.budget > 0 ? (type = "inc") : (type = "exp");
      document.querySelector(
        DOMstrings.budgetContainer
      ).textContent = formatNumber(budgetObj.budget, type);
      document.querySelector(
        DOMstrings.budgetIncomeContainer
      ).textContent = formatNumber(budgetObj.totalInc, "inc");
      document.querySelector(
        DOMstrings.budgetExpenseContainer
      ).textContent = formatNumber(budgetObj.totalexp, "exp");

      if (budgetObj.percentage !== -1) {
        document.querySelector(DOMstrings.percentageContainer).textContent =
          budgetObj.percentage + " %";
      } else {
        document.querySelector(DOMstrings.percentageContainer).textContent =
          "---";
      }
    },

    displayPercentages: function (percentage) {
      var fields = document.querySelectorAll(DOMstrings.percentForExpense);

      nodeListForEach(fields, function (current, index) {
        if (percentage[index] > 0) {
          current.textContent = percentage[index] + "%";
        } else {
          current.textContent = "---";
        }
      });
    },

    displayDate: function () {
      var now,
        year,
        monthArr = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];
      now = new Date();
      year = now.getFullYear();
      monthNum = now.getMonth();
      month = monthArr[monthNum];

      document.querySelector(DOMstrings.dateLabel).textContent =
        month + " , " + year;
    },

    changedType: function () {
      var fields = document.querySelectorAll(
        DOMstrings.inputType +
          "," +
          DOMstrings.inputDescription +
          "," +
          DOMstrings.inputValue
      );

      nodeListForEach(fields, function (cur) {
        cur.classList.toggle("red-focus");
      });

      document.querySelector(DOMstrings.addButton).classList.toggle("red");
    },

    getDomstrings: function () {
      return DOMstrings;
    },
  };
})();

//GLOBAL APP CONTROLLER
var controller = (function (budgetctrl, UIctrl) {
  var DOM = UIcontroller.getDomstrings();

  var setUpEventListeners = function () {
    document
      .querySelector(DOM.addButton)
      .addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", function (event) {
      if (event.keyCode === 13 || event.which === 13) {
        ctrlAddItem();
      }
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);
    document
      .querySelector(DOM.inputType)
      .addEventListener("change", UIctrl.changedType);
  };

  var updateBudget = function () {
    var budget;
    //calculate the budget
    budgetctrl.calculateBudget();

    //return the budget
    budget = budgetctrl.getBudget();
    //console.log(budget);

    //display it on the UI
    UIctrl.budgetUI(budget);
  };

  var updatePercentage = function () {
    //update percentage
    budgetctrl.calculatePercentages();

    // get percentage from budget controller
    var percentage = budgetctrl.getPercentage();
    //console.log(percentage);

    //update percentage on UI
    UIctrl.displayPercentages(percentage);
  };

  var ctrlAddItem = function () {
    var input, newItem;

    // getting the input values
    input = UIctrl.getInput();

    //sending it to budget controller
    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = budgetctrl.item(input.type, input.description, input.value);

      //displaying it on UI
      UIctrl.addListItem(newItem, input.type);
      UIctrl.clearFields();

      // budget
      updateBudget();

      // update percentage
      updatePercentage();
    }
  };

  var ctrlDeleteItem = function (event) {
    var itemId, splitId, type, Id;
    itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemId) {
      splitId = itemId.split("-");
      type = splitId[0];
      Id = splitId[1];

      // delete item from data structure
      budgetctrl.deleteItem(type, Id);

      //delete item from UI
      UIcontroller.deleteListitem(itemId);

      // re-calculate budget
      updateBudget();

      // update percentage
      updatePercentage();
    }
  };
  return {
    init: function () {
      console.log("Application has started");

      setUpEventListeners();
      UIctrl.budgetUI({ budget: 0, totalInc: 0, totalexp: 0, percentage: -1 });
      UIctrl.displayDate();
    },
  };
})(budgetController, UIcontroller);

controller.init();
