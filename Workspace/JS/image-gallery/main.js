const displayedImage = document.querySelector('.displayed-img');
const thumbBar = document.querySelector('.thumb-bar');

const btn = document.querySelector('button');
const overlay = document.querySelector('.overlay');

/* Declaring the array of image filenames */
const arr = ['pic1.jpg', 'pic2.jpg', 'pic3.jpg', 'pic4.jpg', 'pic5.jpg'];

/* Declaring the alternative text for each image file */
// Declare a const object listing the alternative text for each image.
const altObj = {
    'pic1.jpg': 'Closeup of a human eye',
    'pic2.jpg': 'pic2',
    'pic3.jpg': 'Some purple flowers',
    'pic4.jpg': 'Egyptian art',
    'pic5.jpg': 'A butterfly'
};

/* Looping through images */
for (let i = 0; i < arr.length; i++) {
    const newImage = document.createElement('img');
    newImage.setAttribute('src', 'images/' + arr[i]);
    newImage.setAttribute('alt', altObj[arr[i]]);
    thumbBar.appendChild(newImage);
    
    // Add a click event listener to each <img> inside 
    newImage.addEventListener('click', function(e) {
        displayedImage.src = e.target.src;
        displayedImage.alt = e.target.alt;
    });
}

/* Wiring up the Darken/Lighten button */
btn.addEventListener('click', function(e) {
    // Checks the current class name set on the <button> — you can again achieve this by using getAttribute().
    if (btn.getAttribute('class') == 'dark') {
        btn.setAttribute('class', 'light');
        btn.textContent = 'Lighten';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    } else {
        btn.setAttribute('class', 'dark');
        btn.textContent = 'Darken'
        overlay.style.backgroundColor = 'rgba(0,0,0,0)';
    }
});