export function createGame(debug) {
  const game = {
    _round: 0,
    _active: true,
    _delay: 3000,
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

    get isActive() {
      return game._active;
    },

    // Pauses the game by removing Event Listeners, should be called
    // when there's no need to use the event anymore
    // i.e. not before "e.target.disabled = true"
    pause() {
      this._active = false;
      game.removeEventListeners(game.nodes.optionButtons);
      game.removeEventListeners(game.nodes.wildCardButtons);
    },

    unpause() {
      this._active = true;
    },

    removeEventListeners(nodes) {
      // Snippet: https://stackoverflow.com/questions/9251837/how-to-remove-all-listeners-in-an-element
      nodes.forEach((node) => {
        const oldElement = node;
        const newElement = oldElement.cloneNode(true);
        oldElement.parentNode.replaceChild(newElement, oldElement);
      });
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
      superContainer: "super-container",
      gameContainer: "game-container",
      leftBox: "left-box",
      rightBox: "right-box",
      questionContainer: "question-container",
      questionText: "question-text",
      progressBar: "progress-bar",
      progressBox: "progress-box",
      wildcardButtonsContainer: "wildcard-buttons-container",
      wildcardButton: "wildcard-button",
      eliminateHalf: "eliminate-half",
      callFriend: "call-friend",
      changeQuestion: "change-question",
      feedbackContainer: "feedback-container",
      feedbackText: "feedback-text",
      optionButtonsContainer: "option-buttons-container",
      optionButton: "option-button",
      optionLetterContainer: "option-letter-container",
      optionLetter: "option-letter",
      optionTextContainer: "option-text-container",
      optionText: "option-text",

      correctAnswerColor: "correct-answer-color",
      incorrectAnswerColor: "incorrect-answer-color",
      pendingAnswerBox: "pending-answer-box",
      correctAnswerBox: "correct-answer-box",
      incorrectAnswerBox: "incorrect-answer-box",
    },

    get classes() {
      return this._classes;
    },

    // TODO => EVEN THIS GETTERS SHOULDN'T USE HARDCODED STRINGS
    // TODO => ALL CLASSES MUST FLOW FROM THE SAME ORIGIN
    _nodes: {
      get optionButtons() {
        return document.querySelectorAll(`.${game.classes.optionButton}`);
        // return document.getElementsByClassName(game.classes.optionButton);
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
  return game;
}