export function buildPage(game) {
  const { classes } = game;
  const superContainer = document.createElement("div");
  superContainer.classList.add(classes.superContainer);

  // GAME CONTAINER
  const gameContainer = document.createElement("div");
  gameContainer.classList.add(classes.gameContainer);
  superContainer.appendChild(gameContainer);
  // LEFT BOX
  const leftBox = document.createElement("div");
  leftBox.classList.add(classes.leftBox);
  gameContainer.appendChild(leftBox);
  // RIGHT BOX
  const rightBox = document.createElement("div");
  rightBox.classList.add(classes.rightBox);
  gameContainer.appendChild(rightBox);

  // LEFT BOX CONTENTS:
  // - Question
  // - Progress Bar
  // - Wildcard Buttons
  // - Feedback

  // QUESTION
  const questionContainer = document.createElement("div");
  questionContainer.classList.add(classes.questionContainer);
  const questionText = document.createElement("p");
  questionText.classList.add(classes.questionText);
  questionText.innerText = "¿Cuál es la capital de Perú?";
  questionContainer.appendChild(questionText);
  leftBox.appendChild(questionContainer);

  // PROGRESS BAR
  const progressBar = document.createElement("div");
  progressBar.classList.add(classes.progressBar);
  for (let i = 1; i <= 15; i++) {
    const progressBox = document.createElement("div");
    progressBox.classList.add(classes.progressBox);

    // TODO HARDCODE FIX ??
    progressBox.classList.add(`${classes.progressBox}-${i}`);
    progressBar.appendChild(progressBox);
  }
  leftBox.appendChild(progressBar);

  // WILDCARDS
  const wildcardButtonsContainer = document.createElement("div");
  wildcardButtonsContainer.classList.add(classes.wildcardButtonsContainer);
  const eliminateHalfButton = document.createElement("button");
  eliminateHalfButton.classList.add(classes.wildcardButton);
  eliminateHalfButton.classList.add(classes.eliminateHalf);
  eliminateHalfButton.innerText = "Eliminar la mitad";
  const callFriendButton = document.createElement("button");
  callFriendButton.classList.add(classes.wildcardButton);
  callFriendButton.classList.add(classes.callFriend);
  callFriendButton.innerText = "Llamar a un amigo";
  const changeQuestionButton = document.createElement("button");
  changeQuestionButton.classList.add(classes.wildcardButton);
  changeQuestionButton.classList.add(classes.changeQuestion);
  changeQuestionButton.innerText = "Cambiar pregunta";
  wildcardButtonsContainer.appendChild(eliminateHalfButton);
  wildcardButtonsContainer.appendChild(callFriendButton);
  wildcardButtonsContainer.appendChild(changeQuestionButton);
  leftBox.appendChild(wildcardButtonsContainer);

  // FEEDBACK
  const feedbackContainer = document.createElement("div");
  feedbackContainer.classList.add(classes.feedbackContainer);
  const feedbackText = document.createElement("p");
  feedbackText.classList.add(classes.feedbackText);
  feedbackContainer.appendChild(feedbackText);
  leftBox.appendChild(feedbackContainer);

  /*
  RIGHT BOX CONTENTS:
  */

  const optionButtonsContainer = document.createElement("div");

  // TODO Change this class to "option-buttons-container"
  optionButtonsContainer.classList.add(classes.optionButtonsContainer);

  const optionLetters = ["a", "b", "c", "d"];
  optionLetters.forEach((character) => {
    const optionButton = document.createElement("div");

    // TODO Change this class to "option-button"
    optionButton.classList.add(classes.optionButton);

    // TODO HARDCODE FIX, and change to "option-button-${character}"
    optionButton.classList.add(`option-${character}`);

    const optionLetterContainer = document.createElement("div");
    optionLetterContainer.classList.add(classes.optionLetterContainer);
    const optionLetter = document.createElement("span");
    optionLetter.classList.add(classes.optionLetter);
    optionLetter.innerText = character;

    const optionTextContainer = document.createElement("div");
    optionTextContainer.classList.add(classes.optionTextContainer);
    const optionText = document.createElement("span");
    optionText.classList.add(classes.optionText);

    // TODO HARDCODE FIX !!
    optionText.classList.add(`option-text-${character}`);

    optionTextContainer.appendChild(optionText);
    optionLetterContainer.appendChild(optionLetter);
    optionButton.appendChild(optionLetterContainer);
    optionButton.appendChild(optionTextContainer);
    optionButtonsContainer.appendChild(optionButton);
  });
  rightBox.appendChild(optionButtonsContainer);

  return superContainer;
}
