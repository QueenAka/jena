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
      console.log(question);
      document.getElementById("q").innerText = question.q;
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
  alert(`${questionsCorrect.length}/${questions.length}`);
  const holder = document.getElementById("questions");
  holder.innerHTML = "";
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
}
