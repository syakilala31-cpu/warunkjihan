window.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initHeroTyping();
  initStickyHeader();
  initSectionReveal();
  initCategoryFilter();
  initProductSearch();
  initCartPanel();
  initOrderButtons();
  initProductModal();
  initPaymentModal();
  initContactForm();
  initContactInteractions();
  initScrollSpy();
  initScrollTopButton();
});

const cart = { items: [] };
const THEME_KEY = "warunk-theme";
const CART_KEY = "warunk-cart";
let openPaymentModal = null;

function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = savedTheme || (prefersDark ? "dark" : "light");
  applyTheme(theme);

  const toggle = document.querySelector(".theme-toggle");
  if (!toggle) return;
  toggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
    applyTheme(nextTheme);
  });
}

function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  localStorage.setItem(THEME_KEY, theme);
  const toggle = document.querySelector(".theme-toggle");
  if (toggle) toggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed.items)) cart.items = parsed.items;
    }
  } catch (error) {
    console.warn("Gagal memuat cart dari storage", error);
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function pulseCartBubble() {
  const bubble = document.querySelector("#cart-bubble");
  if (!bubble) return;
  bubble.classList.remove("pulse");
  requestAnimationFrame(() => bubble.classList.add("pulse"));
  bubble.addEventListener("animationend", () => bubble.classList.remove("pulse"), { once: true });
}

function parsePrice(harga) {
  return Number(harga.replace(/[^0-9]/g, "")) || 0;
}

function formatPrice(amount) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

function initHeroTyping() {
  const heroText = document.querySelector(".hero-teks p");
  const phrases = [
    "Pesan jajan favoritmu sekarang juga.",
    "Praktis, cepat, dan selalu bikin nagih.",
    "Dapatkan promo spesial setiap hari."
  ];

  if (!heroText) return;
  heroText.innerHTML = `<span class="typed-text">${phrases[0]}</span>`;

  let index = 0;
  setInterval(() => {
    index = (index + 1) % phrases.length;
    const typed = heroText.querySelector(".typed-text");
    if (typed) typed.textContent = phrases[index];
  }, 3200);
}

function initStickyHeader() {
  const navbar = document.querySelector(".navbar");
  if (!navbar) return;

  const updateHeader = () => {
    navbar.classList.toggle("scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader);
}

function initSectionReveal() {
  const elements = document.querySelectorAll(".hero-teks, .hero-photo, .menu-card, .section-cara-pesan, .section-kontak");
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.2 });

  elements.forEach(element => observer.observe(element));
}

function initCategoryFilter() {
  const buttons = document.querySelectorAll(".kategori button");
  const cards = document.querySelectorAll(".menu-card");
  const searchInput = document.getElementById("search-produk");
  const feedback = document.getElementById("search-feedback");
  if (!buttons.length || !cards.length) return;

  const applyFilter = () => {
    const filter = document.querySelector(".kategori button.active")?.dataset.filter || "all";
    const query = searchInput?.value.trim().toLowerCase() || "";
    let visibleCount = 0;

    cards.forEach(card => {
      const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
      const desc = card.querySelector(".menu-desc")?.textContent.toLowerCase() || "";
      const matchesCategory = filter === "all" || card.dataset.kategori === filter;
      const matchesSearch = !query || `${title} ${desc}`.includes(query);
      const showCard = matchesCategory && matchesSearch;
      card.style.display = showCard ? "block" : "none";
      if (showCard) visibleCount += 1;
    });

    if (feedback) {
      feedback.classList.toggle("visually-hidden", visibleCount > 0);
    }
  };

  buttons.forEach(button => {
    button.addEventListener("click", () => {
      buttons.forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
      applyFilter();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", applyFilter);
  }

  applyFilter();
}

function initProductSearch() {
  const searchInput = document.getElementById("search-produk");
  if (!searchInput) return;

  searchInput.addEventListener("focus", () => searchInput.parentElement?.classList.add("active"));
  searchInput.addEventListener("blur", () => searchInput.parentElement?.classList.remove("active"));
}

function initContactInteractions() {
  document.querySelectorAll(".social-link").forEach(link => {
    link.addEventListener("click", () => {
      const label = link.textContent.trim();
      showToast(`Membuka ${label}...`);
    });
  });
}

function initCartPanel() {
  if (document.getElementById("cart-bubble")) return;
  loadCart();

  const bubble = document.createElement("div");
  bubble.id = "cart-bubble";
  bubble.className = "cart-bubble";
  bubble.innerHTML = `<span class="cart-icon">🛒</span><strong>0</strong> item`;
  document.body.appendChild(bubble);

  const panel = document.createElement("div");
  panel.id = "cart-panel";
  panel.className = "cart-panel";
  panel.innerHTML = `
    <div class="cart-panel-head">
      <span>Pesanan Anda</span>
      <button type="button" id="cart-close">✕</button>
    </div>
    <div class="cart-panel-list"></div>
    <div class="cart-panel-footer">
      <div>
        <small>Subtotal</small>
        <strong id="cart-total">Rp 0</strong>
      </div>
      <div class="cart-panel-actions">
        <button type="button" class="clear-cart-btn">Kosongkan</button>
        <button type="button" class="checkout-btn">Checkout</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  bubble.addEventListener("click", () => panel.classList.toggle("open"));
  panel.querySelector("#cart-close").addEventListener("click", () => panel.classList.remove("open"));
  panel.querySelector(".checkout-btn").addEventListener("click", () => handleCheckout());
  panel.querySelector(".clear-cart-btn").addEventListener("click", () => clearCart());
  updateCartUI();
}

function initOrderButtons() {
  const buttons = document.querySelectorAll(".btn-tambah");
  if (!buttons.length) return;

  buttons.forEach(button => {
    const initialText = button.textContent;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const card = button.closest(".menu-card");
      const nama = card?.querySelector("h3")?.textContent || "Menu";
      const harga = card?.querySelector(".menu-price")?.textContent || "Rp 0";
      button.textContent = "Ditambahkan!";
      button.disabled = true;
      addToCart(nama, harga);
      setTimeout(() => {
        button.textContent = initialText;
        button.disabled = false;
      }, 1500);
    });
  });
}

function addToCart(nama, harga) {
  const parsed = parsePrice(harga);
  const existing = cart.items.find(item => item.nama === nama && item.harga === parsed);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.items.push({ nama, harga: parsed, qty: 1 });
  }
  updateCartUI();
  pulseCartBubble();
  showToast(`✓ ${nama} berhasil ditambahkan ke keranjang`);
}

function handleCheckout() {
  const totalQty = cart.items.reduce((sum, item) => sum + item.qty, 0);
  if (!totalQty) {
    showToast("Keranjang masih kosong.", true);
    return;
  }

  document.querySelector("#cart-panel")?.classList.remove("open");
  if (typeof openPaymentModal === "function") {
    openPaymentModal();
  }
}

function clearCart() {
  cart.items = [];
  updateCartUI();
  showToast("Keranjang berhasil dikosongkan.");
}

function updateCartUI() {
  const bubble = document.querySelector("#cart-bubble");
  const panelList = document.querySelector(".cart-panel-list");
  const totalNode = document.querySelector("#cart-total");
  const totalQty = cart.items.reduce((sum, item) => sum + item.qty, 0);

  if (bubble) {
    bubble.innerHTML = `
      <span class="cart-icon">🛒</span>
      <strong>${totalQty}</strong>
      <small>${totalQty === 1 ? "item" : "items"}</small>
    `;
  }

  if (panelList) {
    if (!cart.items.length) {
      panelList.innerHTML = `<p class="cart-empty">Keranjang masih kosong.</p>`;
    } else {
      panelList.innerHTML = cart.items.map((item, index) => `
        <div class="cart-item">
          <div class="cart-item-meta">
            <strong>${item.nama}</strong>
            <small>${formatPrice(item.harga)} × ${item.qty} = ${formatPrice(item.harga * item.qty)}</small>
          </div>
          <div class="cart-item-actions">
            <button type="button" class="qty-btn" data-action="decrease" data-index="${index}" aria-label="Kurangi jumlah">−</button>
            <span>${item.qty}</span>
            <button type="button" class="qty-btn" data-action="increase" data-index="${index}" aria-label="Tambah jumlah">+</button>
            <button type="button" class="cart-remove" data-index="${index}" aria-label="Hapus item">✕</button>
          </div>
        </div>
      `).join("");

      panelList.querySelectorAll(".qty-btn").forEach(button => {
        button.addEventListener("click", () => {
          const index = Number(button.dataset.index);
          const action = button.dataset.action;
          changeCartQuantity(index, action === "increase" ? 1 : -1);
        });
      });

      panelList.querySelectorAll(".cart-remove").forEach(button => {
        button.addEventListener("click", () => {
          removeCartItem(Number(button.dataset.index));
        });
      });
    }
  }

  if (totalNode) totalNode.textContent = formatPrice(cart.items.reduce((sum, item) => sum + item.harga * item.qty, 0));
  saveCart();
}

function changeCartQuantity(index, delta) {
  const item = cart.items[index];
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart.items.splice(index, 1);
  }
  updateCartUI();
}

function removeCartItem(index) {
  cart.items.splice(index, 1);
  updateCartUI();
}

function initProductModal() {
  const modal = document.getElementById("product-modal");
  const modalClose = modal?.querySelector(".modal-close");
  const modalImage = modal?.querySelector(".modal-image img");
  const modalCategory = modal?.querySelector(".modal-category");
  const modalTitle = modal?.querySelector(".modal-title");
  const modalPrice = modal?.querySelector(".modal-price");
  const modalDescription = modal?.querySelector(".modal-description");
  const modalOrder = modal?.querySelector(".modal-order");
  let activeCard = null;

  if (!modal || !modalImage || !modalTitle || !modalPrice || !modalDescription || !modalOrder) return;

  document.querySelectorAll(".menu-card").forEach(card => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("button")) return;
      activeCard = card;
      openModal(card);
    });
  });

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  function openModal(card) {
    const image = card.querySelector("img").src;
    const title = card.querySelector("h3").textContent;
    const price = card.querySelector(".menu-price").textContent;
    const description = card.querySelector(".menu-desc")?.textContent || "Nikmati menu istimewa kami dengan rasa yang gurih dan segar.";
    const category = card.dataset.kategori || "Menu";

    modalImage.src = image;
    modalImage.alt = title;
    modalCategory.textContent = category.toUpperCase();
    modalTitle.textContent = title;
    modalPrice.textContent = price;
    modalDescription.textContent = description;
    modalOrder.textContent = `Tambah ${title}`;
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  modalOrder.addEventListener("click", () => {
    if (!activeCard) return;
    const title = activeCard.querySelector("h3").textContent;
    const price = activeCard.querySelector(".menu-price").textContent;
    addToCart(title, price);
    closeModal();
  });
}

function initPaymentModal() {
  const modal = document.getElementById("payment-modal");
  const modalClose = modal?.querySelector(".modal-close");
  const summarySet = modal?.querySelector(".payment-summary");
  const totalSet = modal?.querySelector(".payment-total");
  const payButton = modal?.querySelector(".payment-pay");
  if (!modal || !modalClose || !summarySet || !totalSet || !payButton) return;

  openPaymentModal = () => {
    const totalPrice = cart.items.reduce((sum, item) => sum + item.harga * item.qty, 0);
    summarySet.innerHTML = cart.items.length
      ? `<ul>${cart.items.map(item => `<li>${item.nama} x${item.qty} = ${formatPrice(item.harga * item.qty)}</li>`).join("")}</ul>`
      : `<p class="cart-empty">Keranjang kosong.</p>`;
    totalSet.textContent = formatPrice(totalPrice);
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
  };

  function closePaymentModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
  }

  modalClose.addEventListener("click", closePaymentModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closePaymentModal();
  });
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closePaymentModal();
  });

  payButton.addEventListener("click", () => {
    const selected = modal.querySelector("input[name='payment-method']:checked");
    if (!selected) {
      showToast("Pilih metode pembayaran terlebih dahulu.", true);
      return;
    }
    const method = selected.value;
    closePaymentModal();
    clearCart();
    showToast(`Pesanan sedang diproses via ${method}.`);
  });
}

function initContactForm() {
  const form = document.getElementById("form-kontak");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const namaField = form.querySelector("input[name='nama']");
    const whatsappField = form.querySelector("input[name='whatsapp']");
    const pesanField = form.querySelector("textarea[name='pesan']");
    const nama = namaField?.value.trim() || "";
    const whatsapp = whatsappField?.value.trim() || "";
    const pesan = pesanField?.value.trim() || "";

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    if (!/[A-Za-z0-9]/.test(pesan)) {
      showToast("Pesan harus berisi minimal huruf atau angka.", true);
      pesanField?.focus();
      return;
    }

    form.reset();
    showToast(`Terima kasih ${nama}, pesan Anda sudah dikirim!`);
  });
}

function initScrollSpy() {
  const navLinks = document.querySelectorAll(".nav-links a");
  const sections = Array.from(navLinks).map(link => {
    const targetId = link.getAttribute("href")?.replace("#", "");
    return document.getElementById(targetId);
  });

  window.addEventListener("scroll", () => {
    const scrollY = window.scrollY + 140;
    sections.forEach((section, index) => {
      if (!section) return;
      const top = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach(link => link.classList.remove("active"));
        navLinks[index]?.classList.add("active");
      }
    });
  });
}

function initScrollTopButton() {
  const btn = document.createElement("button");
  btn.className = "scroll-top";
  btn.type = "button";
  btn.textContent = "↑";
  btn.title = "Kembali ke atas";
  document.body.appendChild(btn);

  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", () => btn.classList.toggle("show", window.scrollY > 420));
}

function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  toast.style.backgroundColor = isError ? "rgba(215, 63, 63, 0.95)" : "rgba(34, 95, 44, 0.95)";
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  setTimeout(() => {
    toast.classList.remove("show");
    toast.addEventListener("transitionend", () => toast.remove(), { once: true });
  }, 2600);
}
