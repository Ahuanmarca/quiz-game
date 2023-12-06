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

    buildApiUrl(level, category) {
      return `https://quiz-api-ofkh.onrender.com/questions/random?level=${level}&category=${category}`;
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

    _classes: {
      correctAnswerColor: "correct-answer-color",
      incorrectAnswerColor: "incorrect-answer-color",
      pendingAnswerBox: "pending-answer-box",
      correctAnswerBox: "correct-answer-box",
      incorrectAnswerBox: "incorrect-answer-box",
    },

    get classes() {
      return this._classes;
    },

    // ? HOW CAN I INSERT A METHOD IN A SELECTED NODE?
    // _addClass: {
    //   correctAnswerColor(e) {
    //     e.target.classList.add(this.classes.correctAnswerColor);
    //   }
    // },
    // get addClass() {
    //   return this._addClass;
    // },

    _nodes: {
      get optionButtons() {
        return document.querySelectorAll(".options");
      },
      getOptionButton(currentOption) {
        return document.querySelector(`.option-${currentOption}`);
      },
      getOptionText(currentOption) {
        return document.querySelector(`.option-text-${currentOption}`);
      },
      get questionText() {
        return document.querySelector(".question-text");
      },
      get feedbackText() {
        return document.querySelector(".feedback-text");
      },
      get wildCardButtons() {
        return document.querySelectorAll(".wildcard-button");
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
      get progressBox() {
        // Not using "this"... bad smell?
        return document.querySelector(`.progress-box-${game.round}`);
      },
    },

    get nodes() {
      return this._nodes;
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

  // Each wildcard requires a different set of instructions
  resetWildcards(question, game);

  game.nodes.progressBox.classList.add(game.classes.pendingAnswerBox);

  Object.keys(question.answers).forEach((currentOption) => {
    // I would prefer to just iterate the buttons, but I need to pass the character (currentOption)
    resetOption(question, game, currentOption);
  });
}

function resetOption(question, game, currentOption) {
  game.nodes.getOptionText(currentOption).innerText =
    question.answers[currentOption];
  const optionButton = game.nodes.getOptionButton(currentOption);
  optionButton.classList.remove(game.classes.correctAnswerColor);
  optionButton.classList.remove(game.classes.incorrectAnswerColor);
  optionButton.addEventListener("click", () => {
    handleAnswer(question, game, currentOption);
  });
}

function handleAnswer(question, game, currentOption) {
  if (question.correctAnswer === currentOption) {
    game.nodes
      .getOptionButton(question.correctAnswer)
      .classList.add(game.classes.correctAnswerColor);
    // .addClass.correctAnswerColor(); // TODO REFACTOR TO METHOD LIKE THIS 🍎

    game.nodes.progressBox.classList.remove(game.classes.pendingAnswerBox);
    game.nodes.progressBox.classList.add(game.classes.correctAnswerBox);
  } else {
    game.nodes
      .getOptionButton(currentOption)
      .classList.add(game.classes.incorrectAnswerColor);
    game.nodes
      .getOptionButton(question.correctAnswer)
      .classList.add(game.classes.correctAnswerColor);
    game.nodes.progressBox.classList.remove(game.classes.pendingAnswerBox);
    game.nodes.progressBox.classList.add(game.classes.incorrectAnswerBox);
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
  game.nodes.wildCardButtons.forEach((wildCardButton) => {
    const oldElement = wildCardButton;
    const newElement = oldElement.cloneNode(true);
    oldElement.parentNode.replaceChild(newElement, oldElement);
  });

  const currentQuestionState = {
    usedEliminateHalf: false,
    eliminatedOptions: [],
  };

  // WILDCARD 1: ELIMINATE TWO WRONG ANSWERS
  game.nodes.eliminateHalfBtn.addEventListener(
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
      // in case WILDCARD 2 is fired this same round
      currentQuestionState.usedEliminateHalf = true;
      currentQuestionState.eliminatedOptions.push(...eliminatingOptions);

      eliminatingOptions.forEach((optionLetter) => {
        game.nodes
          .getOptionButton(optionLetter)
          .classList.add(game.classes.incorrectAnswerColor);
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
      const response = await fetch(game.buildApiUrl(level, category));
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
