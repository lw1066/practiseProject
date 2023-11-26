const genreChoiceElement = document.getElementById('genre-choice');
const x = window.matchMedia("(max-width: 780px)");
const width = window.innerWidth;

if (width < 780){
    genreChoiceElement.classList.remove("btn-group-lg");
    genreChoiceElement.classList.add("btn-group-vertical");
}

x.onchange = (e) => {
    if (e.matches) {
        genreChoiceElement.classList.remove("btn-group-lg");
        genreChoiceElement.classList.add("btn-group-vertical"); 
    }else {
        genreChoiceElement.classList.remove("btn-group-vertical");
        genreChoiceElement.classList.add("btn-group-lg");
    }
}
