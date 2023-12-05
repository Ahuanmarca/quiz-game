async function run(debug = false) {
  const game = {
    _round: 0,
    _active: true,
    _delay: 3000,
    // currentQuestion: [],
    _categories: {
      HTML: "html",
      CSS: "css",
      JavaScript: "javascript",
    },

    _levels: {
      easy: "easy",
      medium: "medium",
      hard: "hard",
      obscure: "obscure",
    },

    get round() {
      return this._round;
    },

    set round(value) {
      this._round = value;
    },

    get delay() {
      if (debug) return 100;
      return this._delay;
    },

    increaseRound() {
      this.round++;
    },

    decreaseRound() {
      this.round--;
    },

    getRandomCategory() {
      if (debug) return this._categories.JavaScript;
      const categoryArr = Object.values(this._categories);
      return categoryArr[Math.floor(Math.random() * categoryArr.length)];
    },

    get level() {
      if (debug) return this._levels.easy;
      if (this.round <= 5) {
        return this._levels.easy;
      } else if (this.round <= 10) {
        return this._levels.medium;
      } else {
        return this._levels.hard;
      }
    },

    selectors: {
      optionButtons: ".options",
      questionText: ".question-text",
      feedbackText: ".feedback-text",
      callFriendButton: ".call-friend",
      eliminateHalfButton: ".eliminate-half",
      changeQuestionButton: ".change-question",
    },

    _nodes: {
      get optionButtons() {
        return document.querySelectorAll(".options");
      },
      getOptionButton(currentOption) {
        return document.querySelector(`.option-${currentOption}`);
      },
      get questionText() {
        return document.querySelector(".question-text");
      },
      get feedbackText() {
        return document.querySelector(".feedback-text");
      },
      get callFriendBtn() {
        return document.querySelector(".call-friend");
      },
      get eliminateHalfBtn() {
        return document.querySelector(".eliminate-half");
      },
      get changeQuestionBtn() {
        return document.querySelector(".change-question");
      },
    },

    get nodes() {
      return this._nodes;
    },

    get progressBox() {
      return document.querySelector(`.progress-box-${this.round}`);
    },
  };

  await advanceRound(game);
}

async function advanceRound(game) {
  game.increaseRound();
  const question = await getQuestion(game);
  question.shuffleAnswers();

  // Remove Event Listeners from Option Buttons
  // Snippet: https://stackoverflow.com/questions/9251837/how-to-remove-all-listeners-in-an-element
  game.nodes.optionButtons.forEach((optionNode) => {
    const oldElement = optionNode;
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);
  });

  game.nodes.questionText.innerText = question.description;
  game.nodes.feedbackText.innerText = "";

  resetWildcards(question, game); // ! ⬅ REFACTORRRR 💀👻👀

  game.progressBox.classList.add("pending-answer-box"); // TODO HARDCODE

  Object.keys(question.answers).forEach((currentOption) => {
    resetOption(question, game, currentOption);
  });
}

function displayOnPage(selector, content) {
  if (!selector || content === undefined) {
    alert("missing arguments on displayOnPage()");
  }
  const selectedNode = document.querySelector(selector);
  selectedNode.innerText = content;
}

function resetOption(question, game, currentOption) {
  displayOnPage(
    `.option-text-${currentOption}`,
    question.answers[currentOption]
  );
  const optionButton = game.nodes.getOptionButton(currentOption);
  optionButton.classList.remove("correct-answer-color");
  optionButton.classList.remove("incorrect-answer-color");
  optionButton.addEventListener("click", () => {
    handleAnswer(question, game, currentOption);
  });
}

function handleAnswer(question, game, currentOption) {
  if (question.correctAnswer === currentOption) {
    game.nodes
      .getOptionButton(question.correctAnswer)
      .classList.add("correct-answer-color");
    game.progressBox.classList.remove("pending-answer-box");
    game.progressBox.classList.add("correct-answer-box");
  } else {
    game.nodes
      .getOptionButton(currentOption)
      .classList.add("incorrect-answer-color");
    game.nodes
      .getOptionButton(question.correctAnswer)
      .classList.add("correct-answer-color");
    game.progressBox.classList.remove("pending-answer-box");
    game.progressBox.classList.add("incorrect-answer-box");
  }

  if (question.feedback) {
    game.nodes.feedbackText.innerText = question.feedback;
  }

  // * After handling the answer, we need to advance the turn.
  setTimeout(
    async () => {
      await advanceRound(game);
    },
    question.feedback ? game.delay * 2 : game.delay
  );
}

function resetWildcards(question, game) {
  // WILD CARD BUTTONS
  const wildCardClasses = [
    ".eliminate-half",
    ".call-friend",
    ".change-question",
  ];

  // * Remove event listeners from wild card buttons
  wildCardClasses.forEach((buttonClass) => {
    const old_element = document.querySelector(buttonClass);
    const new_element = old_element.cloneNode(true);
    old_element.parentNode.replaceChild(new_element, old_element);
  });

  const currentQuestionState = {
    usedEliminateHalf: false,
    eliminatedOptions: [],
  };

  // WILDCARD 1: ELIMINATE 2 WRONG ANSWERS
  game.nodes.eliminateHalfBtn.addEventListener(
    // eliminateHalfButton.addEventListener(
    "click",
    (e) => {
      e.target.disabled = true;
      const answersCopy = { ...question.answers };
      delete answersCopy[question.correctAnswer];
      delete answersCopy[
        Object.keys(answersCopy)[
          Math.floor(Math.random() * Object.keys(answersCopy).length)
        ]
      ];
      const eliminatingOptions = Object.keys(answersCopy);

      // Remember wildcard use and eliminated options,
      // in case WILDCARD 2 is fired this round
      currentQuestionState.usedEliminateHalf = true;
      currentQuestionState.eliminatedOptions.push(...eliminatingOptions);

      eliminatingOptions.forEach((optionLetter) => {
        game.nodes
          .getOptionButton(optionLetter)
          .classList.add("incorrect-answer-color");
      });
    },
    { once: true }
  );

  // WILDCARD 2: CALL A FRIEND
  game.nodes.callFriendBtn.addEventListener(
    "click",
    (e) => {
      e.target.disabled = true;
      const friendIsCorrect =
        Math.random() > (currentQuestionState.usedEliminateHalf ? 0.1 : 0.3);

      if (friendIsCorrect) {
        game.nodes.feedbackText.innerText = `The answer is letter ${question.correctAnswer}!`;
      } else {
        const badAnswers = Object.keys(question.answers).filter(
          (q) => q !== question.correctAnswer
        );
        const badAnswer =
          badAnswers[Math.floor(Math.random) * badAnswers.length];
        game.nodes.feedbackText.innerText = `The answer is letter ${badAnswer}! 👻`;
      }
    },
    { once: true }
  );

  // WILDCARD 3: CHANGE QUESTION WITHOUT INCREASEING THE ROUND
  game.nodes.changeQuestionBtn.addEventListener(
    "click",
    (e) => {
      e.target.disabled = true;
      setTimeout(async () => {
        game.decreaseRound(); // Round "repeats" because of wildcard
        await advanceRound(game);
      }, 1000);
    },
    { once: true }
  );
}

const getQuestion = (function () {
  const usedQuestions = [];

  async function getQuestion(game) {
    const level = game.level;
    const category = game.getRandomCategory();
    try {
      const response = await fetch(
        `https://quiz-api-ofkh.onrender.com/questions/random?level=${level}&category=${category}`
      );
      const data = await response.json();
      if (usedQuestions.includes(data._id)) {
        console.warn("Repeated question, fetching again.");
        return await getQuestion(game);
      } else {
        usedQuestions.push(data._id);
        console.log("Used questions:", usedQuestions);
        data.shuffleAnswers = shuffleAnswers;
        return data;
      }
    } catch (TypeError) {
      const mockData = {
        _id: "764833b63g55044199542d84",
        description: "¿Cuál es la capital del Perú?",
        answers: {
          a: "Iquitos",
          b: "Lima",
          c: "Cusco",
          d: "Arequipa",
        },
        correctAnswer: "b",
        feedback: "Esta pregunta es un placeholder cuando falla la red.",
      };
      mockData.shuffleAnswers = shuffleAnswers;
      return mockData;
    }
  }
  return getQuestion;
})();

function shuffleAnswers() {
  // Get an entries array from the answers [["a","foo"]["b","bar"]["c","baz"]]
  const answerArr = Object.entries(this.answers);
  // Shuffle the entries array in place [["c","baz"],["a","foo"],["b","bar"]]
  answerArr.sort(() => 0.5 - Math.random());

  // How do we find the letter of the correct answer in the shuffled array?
  // -> Use game.correctAnswer to find index in shuffled array
  // index 0 -> letter 'a', index 1 -> letter 'b', etc
  const letterOfCorrectAnswerInNewPosition = Object.keys(this.answers)[ // "abcd"
    answerArr.findIndex((entry) => entry[0] === this.correctAnswer)
  ]; // ! ⬅ DIFFICULT TO READ !! 😵‍💫

  // Reassign the letters in the shuffled array [["c","baz"],["a","foo"],["b","bar"]]
  // so they are in the correct order [["a","baz"],["b","foo"],["c","bar"]]
  Object.keys(this.answers).forEach((currentOption, index) => {
    answerArr[index][0] = currentOption;
  });

  this.answers = Object.fromEntries(answerArr);
  this.correctAnswer = letterOfCorrectAnswerInNewPosition;
}

run(true);
