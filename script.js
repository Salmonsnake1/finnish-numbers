const genButton = document.getElementById("genButton");
const inputForm = document.getElementById("form");
const switchButton = document.getElementById("switchButton");
const radioButtons = document.querySelectorAll('input[name="ranges"]');
const customRangeInputs = document.getElementById('customRangeInputs');
const input = document.getElementById("input");
const selectAllBox = document.getElementById("selectAllCases");
const caseCheckboxes = document.querySelectorAll('input[name="cases"]');
const shortCheckBox = document.getElementById("shortAnswers");


let max = 100; // initial max range 
let min = 0; // initial min range
let ranNum = 0; // stores current generated nmber
let caseChoice = "nominative"; // default grammatical case
let checkedCases = ["nominative"];
let wordAnswer = ""; // correct answer in text
let count = 0; // current streak
let streak = 0; // highest streak
let cases = {}; // holds case data from JSON
let ordinalCases = {}; // holds ordinalcase data from JSON
let pluralCases = {};
let pluralOrdinalCases = {};
let shortenCases = {};
let shortenOrdinals = {};
let shortenPluralCases = {};
let shortenPluralOrdinals = {};
let numView = true; // number is shown when true, word when false
let ordinalView = false; // sets so basic numbers first
let pluralView = false; // sets so singular first
let ekatokaAnswer = ""; // sets for the ensimmäinen, toinen, yhdes, kahdes switch
let displayWordAnswer = ""; // for displaying the answer to the user
let altNum = ""; // when ordinals have :s ending
let shortDisplayNum = "";
let ranNumCase = 0;
let ekatokaNum = "test";

const topButton = document.getElementById('ordButton');
const underButton = document.getElementById('pluralButton');

const buttonWidth = topButton.offsetWidth / 2;
underButton.style.marginLeft = `${buttonWidth}px`;
underButton.style.marginRight = `${buttonWidth}px`;

// Event listeners

// Updates checkboxes when "Select All" changes
selectAllBox.addEventListener('change', () => {
  const isChecked = selectAllBox.checked;

  caseCheckboxes.forEach(checkbox => {
    if (!isChecked && checkbox.value === 'nominative') return;

    checkbox.checked = isChecked;
  });

  updateCheckedCases(); 
});

// Updates selectall if one is unchecked. 
caseCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener("change", function () {
    const allChecked = Array.from(caseCheckboxes).every(cb => cb.checked);
    selectAllBox.checked = allChecked;
  });
});

// switching from basic to ordinals
ordButton.addEventListener("click", function(event) {
  ordinalView = !ordinalView;
  genRanNum();
  if (!ordinalView) {
    document.getElementById("ordButton").textContent = "Switch to Ordinals"
  } else {
    document.getElementById("ordButton").textContent = "Switch to Basic"
  }
}) 

// switching from singular to plural
pluralButton.addEventListener("click", function(event) {
  pluralView = !pluralView;
  genRanNum();
  if (!pluralView) {
    document.getElementById("pluralButton").textContent = "Switch to Plural"
  } else {
    document.getElementById("pluralButton").textContent = "Switch to Singular"
  }
}) 

// for making it so have to use number shortenings
shortAnswers.addEventListener("click", function(event) {
  genRanNum();
})

// for user input
ansButton.addEventListener("click", function(event) {
  event.preventDefault();

  const inputValue = document.getElementById("input").value;

    // validates answer and returns corresponding error message. numView wants a text answer, !numView wants a number answer
    if (inputValue === "") {
      checkAnswer();
      return;
    }
    if (numView && !isNaN(inputValue)) {
      checkAnswer();
      return;
    }
    if (!numView && isNaN(inputValue)) {
      checkAnswer();
      return;
    }
    // checks answer correctness and generates a new number
    checkAnswer();
   // genRanNum();
}) 
// for user input
input.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();

    const inputValue = document.getElementById("input").value;

    // validates answer and returns corresponding error message. numView wants a text answer, !numView wants a number answer
    if (inputValue === "") {
      checkAnswer();
      return;
    }
    if (numView && !isNaN(inputValue)) {
      checkAnswer();
      return;
    }
    if (!numView && isNaN(inputValue)) {
      checkAnswer();
      return;
    }
    // checks answer correctness and generates a new number
    checkAnswer();
    genRanNum();
  }
});
// Resets input field size after submitting answer
input.addEventListener("input", function () {
  this.style.height = "auto";      
  this.style.height = this.scrollHeight + "px"; 
});

// Prevents customMin going out range limits (0-1000000)
document.getElementById("customMin").addEventListener('input', function () {
  let customMin = this.value.trim();
  
  customMin = customMin.replace(/^0+/, '');

  if (customMin === '') {
    this.value = '0';
    return; 
  }

  customMin = parseInt(customMin, 10);
  const customMax = parseInt(document.getElementById("customMax").value, 10);

  if (customMin < 0) {
      this.value = '0';
  } else if (customMin > 1000000) {
      this.value = '1000000';
  } else if (customMin > customMax) {
      this.value = customMax.toString(); 
  } else {
      this.value = customMin.toString();
  }
});

// Prevents customMax going out range limits (0-1000000)
document.getElementById("customMax").addEventListener('input', function () {
  let customMax = this.value.trim(); 
  
  customMax = customMax.replace(/^0+/, '');

  if (customMax === '') {
    this.value = '0';
    return;
  }

  customMax = parseInt(customMax, 10);
  const customMin = parseInt(document.getElementById("customMin").value, 10);

  if (customMax < 0) {
      this.value = '0';
  } else if (customMax > 1000000) {
      this.value = '1000000';
  } else if (customMax < customMin) {
      this.value = customMin.toString();
  } else {
      this.value = customMax.toString();
  }
});

// Makes min max fields visible when custom range selected
radioButtons.forEach((radio) => {
  radio.addEventListener('change', () => {
    if (radio.value === 'custom' ) {
      customRangeInputs.classList.remove('visually-hidden');
    } else {
      customRangeInputs.classList.add('visually-hidden');
    }
  });
});

// Generates a new number when gen button clicked
genButton.addEventListener("click", function(event) {
    genRanNum();
});

// Toggles between digit and word view of the number
switchButton.addEventListener("click", function(event) {
  switchRan();
});

// Updates range values to match custom selected
document.getElementById("customRangeInputs").addEventListener("change", () => {
  const customMin = parseInt(document.getElementById("customMin").value, 10);
  const customMax = parseInt(document.getElementById("customMax").value, 10);

  rangeChange(customMin, customMax);
  genRanNum();
});

//querySelectors
// Range values update accordingly based on range selection
document.querySelectorAll('input[name="ranges"]').forEach((input) => {
  input.addEventListener('change', (e) => {
      const radioValue = e.target.value;
      // Ensures on custom select 1 and 10 is default
      if (radioValue === "custom") {
        rangeChange(1, 10);
        document.getElementById("customMin").value = 1;
        document.getElementById("customMax").value = 10;
        genRanNum();

      } else {
      const [minVal, maxVal] = e.target.value.split('-').map(Number);
      rangeChange(minVal, maxVal);
      genRanNum();
      }
  });
});

// Updates case based on selection
document.querySelectorAll('input[name="cases"]').forEach((input) => {
  input.addEventListener('change', updateCheckedCases);
});   

// Starts the program
startProg();

//Functions
// Ensures json file loads first then generates a number.
async function startProg() {
  // resets everything on refresh or reload - TODO there's likely a better solution.
  document.querySelector("#range1").checked = true;
  customRangeInputs.classList.add("visually-hidden");
  rangeChange(1, 10);
  document.getElementById("customMin").value = 1;
  document.getElementById("customMax").value = 10;
  document.querySelectorAll('input[name="cases"]').forEach((box) => {
    box.checked = (box.id === "case1");
  });
  document.getElementById("selectAllCases").checked = false;
  checkedCases = ["nominative"];
  caseChoice = "nominative";
  numView = true;
  ordinalView = false;
  pluralView = false;
  document.getElementById("ordButton").textContent = "Switch to Ordinals";
  document.getElementById("switchButton").textContent = "Switch to Text";
  count = 0;
  streak = 0;
  document.getElementById("input").value = "";
  document.getElementById("input").style.height = "auto";
  document.getElementById("input").rows = 1;
  shortCheckBox.checked = false;

  await loadCases();     
  genRanNum();                
}

// Loading json file to cases
async function loadCases() {
  try {
    const response = await fetch('./cases.json');
    cases = await response.json();
    const responseOrdinal = await fetch('./ordinals.json');
    ordinalCases = await responseOrdinal.json();
    const pluralResponse = await fetch('./pluralcases.json');
    pluralCases = await pluralResponse.json();
    const pluralOrdinalResponse = await fetch('./pluralordinals.json');
    pluralOrdinalCases = await pluralOrdinalResponse.json();
    const shortenCasesResponse = await fetch('./shortencases.json');
    shortenCases = await shortenCasesResponse.json();
    console.log(shortenCases);
    const shortenOrdinalsResponse = await fetch('./shortenordinals.json');
    shortenOrdinals = await shortenOrdinalsResponse.json();
    console.log(shortenOrdinals);
    const shortenPluralCasesResponse = await fetch ('./shortenpluralcases.json');
    shortenPluralCases = await shortenPluralCasesResponse.json();
    console.log(shortenPluralCases);
    const shortenPluralOrdinalsResponse = await fetch ('./shortenpluralordinals.json');
    shortenPluralOrdinals = await shortenPluralOrdinalsResponse.json();
    console.log(shortenPluralOrdinals);
  } catch (error) {
    console.error("Error loading cases:", error);
    document.getElementById("countBox").textContent = "Error loading cases, please try to reload";
  }
}

// updates array based on selection
function updateCheckedCases() {
  checkedCases = Array.from(document.querySelectorAll('input[name="cases"]:checked'))
    .map(input => input.value);

  if (checkedCases.length === 0) {
    checkedCases = ["nominative"];
  }

  genRanNum();
}

// Sets new range for num generation based on user selection
function rangeChange(lowest, highest) {
    min = lowest;
    max = highest;
}

// Generates a random number based on min max ranges, they are inclusive.
function genRanNum() {
    if (isNaN(min) || isNaN(max)) {
      console.error("Min and max range are not valid numbers");
      document.getElementById("countBox").textContent = "Incorrect ranges selected, either adjust custom range or reload page";
      return;
    }
    ekatokaAnswer = "";

    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    ranNum = Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); 

    defineAnswer();

    console.log(displayWordAnswer);
    console.log(wordAnswer);

    ranNumCase = ranNum;
    shortDisplayNum = ranNum.toString();

    if (shortCheckBox.checked) {
      shortDisplayNum = addNumberEnding(shortDisplayNum, ranNumCase);
    }
    
    if (numView) {
      document.getElementById("numBox").textContent = shortDisplayNum; 
    } else {
      document.getElementById("numBox").textContent = displayWordAnswer; 
      // document.getElementById("numBox").innerHTML = wordAnswer;
      
    }
    document.getElementById("input").focus();
}

// adds ending for number form
function addNumberEnding(displayNum, numIdent) {
  const jsonType = shortCaseType();
  ones = numIdent % 10;
  tens = Math.floor((numIdent % 100) / 10);
  hundreds = Math.floor((numIdent % 1000) / 100);
  thousands = Math.floor((numIdent % 10000) / 1000);
  const tenThousands = Math.floor((numIdent % 100000) / 10000);
  const hundredThousands = Math.floor((numIdent % 1000000) / 100000);

  if (ones > 0) {
    if (ordinalView && (ones === 1 || ones === 2)) {
          let onesChoice = "";
          (ones === 1) ? onesChoice = "eka" : ones;
          (ones === 2) ? onesChoice = "toka" : ones;
          ekatokaNum = displayNum + jsonType[onesChoice][caseChoice]
        }
  }

  if (caseChoice !== "nominative") {
    if (numIdent === 0) {
      displayNum = displayNum + jsonType[0][caseChoice];
    } else if (ones > 0) {
      displayNum = displayNum + jsonType[ones][caseChoice];
    } else if (tens > 0 && ones === 0) {
      displayNum = displayNum + jsonType[10][caseChoice];
    } else if (hundreds > 0 && tens === 0 && ones === 0) {
      displayNum = displayNum + jsonType[100][caseChoice];
    } else if (thousands > 0 && hundreds === 0 && tens === 0 && ones === 0) {
      displayNum = displayNum + jsonType[1000][caseChoice];
    } else if (tenThousands > 0) {
      displayNum = displayNum + jsonType[1000][caseChoice];
    } else if (hundredThousands > 0) {
      displayNum = displayNum + jsonType[1000][caseChoice];
    } else if (numIdent === 1000000) {
      displayNum = displayNum + jsonType[1000000][caseChoice];
    }
  }

  console.log(ekatokaNum)

  if (caseChoice === "nominative" && ordinalView) {
    altNum = displayNum + ":s";
    displayNum = displayNum + ".";
  }
  console.log(altNum);
  console.log(jsonType);
  console.log(displayNum);

  return displayNum;
}

// Converts number into word form
function defineAnswer() {
  // checks for above million because can expand up to million million later potentially
  caseChoice = checkedCases[Math.floor(Math.random() * checkedCases.length)];
  // checks for the value in the list that corresponds and sets the textContent to the label
  const input = document.querySelector(`input[name="cases"][value="${caseChoice}"]`);

  if (input) {
    const label = document.querySelector(`label[for="${input.id}"]`);
    if (label) {
      document.getElementById("displayCase").textContent = label.textContent;
    } else {
      document.getElementById("displayCase").textContent = caseChoice; 
    }
  } else {
    document.getElementById("displayCase").textContent = caseChoice;
  }


  const numType = getNumType();

  if (ranNum >= 1000000) {
    wordAnswer = numType[ranNum][caseChoice]
    displayWordAnswer = wordAnswer;
    return;
  }

  if (ranNum >= 1000) {
    parts = getThousands(ranNum);
    console.log(parts);
    displayWordAnswer = parts.join("&shy;");
    wordAnswer = parts.join("");
    return;
  }

  if (ranNum >= 0) {
    parts = getHundreds(ranNum);
    displayWordAnswer = parts.join("&shy;");
    wordAnswer = parts.join("");
    return;
  }
}

// Converts the number to word for the hundreds, tens and ones.
function getHundreds(number) {
  let hundreds = Math.floor(number / 100);
  let tens = Math.floor((number % 100) / 10);
  let ones = number % 10;
  let tenshunsCase = joinNumCaseSwitch();

  const numType = getNumType();

  let numParts = [];

  if (number === 100) {
    numParts.push(numType[100][caseChoice]);
  } else if (number === 0 ) {
    numParts.push(numType[0][caseChoice]);
  } else {
    if (hundreds === 1) {
      numParts.push(numType[100][caseChoice]);
    } else if (hundreds > 1) {
      numParts.push(numType[hundreds][caseChoice]);
      numParts.push(numType[100][tenshunsCase]);
    }
  
    if (tens === 1 && ones === 0) {
      numParts.push(numType[10][caseChoice]);
    } else {
      if (tens === 1 && ones > 0) {
        numParts.push(numType[ones][caseChoice] + "toista");
        return numParts;
      } else if (tens > 1) {
        numParts.push(numType[tens][caseChoice]);
        numParts.push(numType[10][tenshunsCase]);
      }

      if (ones > 0) {
        if (ordinalView && (ones === 1 || ones === 2)) {
          let onesChoice = "";
          (ones === 1) ? onesChoice = "eka" : ones;
          (ones === 2) ? onesChoice = "toka" : ones;
          let ekaTokaParts = [...numParts];
          ekaTokaParts.push(numType[onesChoice][caseChoice]);
          ekatokaAnswer = ekaTokaParts.join("");
        }
        numParts.push(numType[ones][caseChoice]);
      } 
    }
  }
  return numParts;
  
}

// Converts the number to word for thousands and getHundreds added from above if needed.
function getThousands(number) {
  let thousands = Math.floor(number / 1000);
  let hundreds = number % 1000;
  let thousCase = joinNumCaseSwitch();

  let numParts = [];

  const numType = getNumType();

  if (thousands === 1) {
    numParts.push(numType[1000][caseChoice]);
  } else {
    numParts.push(...getHundreds(thousands));
    numParts.push(numType[1000][thousCase]);
  }

  if (hundreds > 0) {
    numParts.push(...getHundreds(hundreds));
  }

  
  return numParts;
}

// Checks user answer against correct answer so either number in digit or word form
function checkAnswer() {
  const answer = document.getElementById("input").value.trim().toLowerCase();
  let correctAns = false;
  let shownAns = "";
  
  if (!answer) {
    document.getElementById("countBox").textContent = "Please enter an answer!"
    return;
  }

  if (numView) {
    if (!/^[a-zåäö\- ]+$/i.test(answer)) {
      document.getElementById("countBox").textContent = "Please enter only text!";
      document.getElementById("input").focus();
      return;
    }
    correctAns = (answer === wordAnswer);

    if (ordinalView) {
      correctAns = (answer === wordAnswer || answer === ekatokaAnswer);
    }

    shownAns = wordAnswer;
  } else {
    if (!shortCheckBox.checked && isNaN(answer)) {
      document.getElementById("countBox").textContent = "Please enter only digits!";
      document.getElementById("input").focus();
      return;
    } else if (!shortCheckBox.checked) {
      correctAns = (parseInt(answer) === ranNum);
      shownAns = ranNum;
    } else { 
      correctAns = (answer === shortDisplayNum);
      shownAns = shortDisplayNum;
    }
  }

  if (correctAns && !shortCheckBox.checked) {
    count++;
    if (ekatokaAnswer === "") {
    document.getElementById("countBox").innerHTML = "Correct! '<span class='red-word'>" + ranNum + "</span>' is '<span class='red-word'>" + 
    displayWordAnswer + "</span>' <br>Current Streak: " + count; 
    } else {
      document.getElementById("countBox").innerHTML = "Correct! '<span class='red-word'>" + ranNum + "</span>' is '<span class='red-word'>" + 
      displayWordAnswer + "</span>' or '<span class='red-word'>" + ekatokaAnswer + "</span>' <br>Current Streak: " + count; 
    }
    document.getElementById("input").value = "";
    // return; 
    // removed due to not generating a new answer but left commented in as this will all be tidied up
  } else if (!shortCheckBox.checked) {
    if (ekatokaAnswer === "") {
      count = 0;
      document.getElementById("countBox").innerHTML = "Incorrect! You wrote '<span class='red-word'>" + answer + "</span>' but '<span class='red-word'>" + ranNum + "</span>' is '<span class='red-word'>" + 
      displayWordAnswer + "</span>' <br>Current Streak: 0"; 
    } else {
      count = 0;
      document.getElementById("countBox").innerHTML = "Incorrect! You wrote '<span class='red-word'>" + answer + "</span>' but '<span class='red-word'>" + ranNum + "</span>' is '<span class='red-word'>" + 
      displayWordAnswer + "</span>' or '<span class='red-word'>" + ekatokaAnswer + "</span>' <br>Current Streak: 0";  
    }
  } else if (correctAns && shortCheckBox.checked) {
    count++;
    if (ekatokaAnswer === "") {
      document.getElementById("countBox").innerHTML = "Correct! '<span class='red-word'>" + shortDisplayNum + "</span>' is '<span class='red-word'>" + 
      displayWordAnswer + "</span>' <br>Current Streak: " + count; 
    } else {
      document.getElementById("countBox").innerHTML = "Correct! '<span class='red-word'>" + shortDisplayNum + "</span>' is '<span class='red-word'>" + 
      displayWordAnswer + "</span>' or '<span class='red-word'>" + ekatokaAnswer + "</span>' <br>Current Streak: " + count; 
    }
    document.getElementById("input").value = "";
    // return;
    // removed due to not generating a new answer but left commented in as this will all be tidied up
  } else {
    if (caseChoice !== "nominative") {
      if (ekatokaAnswer === "") {
        count = 0;
        document.getElementById("countBox").innerHTML = "Incorrect! You wrote '<span class='red-word'>" + answer + "</span>' but '<span class='red-word'>" + shortDisplayNum + "</span>' is '<span class='red-word'>" + 
        displayWordAnswer + "</span>' <br>Current Streak: 0"; 
      } else {
        count = 0;
        document.getElementById("countBox").innerHTML = "Incorrect! You wrote '<span class='red-word'>" + answer + "</span>' but '<span class='red-word'>" + 
        shortDisplayNum + "</span>' or '<span class='red-word'>" + ekatokaNum + "</span>' is '<span class='red-word'>" + 
        displayWordAnswer + "</span>' or '<span class='red-word'>" + ekatokaAnswer + "</span>' <br>Current Streak: 0";  
      }
    } else {
      if (ordinalView && shortCheckBox.checked) {
        if (ekatokaAnswer === "") {
          count = 0;
          document.getElementById("countBox").innerHTML = "Incorrect! You wrote '<span class='red-word'>" + answer + "</span>' but '<span class='red-word'>" + 
          shortDisplayNum + "</span>' or '<span class='red-word'>" + altNum + "</span>' is '<span class='red-word'>" + 
          displayWordAnswer + "</span>' <br>Current Streak: 0"; 
        } else {
          count = 0;
          document.getElementById("countBox").innerHTML = "Incorrect! You wrote '<span class='red-word'>" + answer + "</span>' but '<span class='red-word'>" + 
          shortDisplayNum + "</span>' or '<span class='red-word'>" + altNum + "</span>' is '<span class='red-word'>" + 
          displayWordAnswer + "</span>' or '<span class='red-word'>" + ekatokaAnswer + "</span>' <br>Current Streak: 0";  
        }
      } else if (ordinalView && !shortCheckBox.checked) {
        if (ekatokaAnswer === "") {
          count = 0;
          document.getElementById("countBox").innerHTML = "Incorrect! You wrote '<span class='red-word'>" + answer + "</span>' but '<span class='red-word'>" + shortDisplayNum + "</span>' is '<span class='red-word'>" + 
          displayWordAnswer + "</span>' <br>Current Streak: 0"; 
        } else {
          count = 0;
          document.getElementById("countBox").innerHTML = "Incorrect! You wrote '<span class='red-word'>" + answer + "</span>' but '<span class='red-word'>" + shortDisplayNum + "</span>' is '<span class='red-word'>" + 
          displayWordAnswer + "</span>' or '<span class='red-word'>" + ekatokaAnswer + "</span>' <br>Current Streak: 0";  
        }
      }
    }  
  }
  
    if (count > streak) {
    streak = count;
  }
  document.getElementById("streakBox").textContent = "Highest Streak: " + streak;
  document.getElementById("input").value = "";
  document.getElementById("input").style.height = "auto";
  document.getElementById("input").rows = 1;
  genRanNum();
  // count = 0;
}

// Switches between number and text display
function switchRan() {
  genRanNum();
  document.getElementById("input").value = "";

  numView = !numView;

  if (!shortCheckBox.checked) {
    document.getElementById("numBox").textContent = numView ? ranNum : displayWordAnswer;
    content = document.getElementById("numBox").textContent;
  } else {
    document.getElementById("numBox").innerHTML = numView ? shortDisplayNum : displayWordAnswer;
    content = document.getElementById("numBox").textContent;
  }

  document.getElementById("switchButton").textContent = numView ? "Switch to Text" : "Switch to Number";
}

// Ensures "connecting" numbers like ten, hundred, thousand are in partitive when the overall case is nominative, otherwise matching case.
function joinNumCaseSwitch() {
    if(!ordinalView && !pluralView) { 
      return (caseChoice === "nominative") ? "partitive" : caseChoice;
    }
    return caseChoice; 
}

// for switching between ordinals

function getNumType() {
  if (pluralView) {
    return ordinalView ? pluralOrdinalCases : pluralCases;
  } else {
    return ordinalView ? ordinalCases : cases;
  }
}

// for switching that the number and relevant answer needs the correct shortening ending :

function shortCaseType() {
  if (pluralView) {
    return ordinalView ? shortenPluralOrdinals : shortenPluralCases; 
  } else {
    return ordinalView ? shortenOrdinals : shortenCases;
  }
}