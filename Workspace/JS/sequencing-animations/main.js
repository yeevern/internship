const aliceTumbling = [
  { transform: 'rotate(0) scale(1)' },
  { transform: 'rotate(360deg) scale(0)' }
];

const aliceTiming = {
  duration: 2000,
  iterations: 1,
  fill: 'forwards'
}

const alice1 = document.querySelector("#alice1");
const alice2 = document.querySelector("#alice2");
const alice3 = document.querySelector("#alice3");

alice1.animate(aliceTumbling, aliceTiming);

// First, implement something that works, but has the promise version of the "callback hell" problem we saw in our discussion of using callbacks.
function animateAlice() {
    alice1.animate(aliceTumbling, aliceTiming).addEventListener('finish', () => {
        alice2.animate(aliceTumbling, aliceTiming).addEventListener('finish', () => {
            alice3.animate(aliceTumbling, aliceTiming);
        });
    });
}

animateAlice();

// Next, implement it as a promise chain. Note that there are a few different ways you can write this, because of the different forms you can use for an arrow function. Try some different forms. Which is the most concise? Which do you find the most readable?
function animateAlice() {
    alice1.animate(aliceTumbling, aliceTiming).finished
      .then(() => alice2.animate(aliceTumbling, aliceTiming).finished)
      .then(() => alice3.animate(aliceTumbling, aliceTiming));
}

animateAlice();

// Finally, implement it using async and await.
async function animateAlice() {
    await alice1.animate(aliceTumbling, aliceTiming).finished;
    await alice2.animate(aliceTumbling, aliceTiming).finished;
    await alice3.animate(aliceTumbling, aliceTiming).finished;
}

animateAlice();