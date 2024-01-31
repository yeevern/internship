// import { insertBadge } from "./badge";
import "./style.css";

// insertBadge();

// Your script here
class Card {
  imagePath: string;
  altText: string;
  setName: string;
  collectorNumber: string;
  cardName: string;
  cardDescription: string;

  constructor(imagePath: string, altText: string, setName: string, collectorNumber: string, cardName: string, cardDescription: string) {
    this.imagePath = imagePath;
    this.altText = altText;
    this.setName = setName;
    this.collectorNumber = collectorNumber;
    this.cardName = cardName;
    this.cardDescription = cardDescription;

    while (this.collectorNumber.length != 3) {
      this.collectorNumber = "0" + this.collectorNumber;
    }
  }
}

// assign values to the card class
const card1 = new Card(
  'cards/card1.jpg', 
  '1778cf9a-2703-41e9-86d7-ec21af8cf61d', 
  '2x2', 
  '5', 
  'Ainok Bond-Kin', 
  `Outlast [1][W] ([1][W], [Tap]: Put a +1/+1 counter on this creature. Outlast only as a sorcery.)
  Each creature you control with a +1/+1 counter on it has first strike.`);

const card2 = new Card(
  'cards/card2.jpg', 
  'd4282ddd-3e5b-4d4c-b1b7-a48401a3521f', 
  '2x2', 
  '553', 
  'Wrenn and Six', 
  `+1: Return up to one target land card from your graveyard to your hand. 
  -1: Wrenn and Six deals 1 damage to any target. 
  -7: You get an emblem with "Instant and sorcery cards in your graveyard have retrace." (You may cast instant and sorcery cards from your graveyard by discarding a land card in addition to paying their other costs.)`);

const card3 = new Card(
  'cards/card3.jpg', 
  '1825a719-1b2a-4af9-9cd2-7cb497cd0317', 
  '2x2', 
  '50', 
  'Force of Negation', 
  `If it\'s not your turn, you may exile a blue card from your hand rather than pay this spell\'s mana cost. 
  Counter target noncreature spell. If that spell is countered this way, exile it instead of putting it into its owner\'s graveyard.`);

const card4 = new Card(
  'cards/card4.jpg', 
  '3c429c40-2389-41e5-8681-4bb274e25eba', 
  '2x2', 
  '57', 
  'Mana Drain', 
  `Counter target spell. At the beginning of your next main phase, add an amount of [C] equal to that spell\'s mana value.`);

const card5 = new Card(
  'cards/card5.jpg', 
  '9e2e3efb-75cb-430f-b9f4-cb58f3aeb91b', 
  '2x2', 
  '107', 
  'Dockside Extortionist', 
  `When Dockside Extortionist enters the battlefield, create X Treasure tokens, where X is the number of artifacts and enchantments your opponents control. (Treasure tokens are artifacts with "[Tap], Sacrifice this artifact: Add one mana of any color.")`);

const card6 = new Card(
  'cards/card6.jpg', 
  'c1a31d52-a407-4ded-bfca-cc812f11afa0', 
  '2x2', 
  '308', 
  'Mana Vault', 
  `Mana Vault doesn\'t untap during your untap step. 
  At the beginning of your upkeep, you may pay [4]. If you do, untap Mana Vault. 
  At the beginning of your draw step, if Mana Vault is tapped, it deals 1 damage to you. 
  [Tap]: Add [C][C][C].`);

let cards = [card1, card2, card3, card4, card5, card6];
globalThis.cards = cards;
// create a function that loop through the card class and add the image to the badge
function displayCards() {
  const cardList = document.querySelector<HTMLUListElement>("#cardList");

  if (cardList) {
    cardList.innerHTML = globalThis.cards.map(card => `
        <li>
            <img src=${card.imagePath} alt=${card.altText}>
            <p>${card.setName} | ${card.collectorNumber}</p>
            <h6>${card.cardName}</h6>
            <p class="desc">${card.cardDescription}</p>
        </li>
    `).join('');
  }
}

function sortCard() {
  let sortOption = document.getElementById("sortOption") as HTMLSelectElement;
  let sortOptionValue = sortOption.value;

  if (sortOptionValue === "ascending") {
    globalThis.cards.sort((a, b) => Number(a.collectorNumber > b.collectorNumber) ? 1 : -1);
    displayCards();
  } else if (sortOptionValue === "descending") {
    globalThis.cards.sort((a, b) => Number(a.collectorNumber < b.collectorNumber) ? 1 : -1);
    displayCards();
  }  
}

sortCard();