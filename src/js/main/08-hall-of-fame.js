// ===== HALL OF FAME / LIGA BAGABONȚILOR - JS =====
document.addEventListener("DOMContentLoaded", function() {
const donors = [
  { n: "Patrick Claudiu", a: "63.61" },
  { n: "wmircea", a: "60.61" },
  { n: "Catalin.M", a: "53.00" },
  { n: "tomasciuc30", a: "50.41" },
  { n: "ErvinDe", a: "42.42" },
  { n: "iloe229", a: "34.99" },
  { n: "Flavius321", a: "31.80" },
  { n: "AndreiPro", a: "29.50" },
  { n: "MihaiGamer", a: "27.00" },
  { n: "CristiRO", a: "25.30" },
  { n: "DanielX", a: "23.00" },
  { n: "IonutAlex", a: "21.50" },
  { n: "RazvanM", a: "20.00" },
  { n: "StefanV", a: "18.75" },
  { n: "AlexOtaku", a: "17.20" },
  { n: "VladCostin", a: "15.00" },
  { n: "GabiNinja", a: "14.50" },
  { n: "PopescuA", a: "12.80" },
  { n: "MarianRO", a: "11.00" },
  { n: "TudorFan", a: "10.50" }
];

const donorAvatars = [
  "public/imgs/serii favorite/poze anime/1.webp",
  "public/imgs/serii favorite/poze anime/2.webp",
  "public/imgs/serii favorite/poze anime/3.webp",
  "public/imgs/serii favorite/poze anime/4.webp",
  "public/imgs/serii favorite/poze anime/5.webp",
  "public/imgs/serii favorite/poze anime/6.webp",
  "public/imgs/serii favorite/poze anime/7.webp",
  "public/imgs/serii favorite/poze anime/8.webp",
  "public/imgs/serii favorite/poze anime/9.webp",
  "public/imgs/serii favorite/poze anime/10.webp",
  "public/imgs/serii favorite/poze anime/11.jpg",
  "public/imgs/serii favorite/poze anime/12.jpg",
  "public/imgs/serii favorite/poze anime/13.jpg",
  "public/imgs/serii favorite/poze anime/14.jpg",
  "public/imgs/serii favorite/poze anime/15.jpg",
  "public/imgs/serii favorite/poze anime/16.jpg",
  "public/imgs/serii favorite/poze anime/17.jpg",
  "public/imgs/serii favorite/poze anime/18.jpg",
  "public/imgs/serii favorite/poze anime/19.jpg",
  "public/imgs/serii favorite/poze anime/20.jpg"
];

// Populate donor list
const list = document.getElementById('donorList');
if (list) {
  list.innerHTML = donors.map((d, i) => `<div class="donor-row">
    <span class="rank">#${i + 4}</span>
    <img class="d-avatar" src="${donorAvatars[i % donorAvatars.length]}" alt="Avatar anime pentru ${d.n}" loading="lazy" decoding="async">
    <span class="d-name">${d.n}</span>
    <span class="d-amount">${d.a} €</span>
  </div>`).join('');
}

// Open modal
window.openDonateModal = function openDonateModal() {
  document.getElementById('donateModal').classList.add('show');
};

// Close modal on overlay click
const donateModal = document.getElementById('donateModal');
if (donateModal) {
  donateModal.addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('show');
  });
}
}); // end DOMContentLoaded donors


