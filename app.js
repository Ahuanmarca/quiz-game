async function runGame() {
  const gameState = {
    round: 1,
  };

  const question = await getQuestion(gameState);
  resetQuestion(question, gameState);
}

function resetQuestion(question, gameState) {
  // Question
  const questionText = document.querySelector(".question-text");
  questionText.innerText = question.description;

  const correctAnswer = question.correctAnswer;

  // Options
  Array.from("abcd").forEach((char) => {
    const optionText = document.querySelector(`.option-text-${char}`);
    optionText.innerText = question.answers[char];

    const optionButton = document.querySelector(`.option-${char}`);
    optionButton.classList.remove("correct-answer-color");
    optionButton.classList.remove("incorrect-answer-color");
    optionButton.addEventListener("click", () => {
      const progressBox = document.querySelector(
        `.progress-box-${gameState.round}`
      );

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
      }, 3000);
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
    console.log(data);
    
    if (usedQuestions.findIndex((e) => e === data._id) !== -1) {
      console.log("Repeated question found, fetching again.")
      return await getQuestion(gameState);
    } else {
      console.log(data.description);
      Object.entries(data.answers).forEach((a) => console.log(a.join(": ")));
      usedQuestions.push(data._id);
      console.log("Used questions:", usedQuestions);
      return data;
    }
  }
  return getQuestion;
})();

runGame();
