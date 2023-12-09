import { createGame } from "./src/createGame.js";
import { buildPage } from "./src/buildPage.js";

async function run(debug = false) {
  const game = createGame(debug);
  const superContainer = buildPage(game);
  const root = document.querySelector(".root");
  root.appendChild(superContainer);
  await advanceRound(game);
}

async function advanceRound(game) {
  game.increaseRound();
  const question = await getQuestion(game);
  question.shuffleAnswers();

  game.nodes.questionText.innerText = question.description;
  game.nodes.feedbackText.innerText = "";

  // LOREM IPSUM TO DEBUG FEEDBACK TEXT
  // game.nodes.feedbackText.innerText = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.";

  // Each wildcard requires a different set of instructions
  resetWildcards(question, game);

  game.nodes.progressBox.classList.add(game.classes.pendingAnswerBox);

  Object.keys(question.answers).forEach((currentOption) => {
    // I need to pass each character from question keys
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

  // After handling the answer, we need to advance the turn.
  game.pause();
  if (game.round < 15) {
    setTimeout(
      async () => {
        await advanceRound(game);
        game.unpause();
      },
      question.feedback ? game.delay * 2 : game.delay
    );
  } else {
    setTimeout(() => {
      game.nodes.feedbackText.innerText = "GAME OVER";
      game.nodes.feedbackText.classList.add(game.classes.incorrectAnswerColor);
    }, game.delay);
  }
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
      e.target.classList.add("wildcard-button-inactive"); // TODO HARDCODE FIX
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
      e.target.classList.add("wildcard-button-inactive"); // TODO HARDCODE FIX
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
      // game.pause() must be called after disabling the button
      e.target.disabled = true;
      e.target.classList.add("wildcard-button-inactive"); // TODO HARDCODE FIX
      game.pause();
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
        console.warn("Repeated Question, Fetching Again.");
        return await getQuestion(game);
      } else {
        usedQuestions.push(data._id);
        console.log("Used questions:", usedQuestions);
        data.shuffleAnswers = shuffleAnswers;
        return data;
      }
    } catch (TypeError) {
      // TODO: WILL THIS WORK?
      console.warn("Network Error, Fetching Again.");
      return await getQuestion(game);
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