async function runGame() {
  const gameState = {
    round: 1,
    // usedWildCards: {
    // eliminateHalf: false,
    // callFriend: false,
    // changeQuestion: false,
    // },
    active: true,
  };

  const question = await getQuestion(gameState);
  resetQuestion(question, gameState);
}

function resetQuestion(question, gameState) {
  // Question
  const questionText = document.querySelector(".question-text");
  questionText.innerText = question.description;

  const correctAnswer = question.correctAnswer;

  const feedbackText = document.querySelector(".feedback-text");
  feedbackText.innerText = "";

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

  // WILD CARD 1: ELIMINATE 2 WRONG ANSWERS FROM THE OPTIONS
  const eliminateHalfButton = document.querySelector(".eliminate-half");
  eliminateHalfButton.addEventListener(
    "click",
    () => {
      const answersCopy = { ...question.answers };
      // delete the correct answer from this object
      delete answersCopy[correctAnswer];
      // delete another random answer from the object
      delete answersCopy[
        Object.keys(answersCopy)[Math.floor(Math.random() * 3)]
      ];
      const eliminatingOptions = Object.keys(answersCopy);

      // * Remember wildcard usage and eliminated options
      currentQuestionState.usedEliminateHalf = true;
      currentQuestionState.eliminatedOptions.push(...eliminatingOptions);

      eliminatingOptions.forEach((optionLetter) => {
        console.log("This option will be red: ", optionLetter);
        const eliminatingOption = document.querySelector(
          `.option-${optionLetter}`
        );
        eliminatingOption.classList.add("incorrect-answer-color");
      });
      eliminateHalfButton.disabled = true;
    },
    { once: true }
  );

  // WILD CARD 2: CALL A FRIEND TO GET A HINT
  const callFriendButton = document.querySelector(".call-friend");
  callFriendButton.addEventListener(
    "click",
    () => {
      callFriendButton.disabled = true;
      let beCorrect;
      if (currentQuestionState.usedEliminateHalf) {
        beCorrect = Math.random() > 0.1;
      } else {
        beCorrect = Math.random() > 0.3;
      }
      if (beCorrect) {
        const hintText = document.querySelector(".feedback-text");
        hintText.innerText = `The answer is letter ${correctAnswer}!`;
      } else {
        const badAnswer = ["a", "b", "c", "d"].filter(
          (n) => n !== correctAnswer
        )[Math.floor(Math.random() * 3)];
        const hintText = document.querySelector(".feedback-text");
        hintText.innerText = `The answer is letter ${badAnswer}! 👻`;
      }
    },
    { once: true }
  );

  // WILD CARD 3: CHANGE QUESTION WITHOUT INCREASEING THE ROUND
  const changeQuestionButton = document.querySelector(".change-question");
  changeQuestionButton.addEventListener(
    "click",
    () => {
      changeQuestionButton.disabled = true;
      setTimeout(async () => {
        // REMOVE ALL EVENT LISTENERS FROM THE OPTION BUTTONS
        // Snippet: https://stackoverflow.com/questions/9251837/how-to-remove-all-listeners-in-an-element
        Array.from("abcd").forEach((char) => {
          const old_element = document.querySelector(`.option-${char}`);
          const new_element = old_element.cloneNode(true);
          old_element.parentNode.replaceChild(new_element, old_element);
        });

        const question = await getQuestion(gameState);
        resetQuestion(question, gameState);
      }, 1000);
    },
    { once: true }
  );

  // Options
  Array.from("abcd").forEach((char) => {
    const optionText = document.querySelector(`.option-text-${char}`);
    optionText.innerText = question.answers[char];

    const optionButton = document.querySelector(`.option-${char}`);
    optionButton.classList.remove("correct-answer-color");
    optionButton.classList.remove("incorrect-answer-color");
    const progressBox = document.querySelector(
      `.progress-box-${gameState.round}`
    );
    progressBox.classList.add("pending-answer-box");

    optionButton.addEventListener("click", () => {
      progressBox.classList.remove("pending-answer-box");

      if (correctAnswer === char) {
        optionButton.classList.toggle("correct-answer-color");
        progressBox.classList.add("correct-answer-box");
      } else {
        optionButton.classList.toggle("incorrect-answer-color");
        const correctAnswerButton = document.querySelector(
          `.option-${correctAnswer}`
        );
        correctAnswerButton.classList.toggle("correct-answer-color");
        progressBox.classList.add("incorrect-answer-box");
      }

      let delay;

      if (question.feedback) {
        const feedbackText = document.querySelector(".feedback-text");
        feedbackText.innerText = question.feedback;
        delay = 6000;
      } else {
        delay = 3000;
      }

      setTimeout(async () => {
        Array.from("abcd").forEach((char) => {
          // SNIPPET TO REMOVE ALL EVENT LISTENERS FROM A NODE
          // https://stackoverflow.com/questions/9251837/how-to-remove-all-listeners-in-an-element
          const old_element = document.querySelector(`.option-${char}`);
          const new_element = old_element.cloneNode(true);
          old_element.parentNode.replaceChild(new_element, old_element);
        });
        gameState.round++;
        const question = await getQuestion(gameState);
        resetQuestion(question, gameState);
      }, delay);
    });
  });
}

const getQuestion = (function () {
  const usedQuestions = [];

  async function getQuestion(gameState) {
    let level;
    if (gameState.round <= 5) {
      level = "easy";
    } else if (gameState.roung <= 10) {
      level = "medium";
    } else {
      level = "hard";
    }
    const category = ["javascript", "css", "html"][
      Math.floor(Math.random() * 3)
    ];

    const response = await fetch(
      `https://quiz-api-ofkh.onrender.com/questions/random?level=${level}&category=${category}`
    );
    const data = await response.json();

    if (usedQuestions.findIndex((e) => e === data._id) !== -1) {
      console.log("Repeated question found, fetching again.");
      return await getQuestion(gameState);
    } else {
      // Object.entries(data.answers).forEach((a) => console.log(a.join(": ")));
      usedQuestions.push(data._id);
      console.log("Used questions:", usedQuestions);
      data.shuffleAnswers = shuffleAnswers;
      data.shuffleAnswers();
      return data;
    }
  }
  return getQuestion;
})();

function shuffleAnswers() {
  const answerArr = Object.entries(this.answers);
  answerArr.sort(() => 0.5 - Math.random());
  const newCorrectAnswer = { 0: "a", 1: "b", 2: "c", 3: "d" }[
    answerArr.findIndex((q) => q[0] === this.correctAnswer)
  ];
  Object.keys(this.answers).forEach((char, index) => {
    answerArr[index][0] = char;
  });
  const answerObj = Object.fromEntries(answerArr);
  this.answers = answerObj;
  this.correctAnswer = newCorrectAnswer;
}

runGame();
