
const groupElement = document.getElementById('genre-choice');
let items = document.querySelectorAll('.listitem');

function displayGenre() {
    genreChoice = document.querySelector('input[name=genre]:checked').value;
    
    
    for (i of items){
        if (i.classList[1] == genreChoice || genreChoice == 'All') {
            i.style.display = "block"; 
        } else {
            i.style.display = "none";
        }        
    }
    
};

groupElement.addEventListener('change', displayGenre)

