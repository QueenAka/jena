fetch("/js/trivia.json")
  .then((res) => res.text())
  .then((data) => {
    let questions = JSON.parse(data);
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    let questionsCorrect = [];
    let questionNumber = -1;
    function nextQuestion(wasCorrect) {
      if (wasCorrect) questionsCorrect.push(questionNumber);
      if (questionNumber == questions.length - 1)
        return finishQuiz(questionsCorrect, questions);
      questionNumber++;
      const question = questions[questionNumber];
      document.getElementById("q").innerText = question.q;
      document
        .getElementById("p")
        .style.setProperty(
          "--progress",
          `${(questionNumber / questions.length) * 100}%`
        );
      const holder = document.getElementById("a");
      holder.innerHTML = "";
      for (let i = question.a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [question.a[i], question.a[j]] = [question.a[j], question.a[i]];
      }

      question.a.forEach((a) => {
        const btn = document.createElement("button");
        btn.innerText = a.text;
        if (a.answer) {
          btn.onclick = () => {
            nextQuestion(true);
          };
        } else {
          btn.onclick = () => {
            nextQuestion();
          };
        }

        holder.appendChild(btn);
      });
    }

    nextQuestion();
  });

function finishQuiz(questionsCorrect, questions) {
  document.getElementById("p").style.setProperty("--progress", `100%`);
  const holder = document.getElementById("questions");
  holder.style.opacity = 0;
  setTimeout(() => {
    document.getElementById("q")?.remove();
    document.getElementById("a")?.remove();
    questions.forEach((q, i) => {
      const h3 = document.createElement("h3");
      h3.classList.add("q");
      if (!questionsCorrect.includes(i)) h3.classList.add("wrong");
      h3.innerText = q.q;
      const div = document.createElement("h3");
      div.classList.add("a");
      q.a.forEach((a) => {
        const btn = document.createElement("button");
        btn.innerText = a.text;
        div.appendChild(btn);
      });
      holder.appendChild(h3);
      holder.appendChild(div);
    });
    if (questionsCorrect.length == questions.length) balloons();
    setTimeout(() => {
      holder.style.opacity = 1;
    }, 150);
  }, 150);
}

function balloons() {
  const balloonCount = Math.floor(Math.random() * 100) + 100;
  const body = document.body;
  const balloonTypes = [
    "../media/balloon-green.png",
    "../media/balloon-blue.png",
  ];

  for (let i = 0; i < balloonCount; i++) {
    const balloon = document.createElement("div");
    balloon.classList.add("balloon");
    balloon.style.backgroundImage = `url(${
      balloonTypes[Math.floor(Math.random() * balloonTypes.length)]
    })`;

    const delay = Math.random() * 500;
    const duration = Math.random() * 1000 + 1000;
    balloon.style.left = `${Math.random() * 100}vw`;
    balloon.style.animationDuration = `${duration}ms`;
    balloon.style.animationDelay = `${delay}ms`;
    body.appendChild(balloon);
    setTimeout(() => {
      balloon.remove();
    }, delay + duration);
  }
}
