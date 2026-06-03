const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const apiBase = window.location.protocol === "file:" ? "http://127.0.0.1:3000" : "";
const adminToken = sessionStorage.getItem("adminToken") || "";
const isAdminPage = document.body?.dataset.page === "admin";

if (isAdminPage && !adminToken) {
  window.location.replace("admin-login.html");
}

if (isAdminPage && adminToken) {
  sessionStorage.removeItem("adminToken");
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      window.location.reload();
    }
  });
}

async function apiRequest(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (adminToken) {
    headers.Authorization = `Bearer ${adminToken}`;
  }

  const response = await fetch(`${apiBase}${path}`, {
    headers,
    ...options,
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "Request failed.");
  }
  return payload;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const defaultSuccessStoryRecords = [
  {
    id: "executive-presidents-team",
    title: "EXECUTIVE PRESIDENT'S TEAM",
    person: "Mr. Jaipal Singh Prajapati & Amita Rani",
    result: "EXECUTIVE PRESIDENT'S TEAM Mr. Jaipal Singh Prajapati & Amita Rani",
    image: "assets/executive-presidents-team.png",
    text: "Amita Rani & Jai Pal Singh from Muzaffarnagar, Uttar Pradesh, achieved the New Executive President's Team level through hard work, dedication, and a strong mission to help people improve their wellness.",
    paragraphs: [
      "My name is Jaipal Singh, and I used to work as a constable in Uttar Pradesh PAC. My wife, Amita Rani, works as a staff nurse at Uttar Pradesh Health Mission.",
      "In October 2017, I started my journey with Herbalife. At the time, I was worried about my wife's increasing weight and her well-being. I learned about Herbalife products through my sponsor, who helped me achieve effective results for my wife. She lost 15 kg of weight and improved her energy levels.",
      "Seeing her results, I also started using the products and increased my weight by 10 kg while improving my wellness. As people noticed our changes, we started helping them achieve their fitness goals.",
      "Currently, we work on the Virtual Nutrition Club \"Fit India Club,\" organize shake parties at the homes of satisfied customers, and guide people to stay fit and healthy. We also emphasize the importance of wellness in their lives.",
      "Recently, we achieved the New President's Team level through hard work and dedication. We would like to thank our sponsor Millionaire Team Kunwar Pal Singh, upline Millionaire Team Mr. Vipin Rana, and mentor Senior Executive President's Team Mr. Gyanendra Singh.",
      "We are grateful to the leadership, the entire organization, and our amazing team members who inspire us to continue our mission. Finally, we express our heartfelt gratitude to Mr. Mark Hughes for providing such a wonderful opportunity.",
      "Amita Rani & Jai Pal Singh, Muzaffarnagar, Uttar Pradesh.",
    ],
  },
  {
    id: "daily-accountability",
    title: "Daily Accountability",
    person: "Neha Sharma",
    result: "Stayed motivated with community support",
    image: "assets/community-session.png",
    text: "Neha wanted structure and encouragement. The daily wellness sessions helped her show up regularly, track her habits, and stay connected with people working toward similar health goals.",
  },
  {
    id: "nutrition-clarity",
    title: "Nutrition Clarity",
    person: "Rohit Mehra",
    result: "Built healthier meal habits",
    image: "assets/nutrition-bowl.png",
    text: "Rohit learned how to plan meals around his schedule instead of following confusing quick fixes. With a clearer nutrition plan, he felt more in control of his choices and progress.",
  },
  {
    id: "wellness-reset",
    title: "Wellness Reset",
    person: "Priya Kapoor",
    result: "Created a balanced lifestyle routine",
    image: "assets/hero-wellness.png",
    text: "Priya focused on sustainable habits across nutrition, movement, and mindset. Small daily wins helped her rebuild discipline and feel more positive about her wellness journey.",
  },
];

const storyDetailTitles = document.querySelectorAll("[data-story-detail-title]");
const storyDetailPeople = document.querySelectorAll("[data-story-detail-person]");
const storyDetailResults = document.querySelectorAll("[data-story-detail-result]");
const storyDetailTexts = document.querySelectorAll("[data-story-detail-text]");
const storyDetailImages = document.querySelectorAll("[data-story-detail-image]");
const successStoryPage = document.querySelector("[data-success-story-page]");
const storyPageStatus = document.querySelector("[data-story-page-status]");
let successStoryRecords = defaultSuccessStoryRecords;

function storyFromCard(card) {
  return {
    id: card.dataset.storyId || "",
    title: card.dataset.storyTitle || "",
    person: card.dataset.storyPerson || "",
    result: card.dataset.storyResult || "",
    image: card.dataset.storyImage || "",
    text: card.dataset.storyText || "",
  };
}

function setStoryDetail(story) {
  if (!story) return;
  const paragraphs = Array.isArray(story.paragraphs) && story.paragraphs.length ? story.paragraphs : [story.text || ""];

  storyDetailTitles.forEach((item) => {
    item.textContent = story.title || "";
  });
  storyDetailPeople.forEach((item) => {
    item.textContent = story.person || "";
  });
  storyDetailResults.forEach((item) => {
    item.textContent = story.result || "";
  });
  storyDetailTexts.forEach((item) => {
    item.innerHTML = paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
  });
  storyDetailImages.forEach((item) => {
    item.src = story.image || item.src;
    item.alt = `${story.person || "Success story"} photo`;
  });
}

function renderSuccessStoryCards(target, stories) {
  if (!target) return;
  const visibleStories = stories.filter((story) => story.active !== false);

  if (!visibleStories.length) {
    target.innerHTML = '<article class="resource-card"><h3>No stories yet</h3><p class="card-copy">Add active success stories from the admin panel.</p></article>';
    return;
  }

  target.innerHTML = visibleStories.map((story, index) => `
    <a
      href="success-story.html?id=${encodeURIComponent(story.id)}"
      class="story-photo-card${index === 0 ? " is-active" : ""}"
      data-story-card
      data-story-id="${escapeHtml(story.id)}"
      data-story-title="${escapeHtml(story.title)}"
      data-story-person="${escapeHtml(story.person)}"
      data-story-result="${escapeHtml(story.result)}"
      data-story-image="${escapeHtml(story.image)}"
      data-story-text="${escapeHtml(story.text || (story.paragraphs || [])[0] || "")}"
    >
      <img src="${escapeHtml(story.image)}" alt="${escapeHtml(story.person || story.title)} success story photo">
      <span>${escapeHtml(story.title)}</span>
      <strong>${escapeHtml(story.person)}</strong>
    </a>
  `).join("");
}

function setActiveStory(card, cards) {
  if (!card) return;

  cards.forEach((item) => {
    const isSelected = item === card;
    item.classList.toggle("is-active", isSelected);
  });

  const storyId = card.dataset.storyId;
  setStoryDetail(successStoryRecords.find((story) => story.id === storyId) || storyFromCard(card));
}

function setupSuccessStoryCards() {
  const storyCards = Array.from(document.querySelectorAll("[data-story-card]"));
  if (!storyCards.length) return;

  storyCards.forEach((card) => {
    card.addEventListener("click", () => {
      setActiveStory(card, storyCards);
      if (card.dataset.storyLink && !(card instanceof HTMLAnchorElement)) {
        window.location.href = card.dataset.storyLink;
      }
    });
  });

  if (!successStoryPage) {
    setActiveStory(document.querySelector("[data-story-card].is-active") || storyCards[0], storyCards);
  }
}

function loadSuccessStoryPageFromStories(stories) {
  if (!successStoryPage) return;
  const params = new URLSearchParams(window.location.search);
  const storyId = params.get("id") || "executive-presidents-team";
  const story = stories.find((item) => item.id === storyId);

  if (story) {
    setStoryDetail(story);
    document.title = `${story.title} | Wellness Path`;
    if (storyPageStatus) storyPageStatus.textContent = story.result;
  } else {
    const defaultStory = stories[0] || defaultSuccessStoryRecords[0];
    setStoryDetail(defaultStory);
    if (storyPageStatus) storyPageStatus.textContent = "This story is not available yet.";
  }
}

async function loadSuccessStories() {
  const listTargets = document.querySelectorAll("[data-success-story-list]");
  if (!listTargets.length && !successStoryPage && !document.querySelector("[data-admin-success-stories-list]")) return;

  try {
    const stories = await apiRequest("/api/success-stories");
    if (Array.isArray(stories) && stories.length) {
      successStoryRecords = stories;
    }
  } catch {
    successStoryRecords = defaultSuccessStoryRecords;
  }

  listTargets.forEach((target) => renderSuccessStoryCards(target, successStoryRecords));
  setupSuccessStoryCards();
  loadSuccessStoryPageFromStories(successStoryRecords);
  renderAdminSuccessStories(successStoryRecords);
}

function phoneHref(phone) {
  const digits = String(phone || "").replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : "#";
}

function mailHref(email) {
  return email ? `mailto:${email}` : "#";
}

function setExternalLink(anchor, href) {
  if (!anchor) return;
  anchor.href = href || "#";
  if (href && href !== "#") {
    anchor.target = "_blank";
    anchor.rel = "noopener";
  }
}

function applySiteSettings(settings) {
  if (!settings) return;

  document.querySelectorAll('a[href^="tel:"]').forEach((anchor) => {
    anchor.href = phoneHref(settings.phone);
    if (!anchor.classList.contains("nav-call")) anchor.textContent = settings.phone || anchor.textContent;
  });
  document.querySelectorAll('a[href^="mailto:"]').forEach((anchor) => {
    anchor.href = mailHref(settings.email);
    anchor.textContent = settings.email || anchor.textContent;
  });
  document.querySelectorAll('a[aria-label="WhatsApp"]').forEach((anchor) => setExternalLink(anchor, settings.whatsappUrl));
  document.querySelectorAll('a[aria-label="Instagram"]').forEach((anchor) => setExternalLink(anchor, settings.instagramUrl));
  document.querySelectorAll('a[aria-label="YouTube"]').forEach((anchor) => setExternalLink(anchor, settings.youtubeUrl));
  document.querySelectorAll("[data-community-whatsapp-link]").forEach((anchor) => setExternalLink(anchor, settings.whatsappUrl));
  document.querySelectorAll("[data-community-zoom-link]").forEach((anchor) => setExternalLink(anchor, settings.zoomUrl));

  const communityTitle = document.querySelector("[data-community-title]");
  const communityText = document.querySelector("[data-community-text]");
  const communityBullets = document.querySelector("[data-community-bullets]");
  if (communityTitle) communityTitle.textContent = settings.communityTitle || communityTitle.textContent;
  if (communityText) communityText.textContent = settings.communityText || communityText.textContent;
  if (communityBullets && Array.isArray(settings.communityBullets)) {
    communityBullets.innerHTML = settings.communityBullets.map((line) => `<li>${escapeHtml(line)}</li>`).join("");
  }

  fillSiteSettingsForm(settings);
}

async function loadSiteSettings() {
  if (!document.querySelector("[data-site-settings-form]") && !document.querySelector("[data-community-title]") && !document.querySelector(".footer-socials")) return;

  try {
    const settings = await apiRequest("/api/site-settings");
    applySiteSettings(settings);
  } catch {
    fillSiteSettingsForm(null);
  }
}

const adminLoginForm = document.querySelector("[data-admin-login-form]");

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = adminLoginForm.querySelector(".form-status");
    const formData = new FormData(adminLoginForm);

    if (status) status.textContent = "Checking access...";

    try {
      const payload = await apiRequest("/api/admin-login", {
        method: "POST",
        body: JSON.stringify({
          accessId: formData.get("access-id"),
          password: formData.get("password"),
        }),
      });
      sessionStorage.setItem("adminToken", payload.token);
      if (status) status.textContent = "Login successful.";
      window.location.href = "admin.html";
    } catch (error) {
      if (status) status.textContent = error.message || "Invalid access ID or password.";
    }
  });
}

const adminLogoutButton = document.querySelector("[data-admin-logout]");

if (adminLogoutButton) {
  adminLogoutButton.addEventListener("click", () => {
    sessionStorage.removeItem("adminToken");
    window.location.href = "admin.html";
  });
}

const contactForm = document.querySelector("[data-contact-form]");

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = contactForm.querySelector(".form-status");
    const formData = new FormData(contactForm);
    const contact = {
      fullName: formData.get("full-name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
    };
    const name = String(contact.fullName || "there").trim() || "there";

    if (status) {
      status.textContent = "Sending...";
    }

    try {
      await apiRequest("/api/contact", {
        method: "POST",
        body: JSON.stringify(contact),
      });
      if (status) {
        status.textContent = `Thanks, ${name}. Your message has been saved.`;
      }
      contactForm.reset();
    } catch (error) {
      if (status) {
        status.textContent = "Start the backend server to save this message.";
      }
    }
  });
}

const progressForm = document.querySelector("[data-progress-form]");

if (progressForm) {
  progressForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const checked = progressForm.querySelectorAll("input[type='checkbox']:checked").length;
    const total = progressForm.querySelectorAll("input[type='checkbox']").length;
    const status = progressForm.querySelector(".form-status");

    if (status) {
      status.textContent = `Nice work. ${checked} of ${total} habits are marked complete for this check-in.`;
    }
  });
}

const progressCheckForm = document.querySelector("[data-progress-check-form]");

if (progressCheckForm) {
  progressCheckForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const idNumber = progressCheckForm.querySelector("#progress-id")?.value?.trim();
    const isSupervisor = progressCheckForm.querySelector("#progress-supervisor-confirmation")?.checked;
    const status = progressCheckForm.querySelector(".form-status");
    const type = isSupervisor ? "supervisor" : "below";

    if (status && idNumber) {
      status.textContent = "Checking...";
      sessionStorage.setItem("progressIdNumber", idNumber);
      sessionStorage.setItem("progressType", type);
      window.location.href = `my-progress-information.html?id=${encodeURIComponent(idNumber)}&type=${encodeURIComponent(type)}`;
    }
  });
}

const qualificationForm = document.querySelector("[data-qualification-form]");

if (qualificationForm) {
  qualificationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const idNumber = qualificationForm.querySelector("#qualification-id")?.value?.trim();
    const isSupervisor = qualificationForm.querySelector("#supervisor-confirmation")?.checked;
    const status = qualificationForm.querySelector(".form-status");

    if (status && idNumber) {
      status.textContent = "Checking...";
      sessionStorage.setItem("qualificationIdNumber", idNumber);
      window.location.href = isSupervisor
        ? `qualification-information.html?id=${encodeURIComponent(idNumber)}`
        : `below-supervisor-information.html?id=${encodeURIComponent(idNumber)}`;
    }
  });
}

const giftQualificationForm = document.querySelector("[data-gift-qualification-form]");

if (giftQualificationForm) {
  giftQualificationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const idNumber = giftQualificationForm.querySelector("#gift-qualification-id")?.value?.trim();
    const status = giftQualificationForm.querySelector(".form-status");

    if (status && idNumber) {
      status.textContent = "Checking...";
      sessionStorage.setItem("qualificationIdNumber", idNumber);
      window.location.href = `gifts-pc-associates-information.html?id=${encodeURIComponent(idNumber)}`;
    }
  });
}

const goaQualificationForm = document.querySelector("[data-goa-qualification-form]");

if (goaQualificationForm) {
  goaQualificationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const idNumber = goaQualificationForm.querySelector("#goa-qualification-id")?.value?.trim();
    const status = goaQualificationForm.querySelector(".form-status");

    if (status && idNumber) {
      status.textContent = "Checking...";
      sessionStorage.setItem("qualificationIdNumber", idNumber);
      window.location.href = `goa-qualification-information.html?id=${encodeURIComponent(idNumber)}`;
    }
  });
}

const juneSpecialOfferForm = document.querySelector("[data-june-special-offer-form]");

if (juneSpecialOfferForm) {
  juneSpecialOfferForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const idNumber = juneSpecialOfferForm.querySelector("#june-special-offer-id")?.value?.trim();
    const status = juneSpecialOfferForm.querySelector(".form-status");

    if (status && idNumber) {
      status.textContent = "Checking...";
      sessionStorage.setItem("qualificationIdNumber", idNumber);
      window.location.href = `june-special-offer-information.html?id=${encodeURIComponent(idNumber)}`;
    }
  });
}

const qualificationIdDisplay = document.querySelector("[data-qualification-id-display]");
const qualificationInfoMessage = document.querySelector("[data-qualification-info-message]");
const qualificationIdSlab = document.querySelector("[data-qualification-id-slab]");
const qualificationName = document.querySelector("[data-qualification-name]");
const qualificationPpv = document.querySelector("[data-qualification-ppv]");
const qualificationTotalVolume = document.querySelector("[data-qualification-total-volume]");
const qualificationVolumeRequired = document.querySelector("[data-qualification-volume-required]");
const qualificationResult = document.querySelector("[data-qualification-result]");

if (qualificationIdDisplay) {
  const params = new URLSearchParams(window.location.search);
  const idNumber = params.get("id") || sessionStorage.getItem("qualificationIdNumber");

  if (idNumber) {
    qualificationIdDisplay.textContent = idNumber;
    loadQualificationResult(idNumber);
  }
}

function setQualificationSlabs(record, notFoundMessage = "No result found for this ID") {
  if (qualificationIdSlab) qualificationIdSlab.textContent = record?.idNumber || "--";
  if (qualificationName) qualificationName.textContent = record?.name || (record ? "--" : "Not found");
  if (qualificationPpv) qualificationPpv.textContent = record?.ppv || "--";
  if (qualificationTotalVolume) qualificationTotalVolume.textContent = record?.totalVolume || "--";
  if (qualificationVolumeRequired) qualificationVolumeRequired.textContent = record?.volumeRequired || (record ? "--" : "Not available");
  if (qualificationResult) qualificationResult.textContent = record?.result || (record ? "--" : notFoundMessage);
}

async function loadQualificationResult(idNumber) {
  if (qualificationInfoMessage) {
    qualificationInfoMessage.textContent = "Loading qualification information...";
  }

  try {
    const record = await apiRequest(`/api/qualification/${encodeURIComponent(idNumber)}`);
    setQualificationSlabs(record);
    if (qualificationInfoMessage) {
      qualificationInfoMessage.textContent = "Qualification information loaded from the backend Excel sheet.";
    }
  } catch {
    setQualificationSlabs(null);
    if (qualificationInfoMessage) {
      qualificationInfoMessage.textContent = "No backend record found for this ID. Add this ID in the Qualification Excel Sheet section of the admin page.";
    }
  }
}

const belowIdDisplay = document.querySelector("[data-below-id-display]");
const belowInfoMessage = document.querySelector("[data-below-info-message]");
const belowIdSlab = document.querySelector("[data-below-id-slab]");
const belowName = document.querySelector("[data-below-name]");
const belowPpv = document.querySelector("[data-below-ppv]");
const belowTotalVolume = document.querySelector("[data-below-total-volume]");
const belowVolumeRequired = document.querySelector("[data-below-volume-required]");
const belowResult = document.querySelector("[data-below-result]");

if (belowIdDisplay) {
  const params = new URLSearchParams(window.location.search);
  const idNumber = params.get("id") || sessionStorage.getItem("qualificationIdNumber");

  if (idNumber) {
    belowIdDisplay.textContent = idNumber;
    loadBelowSupervisorResult(idNumber);
  }
}

function setBelowSupervisorSlabs(record, notFoundMessage = "No result found for this ID") {
  if (belowIdSlab) belowIdSlab.textContent = record?.idNumber || "--";
  if (belowName) belowName.textContent = record?.name || (record ? "--" : "Not found");
  if (belowPpv) belowPpv.textContent = record?.ppv || "--";
  if (belowTotalVolume) belowTotalVolume.textContent = record?.totalVolume || "--";
  if (belowVolumeRequired) belowVolumeRequired.textContent = record?.volumeRequired || (record ? "--" : "Not available");
  if (belowResult) belowResult.textContent = record?.result || (record ? "--" : notFoundMessage);
}

async function loadBelowSupervisorResult(idNumber) {
  if (belowInfoMessage) {
    belowInfoMessage.textContent = "Loading below-supervisor qualification information...";
  }

  try {
    const record = await apiRequest(`/api/gifts/${encodeURIComponent(idNumber)}`);
    setBelowSupervisorSlabs(record);
    if (belowInfoMessage) {
      belowInfoMessage.textContent = "Below-supervisor information loaded from the backend Excel sheet.";
    }
  } catch {
    setBelowSupervisorSlabs(null);
    if (belowInfoMessage) {
      belowInfoMessage.textContent = "No below-supervisor record found for this ID. Add this ID in the Below Supervisor Excel Sheet section of the admin page.";
    }
  }
}

const giftIdDisplay = document.querySelector("[data-gift-id-display]");
const giftInfoMessage = document.querySelector("[data-gift-info-message]");
const giftIdSlab = document.querySelector("[data-gift-id-slab]");
const giftName = document.querySelector("[data-gift-name]");
const giftPpv = document.querySelector("[data-gift-ppv]");
const giftRequired = document.querySelector("[data-gift-required]");
const giftResult = document.querySelector("[data-gift-result]");

if (giftIdDisplay) {
  const params = new URLSearchParams(window.location.search);
  const idNumber = params.get("id") || sessionStorage.getItem("qualificationIdNumber");

  if (idNumber) {
    giftIdDisplay.textContent = idNumber;
    loadGiftQualificationResult(idNumber);
  }
}

function setGiftSlabs(record, notFoundMessage = "No result found for this ID") {
  if (giftIdSlab) giftIdSlab.textContent = record?.idNumber || "--";
  if (giftName) giftName.textContent = record?.name || (record ? "--" : "Not found");
  if (giftPpv) giftPpv.textContent = record?.ppv || "--";
  if (giftRequired) giftRequired.textContent = record?.volumeRequired || (record ? "--" : "Not available");
  if (giftResult) giftResult.textContent = record?.result || (record ? "--" : notFoundMessage);
}

async function loadGiftQualificationResult(idNumber) {
  if (giftInfoMessage) {
    giftInfoMessage.textContent = "Loading PPV from below-supervisor data...";
  }

  try {
    const record = await apiRequest(`/api/gifts/${encodeURIComponent(idNumber)}`);
    setGiftSlabs(record);
    if (giftInfoMessage) {
      giftInfoMessage.textContent = "Gift result calculated from the Gifts Excel sheet.";
    }
  } catch {
    setGiftSlabs(null);
    if (giftInfoMessage) {
      giftInfoMessage.textContent = "No Gifts record found for this ID. Add this ID in the Gifts Excel Sheet section of the admin page.";
    }
  }
}

const goaIdDisplay = document.querySelector("[data-goa-id-display]");
const goaInfoMessage = document.querySelector("[data-goa-info-message]");
const goaIdSlab = document.querySelector("[data-goa-id-slab]");
const goaName = document.querySelector("[data-goa-name]");
const goaTotalVolume = document.querySelector("[data-goa-total-volume]");
const goaRequired = document.querySelector("[data-goa-required]");
const goaResult = document.querySelector("[data-goa-result]");

if (goaIdDisplay) {
  const params = new URLSearchParams(window.location.search);
  const idNumber = params.get("id") || sessionStorage.getItem("qualificationIdNumber");

  if (idNumber) {
    goaIdDisplay.textContent = idNumber;
    loadGoaQualificationResult(idNumber);
  }
}

function setGoaSlabs(record, notFoundMessage = "No result found for this ID") {
  if (goaIdSlab) goaIdSlab.textContent = record?.idNumber || "--";
  if (goaName) goaName.textContent = record?.name || (record ? "--" : "Not found");
  if (goaTotalVolume) goaTotalVolume.textContent = record?.totalVolume || "--";
  if (goaRequired) goaRequired.textContent = record?.volumeRequired || (record ? "--" : "Not available");
  if (goaResult) goaResult.textContent = record?.result || (record ? "--" : notFoundMessage);
}

async function loadGoaQualificationResult(idNumber) {
  if (goaInfoMessage) {
    goaInfoMessage.textContent = "Loading Total Volume from Supervisor and above data...";
  }

  try {
    const record = await apiRequest(`/api/goa/${encodeURIComponent(idNumber)}`);
    setGoaSlabs(record);
    if (goaInfoMessage) {
      goaInfoMessage.textContent = "Goa result calculated from the Goa Excel sheet.";
    }
  } catch {
    setGoaSlabs(null);
    if (goaInfoMessage) {
      goaInfoMessage.textContent = "No Goa record found for this ID. Add this ID in the Goa Excel Sheet section of the admin page.";
    }
  }
}

const juneSpecialOfferIdDisplay = document.querySelector("[data-june-special-offer-id-display]");
const juneSpecialOfferInfoMessage = document.querySelector("[data-june-special-offer-info-message]");
const juneSpecialOfferIdSlab = document.querySelector("[data-june-special-offer-id-slab]");
const juneSpecialOfferName = document.querySelector("[data-june-special-offer-name]");
const juneSpecialOfferTotalVolume = document.querySelector("[data-june-special-offer-total-volume]");
const juneSpecialOfferRequired = document.querySelector("[data-june-special-offer-required]");
const juneSpecialOfferResult = document.querySelector("[data-june-special-offer-result]");

if (juneSpecialOfferIdDisplay) {
  const params = new URLSearchParams(window.location.search);
  const idNumber = params.get("id") || sessionStorage.getItem("qualificationIdNumber");

  if (idNumber) {
    juneSpecialOfferIdDisplay.textContent = idNumber;
    loadJuneSpecialOfferResult(idNumber);
  }
}

function setJuneSpecialOfferSlabs(record, notFoundMessage = "No result found for this ID") {
  if (juneSpecialOfferIdSlab) juneSpecialOfferIdSlab.textContent = record?.idNumber || "--";
  if (juneSpecialOfferName) juneSpecialOfferName.textContent = record?.name || (record ? "--" : "Not found");
  if (juneSpecialOfferTotalVolume) juneSpecialOfferTotalVolume.textContent = record?.totalVolume || "--";
  if (juneSpecialOfferRequired) juneSpecialOfferRequired.textContent = record?.volumeRequired || (record ? "--" : "Not available");
  if (juneSpecialOfferResult) juneSpecialOfferResult.textContent = record?.result || (record ? "--" : notFoundMessage);
}

async function loadJuneSpecialOfferResult(idNumber) {
  if (juneSpecialOfferInfoMessage) {
    juneSpecialOfferInfoMessage.textContent = "Loading TVP from June Offer data...";
  }

  try {
    const record = await apiRequest(`/api/june-special-offer/${encodeURIComponent(idNumber)}`);
    setJuneSpecialOfferSlabs(record);
    if (juneSpecialOfferInfoMessage) {
      juneSpecialOfferInfoMessage.textContent = "Reward result calculated from Total Volume in the June Offer sheet.";
    }
  } catch {
    setJuneSpecialOfferSlabs(null);
    if (juneSpecialOfferInfoMessage) {
      juneSpecialOfferInfoMessage.textContent = "No June Offer record found for this ID. Add this ID in the June Special Offer Sheet section of the admin page.";
    }
  }
}

const progressIdDisplay = document.querySelector("[data-progress-id-display]");
const progressInfoMessage = document.querySelector("[data-progress-info-message]");
const progressIdSlab = document.querySelector("[data-progress-id-slab]");
const progressName = document.querySelector("[data-progress-name]");
const progressCurrentMonth = document.querySelector("[data-progress-current-month]");
const progressSponsorName = document.querySelector("[data-progress-sponsor-name]");
const progressPpv = document.querySelector("[data-progress-ppv]");
const progressTotalVolume = document.querySelector("[data-progress-total-volume]");
const progressTvCard = document.querySelector("[data-progress-tv-card]");

if (progressIdDisplay) {
  const params = new URLSearchParams(window.location.search);
  const idNumber = params.get("id") || sessionStorage.getItem("progressIdNumber");
  const type = params.get("type") || sessionStorage.getItem("progressType") || "below";

  if (idNumber) {
    progressIdDisplay.textContent = idNumber;
    loadProgressResult(idNumber, type);
  }
}

function setProgressSlabs(record, notFoundMessage = "No progress found for this ID") {
  if (progressIdSlab) progressIdSlab.textContent = record?.idNumber || "--";
  if (progressName) progressName.textContent = record?.name || (record ? "--" : "Not found");
  if (progressCurrentMonth) progressCurrentMonth.textContent = record?.currentMonth || "--";
  if (progressSponsorName) progressSponsorName.textContent = record?.sponsorName || "--";
  if (progressPpv) progressPpv.textContent = record?.ppv || "--";
  if (progressTotalVolume) progressTotalVolume.textContent = record?.totalVolume || "--";
}

async function loadProgressResult(idNumber, type) {
  const isSupervisor = type === "supervisor";
  const label = isSupervisor ? "Supervisor and above" : "Below supervisor";
  const path = isSupervisor ? "/api/progress-supervisor" : "/api/progress-below";

  if (progressTvCard) {
    progressTvCard.hidden = !isSupervisor;
  }

  if (progressInfoMessage) {
    progressInfoMessage.textContent = `Loading ${label} progress data...`;
  }

  try {
    const record = await apiRequest(`${path}/${encodeURIComponent(idNumber)}`);
    setProgressSlabs(record);
    if (progressInfoMessage) {
      progressInfoMessage.textContent = `${label} progress loaded from the admin sheet.`;
    }
  } catch {
    setProgressSlabs(null);
    if (progressInfoMessage) {
      progressInfoMessage.textContent = `No ${label} progress record found for this ID. Add this ID in the My Progress sheet section of the admin page.`;
    }
  }
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"' && insideQuotes && nextChar === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === "," && !insideQuotes) {
      row.push(value.trim());
      value = "";
    } else if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && nextChar === "\n") index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);
  return rows;
}

function normalizeHeader(value) {
  return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
}

function csvToQualificationRecords(text) {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];

  const headers = rows[0].map(normalizeHeader);
  const aliases = {
    idNumber: ["idnumber", "id", "memberid", "distributorid"],
    name: ["name", "fullname", "membername", "distributorname"],
    currentMonth: ["currentmonth", "currentmonthname", "month", "monthname"],
    sponsorName: ["sponsorname", "sponsor", "sponsername", "sponser", "upline", "uplinename"],
    ppv: ["ppv"],
    totalVolume: ["totalvolume", "totalvol", "volume", "tvp"],
    volumeRequired: ["volumerequired", "requiredvolume", "volumerequiredforjimcorbettqualification", "jimcorbettrequiredvolume"],
    result: ["result", "status", "qualificationresult"],
  };

  function valueFrom(row, key) {
    const headerIndex = headers.findIndex((header) => aliases[key].includes(header));
    return headerIndex >= 0 ? row[headerIndex] || "" : "";
  }

  return rows.slice(1).map((row) => ({
    idNumber: valueFrom(row, "idNumber"),
    name: valueFrom(row, "name"),
    currentMonth: valueFrom(row, "currentMonth"),
    sponsorName: valueFrom(row, "sponsorName"),
    ppv: valueFrom(row, "ppv"),
    totalVolume: valueFrom(row, "totalVolume"),
    volumeRequired: valueFrom(row, "volumeRequired"),
    result: valueFrom(row, "result"),
  })).filter((record) => record.idNumber);
}

function renderDisplayItems(target, items) {
  if (!target) return;
  if (!items.length) {
    target.innerHTML = '<article class="resource-card"><h3>No items yet</h3><p class="card-copy">Publish an item from the admin page.</p></article>';
    return;
  }

  target.innerHTML = items.map((item) => `
    <article class="resource-card">
      <h3>${escapeHtml(item.title)}</h3>
      <p class="eyebrow">${escapeHtml(item.category || "Update")}</p>
      <p class="card-copy">${escapeHtml(item.message)}</p>
      <span class="timestamp">${escapeHtml(formatDate(item.createdAt))}</span>
    </article>
  `).join("");
}

async function loadDisplayItems() {
  const publicTarget = document.querySelector("[data-display-items]");
  const adminTarget = document.querySelector("[data-admin-display-items]");
  if (!publicTarget && !adminTarget) return;

  try {
    const items = await apiRequest("/api/display-items");
    renderDisplayItems(publicTarget, items);
    renderDisplayItems(adminTarget, items);
  } catch {
    renderDisplayItems(publicTarget, []);
    renderDisplayItems(adminTarget, []);
  }
}

function criteriaLines(value) {
  return String(value || "")
    .split(/\r?\n|;/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function renderQualificationMenu(target, items) {
  if (!target) return;
  const activeItems = items.filter((item) => item.active !== false);

  if (!activeItems.length) {
    target.innerHTML = '<article class="resource-card"><h3>No qualifications available</h3><p class="card-copy">Add an active qualification from the admin panel.</p></article>';
    return;
  }

  target.innerHTML = activeItems.map((item) => {
    const lines = criteriaLines(item.criteria);
    return `
      <a class="qualification-choice qualification-image-choice" href="${escapeHtml(item.href || "qualification.html")}" aria-label="Select ${escapeHtml(item.title || "Qualification")}">
        ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title || "Qualification")} flyer">` : ""}
        <span>${escapeHtml(item.title || "Qualification")}</span>
        ${item.description ? `<strong>${escapeHtml(item.description)}</strong>` : ""}
        ${lines.length ? `<ul class="qualification-card-criteria">${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>` : ""}
      </a>
    `;
  }).join("");
}

function renderAdminQualificationMenu(items) {
  const target = document.querySelector("[data-admin-qualification-menu-list]");
  if (!target) return;

  window.qualificationMenuCache = items;

  if (!items.length) {
    target.innerHTML = '<tr><td colspan="5">No qualification menu items saved yet.</td></tr>';
    return;
  }

  target.innerHTML = items.map((item) => {
    const lines = criteriaLines(item.criteria);
    return `
      <tr>
        <td>
          ${escapeHtml(item.title)}
          <span class="timestamp">Order: ${escapeHtml(item.sortOrder ?? 100)}${item.updatedAt ? ` | ${escapeHtml(formatDate(item.updatedAt))}` : ""}</span>
        </td>
        <td>${escapeHtml(item.href || "-")}<span class="timestamp">${escapeHtml(item.image || "No image")}</span></td>
        <td>${lines.length ? `<ul class="admin-criteria-list">${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>` : "-"}</td>
        <td>${item.active === false ? "Hidden" : "Visible"}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-soft" type="button" data-edit-qualification-menu="${escapeHtml(item.id)}">Edit</button>
            <button class="btn" type="button" data-delete-qualification-menu="${escapeHtml(item.id)}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

async function loadQualificationMenu() {
  const publicTarget = document.querySelector("[data-qualification-menu-list]");
  const adminTarget = document.querySelector("[data-admin-qualification-menu-list]");
  if (!publicTarget && !adminTarget) return;

  try {
    const items = await apiRequest("/api/qualification-menu");
    renderQualificationMenu(publicTarget, items);
    renderAdminQualificationMenu(items);
  } catch {
    renderAdminQualificationMenu([]);
  }
}

function fillQualificationMenuForm(item) {
  const form = document.querySelector("[data-qualification-menu-form]");
  if (!form) return;

  form.querySelector("#qualification-menu-id").value = item?.id || "";
  form.querySelector("#qualification-menu-title").value = item?.title || "";
  form.querySelector("#qualification-menu-description").value = item?.description || "";
  form.querySelector("#qualification-menu-href").value = item?.href || "";
  form.querySelector("#qualification-menu-image").value = item?.image || "";
  form.querySelector("#qualification-menu-criteria").value = item?.criteria || "";
  form.querySelector("#qualification-menu-sort-order").value = item?.sortOrder ?? 100;
  form.querySelector("#qualification-menu-active").checked = item?.active !== false;
  form.querySelector(".form-status").textContent = item ? `Editing ${item.title}.` : "";
}

function formatSlabs(slabs = []) {
  return slabs
    .slice()
    .sort((a, b) => Number(a.threshold || 0) - Number(b.threshold || 0))
    .map((slab) => `${slab.threshold} = ${slab.result}`)
    .join("\n");
}

function parseSlabText(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s*(?:=|,|\|)\s*/);
      if (parts.length >= 2) {
        return {
          threshold: parts[0].replace(/[^\d.]/g, ""),
          result: parts.slice(1).join(" = ").trim(),
        };
      }

      const match = line.match(/([\d,.]+)\s*(?:-|:)?\s*(.+)/);
      return match ? { threshold: match[1].replace(/,/g, ""), result: match[2].trim() } : null;
    })
    .filter((slab) => slab && Number(slab.threshold) > 0 && slab.result)
    .sort((a, b) => Number(a.threshold) - Number(b.threshold));
}

function renderQualificationCriteriaOptions(criteria) {
  const select = document.querySelector("#qualification-criteria-id");
  if (!select) return;

  const currentValue = select.value;
  select.innerHTML = criteria.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`).join("");
  if (currentValue && criteria.some((item) => item.id === currentValue)) {
    select.value = currentValue;
  }
}

function renderAdminQualificationCriteria(criteria) {
  const target = document.querySelector("[data-admin-qualification-criteria-list]");
  if (!target) return;

  window.qualificationCriteriaCache = criteria;

  if (!criteria.length) {
    target.innerHTML = '<tr><td colspan="4">No calculation criteria saved yet.</td></tr>';
    return;
  }

  target.innerHTML = criteria.map((item) => `
    <tr>
      <td>${escapeHtml(item.title)}<span class="timestamp">${escapeHtml(item.id)}${item.updatedAt ? ` | ${escapeHtml(formatDate(item.updatedAt))}` : ""}</span></td>
      <td>${escapeHtml(item.metricLabel || item.metric || "-")}</td>
      <td><ul class="admin-criteria-list">${(item.slabs || []).map((slab) => `<li>${escapeHtml(slab.threshold)} = ${escapeHtml(slab.result)}</li>`).join("")}</ul></td>
      <td>
        <div class="table-actions">
          <button class="btn btn-soft" type="button" data-edit-qualification-criteria="${escapeHtml(item.id)}">Edit</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function fillQualificationCriteriaForm(item) {
  const form = document.querySelector("[data-qualification-criteria-form]");
  if (!form || !item) return;

  form.querySelector("#qualification-criteria-id").value = item.id || "";
  form.querySelector("#qualification-criteria-title").value = item.title || "";
  form.querySelector("#qualification-criteria-metric").value = item.metric || "totalVolume";
  form.querySelector("#qualification-criteria-metric-label").value = item.metricLabel || "";
  form.querySelector("#qualification-criteria-not-qualified").value = item.notQualifiedResult || "";
  form.querySelector("#qualification-criteria-slabs").value = formatSlabs(item.slabs || []);
  form.querySelector(".form-status").textContent = `Editing ${item.title}.`;
}

async function loadQualificationCriteria() {
  const form = document.querySelector("[data-qualification-criteria-form]");
  const list = document.querySelector("[data-admin-qualification-criteria-list]");
  if (!form && !list) return;

  try {
    const criteria = await apiRequest("/api/qualification-criteria");
    renderQualificationCriteriaOptions(criteria);
    renderAdminQualificationCriteria(criteria);
    const selected = criteria.find((item) => item.id === form?.querySelector("#qualification-criteria-id")?.value) || criteria[0];
    fillQualificationCriteriaForm(selected);
  } catch {
    renderAdminQualificationCriteria([]);
  }
}

async function loadContacts() {
  const contactList = document.querySelector("[data-contact-list]");
  if (!contactList) return;

  try {
    const contacts = await apiRequest("/api/contacts");
    if (!contacts.length) {
      contactList.innerHTML = '<tr><td colspan="4">No contact submissions yet.</td></tr>';
      return;
    }

    contactList.innerHTML = contacts.map((contact) => `
      <tr>
        <td>${escapeHtml(contact.fullName)}<span class="timestamp">${escapeHtml(formatDate(contact.createdAt))}</span></td>
        <td>${escapeHtml(contact.email)}</td>
        <td>${escapeHtml(contact.phone || "-")}</td>
        <td>${escapeHtml(contact.message)}</td>
      </tr>
    `).join("");
  } catch {
    contactList.innerHTML = '<tr><td colspan="4">Start the backend server to load contact messages.</td></tr>';
  }
}

async function loadQualificationRecords() {
  const recordsList = document.querySelector("[data-qualification-records-list]");
  if (!recordsList) return;

  try {
    const records = await apiRequest("/api/qualification-records");
    window.qualificationRecordsCache = records;
    if (!records.length) {
      recordsList.innerHTML = '<tr><td colspan="7">No qualification records saved yet.</td></tr>';
      return;
    }

    recordsList.innerHTML = records.map((record) => `
      <tr>
        <td>${escapeHtml(record.idNumber)}<span class="timestamp">${escapeHtml(formatDate(record.updatedAt))}</span></td>
        <td>${escapeHtml(record.name || "-")}</td>
        <td>${escapeHtml(record.ppv || "-")}</td>
        <td>${escapeHtml(record.totalVolume || "-")}</td>
        <td>${escapeHtml(record.volumeRequired || "-")}</td>
        <td>${escapeHtml(record.result || "-")}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-soft" type="button" data-edit-qualification-record="${escapeHtml(record.idNumber)}">Edit</button>
            <button class="btn" type="button" data-delete-qualification-record="${escapeHtml(record.idNumber)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch {
    recordsList.innerHTML = '<tr><td colspan="7">Start the backend server to load qualification records.</td></tr>';
  }
}

function fillQualificationRecordForm(record) {
  const form = document.querySelector("[data-qualification-record-form]");
  if (!form) return;
  form.querySelector("#record-id").value = record?.idNumber || "";
  form.querySelector("#record-name").value = record?.name || "";
  form.querySelector("#record-ppv").value = record?.ppv || "";
  form.querySelector("#record-total-volume").value = record?.totalVolume || "";
  form.querySelector(".form-status").textContent = record ? `Editing ID ${record.idNumber}.` : "";
}

async function loadBelowSupervisorRecords() {
  const recordsList = document.querySelector("[data-below-records-list]");
  if (!recordsList) return;

  try {
    const records = await apiRequest("/api/below-supervisor-records");
    window.belowSupervisorRecordsCache = records;
    if (!records.length) {
      recordsList.innerHTML = '<tr><td colspan="7">No below-supervisor records saved yet.</td></tr>';
      return;
    }

    recordsList.innerHTML = records.map((record) => `
      <tr>
        <td>${escapeHtml(record.idNumber)}<span class="timestamp">${escapeHtml(formatDate(record.updatedAt))}</span></td>
        <td>${escapeHtml(record.name || "-")}</td>
        <td>${escapeHtml(record.ppv || "-")}</td>
        <td>${escapeHtml(record.totalVolume || "-")}</td>
        <td>${escapeHtml(record.volumeRequired || "-")}</td>
        <td>${escapeHtml(record.result || "-")}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-soft" type="button" data-edit-below-record="${escapeHtml(record.idNumber)}">Edit</button>
            <button class="btn" type="button" data-delete-below-record="${escapeHtml(record.idNumber)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch {
    recordsList.innerHTML = '<tr><td colspan="7">Start the backend server to load below-supervisor records.</td></tr>';
  }
}

function fillBelowSupervisorRecordForm(record) {
  const form = document.querySelector("[data-below-record-form]");
  if (!form) return;
  form.querySelector("#below-record-id").value = record?.idNumber || "";
  form.querySelector("#below-record-name").value = record?.name || "";
  form.querySelector("#below-record-ppv").value = record?.ppv || "";
  form.querySelector("#below-record-total-volume").value = record?.totalVolume || "";
  form.querySelector(".form-status").textContent = record ? `Editing below-supervisor ID ${record.idNumber}.` : "";
}

async function loadGiftRecords() {
  const recordsList = document.querySelector("[data-gift-records-list]");
  if (!recordsList) return;

  try {
    const records = await apiRequest("/api/gift-records");
    window.giftRecordsCache = records;
    if (!records.length) {
      recordsList.innerHTML = '<tr><td colspan="7">No Gift records saved yet.</td></tr>';
      return;
    }

    recordsList.innerHTML = records.map((record) => `
      <tr>
        <td>${escapeHtml(record.idNumber)}<span class="timestamp">${escapeHtml(formatDate(record.updatedAt))}</span></td>
        <td>${escapeHtml(record.name || "-")}</td>
        <td>${escapeHtml(record.ppv || "-")}</td>
        <td>${escapeHtml(record.totalVolume || "-")}</td>
        <td>${escapeHtml(record.volumeRequired || "-")}</td>
        <td>${escapeHtml(record.result || "-")}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-soft" type="button" data-edit-gift-record="${escapeHtml(record.idNumber)}">Edit</button>
            <button class="btn" type="button" data-delete-gift-record="${escapeHtml(record.idNumber)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch {
    recordsList.innerHTML = '<tr><td colspan="7">Start the backend server to load Gift records.</td></tr>';
  }
}

function fillGiftRecordForm(record) {
  const form = document.querySelector("[data-gift-record-form]");
  if (!form) return;
  form.querySelector("#gift-record-id").value = record?.idNumber || "";
  form.querySelector("#gift-record-name").value = record?.name || "";
  form.querySelector("#gift-record-ppv").value = record?.ppv || "";
  form.querySelector("#gift-record-total-volume").value = record?.totalVolume || "";
  form.querySelector(".form-status").textContent = record ? `Editing Gift ID ${record.idNumber}.` : "";
}

async function loadGoaRecords() {
  const recordsList = document.querySelector("[data-goa-records-list]");
  if (!recordsList) return;

  try {
    const records = await apiRequest("/api/goa-records");
    window.goaRecordsCache = records;
    if (!records.length) {
      recordsList.innerHTML = '<tr><td colspan="7">No Goa records saved yet.</td></tr>';
      return;
    }

    recordsList.innerHTML = records.map((record) => `
      <tr>
        <td>${escapeHtml(record.idNumber)}<span class="timestamp">${escapeHtml(formatDate(record.updatedAt))}</span></td>
        <td>${escapeHtml(record.name || "-")}</td>
        <td>${escapeHtml(record.ppv || "-")}</td>
        <td>${escapeHtml(record.totalVolume || "-")}</td>
        <td>${escapeHtml(record.volumeRequired || "-")}</td>
        <td>${escapeHtml(record.result || "-")}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-soft" type="button" data-edit-goa-record="${escapeHtml(record.idNumber)}">Edit</button>
            <button class="btn" type="button" data-delete-goa-record="${escapeHtml(record.idNumber)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch {
    recordsList.innerHTML = '<tr><td colspan="7">Start the backend server to load Goa records.</td></tr>';
  }
}

function fillGoaRecordForm(record) {
  const form = document.querySelector("[data-goa-record-form]");
  if (!form) return;
  form.querySelector("#goa-record-id").value = record?.idNumber || "";
  form.querySelector("#goa-record-name").value = record?.name || "";
  form.querySelector("#goa-record-ppv").value = record?.ppv || "";
  form.querySelector("#goa-record-total-volume").value = record?.totalVolume || "";
  form.querySelector(".form-status").textContent = record ? `Editing Goa ID ${record.idNumber}.` : "";
}

async function loadJuneSpecialOfferRecords() {
  const recordsList = document.querySelector("[data-june-special-offer-records-list]");
  if (!recordsList) return;

  try {
    const records = await apiRequest("/api/june-special-offer-records");
    window.juneSpecialOfferRecordsCache = records;
    if (!records.length) {
      recordsList.innerHTML = '<tr><td colspan="7">No June Offer records saved yet.</td></tr>';
      return;
    }

    recordsList.innerHTML = records.map((record) => `
      <tr>
        <td>${escapeHtml(record.idNumber)}<span class="timestamp">${escapeHtml(formatDate(record.updatedAt))}</span></td>
        <td>${escapeHtml(record.name || "-")}</td>
        <td>${escapeHtml(record.ppv || "-")}</td>
        <td>${escapeHtml(record.totalVolume || "-")}</td>
        <td>${escapeHtml(record.volumeRequired || "-")}</td>
        <td>${escapeHtml(record.result || "-")}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-soft" type="button" data-edit-june-special-offer-record="${escapeHtml(record.idNumber)}">Edit</button>
            <button class="btn" type="button" data-delete-june-special-offer-record="${escapeHtml(record.idNumber)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch {
    recordsList.innerHTML = '<tr><td colspan="7">Start the backend server to load June Offer records.</td></tr>';
  }
}

function fillJuneSpecialOfferRecordForm(record) {
  const form = document.querySelector("[data-june-special-offer-record-form]");
  if (!form) return;
  form.querySelector("#june-special-offer-record-id").value = record?.idNumber || "";
  form.querySelector("#june-special-offer-record-name").value = record?.name || "";
  form.querySelector("#june-special-offer-record-ppv").value = record?.ppv || "";
  form.querySelector("#june-special-offer-record-total-volume").value = record?.totalVolume || "";
  form.querySelector(".form-status").textContent = record ? `Editing June Offer ID ${record.idNumber}.` : "";
}

const progressAdminConfigs = {
  supervisor: {
    label: "Progress Supervisor",
    recordsPath: "/api/progress-supervisor-records",
    publicPath: "/api/progress-supervisor",
    listSelector: "[data-progress-supervisor-records-list]",
    formSelector: "[data-progress-supervisor-record-form]",
    importFormSelector: "[data-progress-supervisor-import-form]",
    fileSelector: "#progress-supervisor-excel-file",
    csvSelector: "[data-progress-supervisor-csv]",
    cacheName: "progressSupervisorRecordsCache",
    fieldPrefix: "progress-supervisor-record",
    clearFormSelector: "[data-clear-progress-supervisor-record-form]",
    clearAllSelector: "[data-clear-progress-supervisor-records]",
    editDataKey: "editProgressSupervisorRecord",
    deleteDataKey: "deleteProgressSupervisorRecord",
    editAttr: "data-edit-progress-supervisor-record",
    deleteAttr: "data-delete-progress-supervisor-record",
    checkFormSelector: "[data-admin-progress-supervisor-check-form]",
    checkInputSelector: "#admin-progress-supervisor-check-id",
    resultPrefix: "admin-progress-supervisor",
    showTotalVolume: true,
  },
  below: {
    label: "Progress Below",
    recordsPath: "/api/progress-below-records",
    publicPath: "/api/progress-below",
    listSelector: "[data-progress-below-records-list]",
    formSelector: "[data-progress-below-record-form]",
    importFormSelector: "[data-progress-below-import-form]",
    fileSelector: "#progress-below-excel-file",
    csvSelector: "[data-progress-below-csv]",
    cacheName: "progressBelowRecordsCache",
    fieldPrefix: "progress-below-record",
    clearFormSelector: "[data-clear-progress-below-record-form]",
    clearAllSelector: "[data-clear-progress-below-records]",
    editDataKey: "editProgressBelowRecord",
    deleteDataKey: "deleteProgressBelowRecord",
    editAttr: "data-edit-progress-below-record",
    deleteAttr: "data-delete-progress-below-record",
    checkFormSelector: "[data-admin-progress-below-check-form]",
    checkInputSelector: "#admin-progress-below-check-id",
    resultPrefix: "admin-progress-below",
    showTotalVolume: false,
  },
};

async function loadProgressAdminRecords(config) {
  const recordsList = document.querySelector(config.listSelector);
  if (!recordsList) return;

  try {
    const records = await apiRequest(config.recordsPath);
    window[config.cacheName] = records;
    if (!records.length) {
      recordsList.innerHTML = `<tr><td colspan="${config.showTotalVolume ? 7 : 6}">No ${config.label} records saved yet.</td></tr>`;
      return;
    }

    recordsList.innerHTML = records.map((record) => `
      <tr>
        <td>${escapeHtml(record.idNumber)}<span class="timestamp">${escapeHtml(formatDate(record.updatedAt))}</span></td>
        <td>${escapeHtml(record.name || "-")}</td>
        <td>${escapeHtml(record.currentMonth || "-")}</td>
        <td>${escapeHtml(record.sponsorName || "-")}</td>
        <td>${escapeHtml(record.ppv || "-")}</td>
        ${config.showTotalVolume ? `<td>${escapeHtml(record.totalVolume || "-")}</td>` : ""}
        <td>
          <div class="table-actions">
            <button class="btn btn-soft" type="button" ${config.editAttr}="${escapeHtml(record.idNumber)}">Edit</button>
            <button class="btn" type="button" ${config.deleteAttr}="${escapeHtml(record.idNumber)}">Delete</button>
          </div>
        </td>
      </tr>
    `).join("");
  } catch {
    recordsList.innerHTML = `<tr><td colspan="${config.showTotalVolume ? 7 : 6}">Start the backend server to load ${config.label} records.</td></tr>`;
  }
}

function fillProgressAdminRecordForm(config, record) {
  const form = document.querySelector(config.formSelector);
  if (!form) return;
  form.querySelector(`#${config.fieldPrefix}-id`).value = record?.idNumber || "";
  form.querySelector(`#${config.fieldPrefix}-name`).value = record?.name || "";
  form.querySelector(`#${config.fieldPrefix}-current-month`).value = record?.currentMonth || "";
  form.querySelector(`#${config.fieldPrefix}-sponsor-name`).value = record?.sponsorName || "";
  form.querySelector(`#${config.fieldPrefix}-ppv`).value = record?.ppv || "";
  const totalVolumeInput = form.querySelector(`#${config.fieldPrefix}-total-volume`);
  if (totalVolumeInput) totalVolumeInput.value = record?.totalVolume || "";
  form.querySelector(".form-status").textContent = record ? `Editing ${config.label} ID ${record.idNumber}.` : "";
}

function setAdminProgressResult(config, record) {
  const fields = {
    [`[data-${config.resultPrefix}-id]`]: record?.idNumber || "--",
    [`[data-${config.resultPrefix}-name]`]: record?.name || (record ? "--" : "Not found"),
    [`[data-${config.resultPrefix}-current-month]`]: record?.currentMonth || "--",
    [`[data-${config.resultPrefix}-sponsor-name]`]: record?.sponsorName || "--",
    [`[data-${config.resultPrefix}-ppv]`]: record?.ppv || "--",
    [`[data-${config.resultPrefix}-total-volume]`]: record?.totalVolume || "--",
  };

  Object.entries(fields).forEach(([selector, value]) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  });
}

function setupProgressAdminDataset(config) {
  const form = document.querySelector(config.formSelector);
  const recordsList = document.querySelector(config.listSelector);
  const clearAllButton = document.querySelector(config.clearAllSelector);
  const checkForm = document.querySelector(config.checkFormSelector);

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = form.querySelector(".form-status");
      const id = form.querySelector(`#${config.fieldPrefix}-id`)?.value?.trim();
      const record = {
        name: form.querySelector(`#${config.fieldPrefix}-name`)?.value?.trim(),
        currentMonth: form.querySelector(`#${config.fieldPrefix}-current-month`)?.value?.trim(),
        sponsorName: form.querySelector(`#${config.fieldPrefix}-sponsor-name`)?.value?.trim(),
        ppv: form.querySelector(`#${config.fieldPrefix}-ppv`)?.value?.trim(),
        totalVolume: form.querySelector(`#${config.fieldPrefix}-total-volume`)?.value?.trim(),
      };

      if (!id) {
        if (status) status.textContent = "ID is required.";
        return;
      }

      if (status) status.textContent = `Saving ${config.label} ID...`;

      try {
        const payload = await apiRequest(`${config.recordsPath}/${encodeURIComponent(id)}`, {
          method: "PUT",
          body: JSON.stringify(record),
        });
        fillProgressAdminRecordForm(config, payload.record);
        if (status) status.textContent = `${config.label} ID ${payload.record.idNumber} saved.`;
        await loadProgressAdminRecords(config);
      } catch (error) {
        if (status) status.textContent = error.message || `Could not save this ${config.label} ID.`;
      }
    });

    form.querySelector(config.clearFormSelector)?.addEventListener("click", () => {
      form.reset();
      form.querySelector(".form-status").textContent = "";
    });
  }

  if (recordsList) {
    recordsList.addEventListener("click", async (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;

      const editId = target.dataset[config.editDataKey];
      const deleteId = target.dataset[config.deleteDataKey];

      if (editId) {
        const record = (window[config.cacheName] || []).find((item) => String(item.idNumber) === editId);
        fillProgressAdminRecordForm(config, record);
        document.querySelector(config.formSelector)?.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }

      if (deleteId) {
        if (!window.confirm(`Delete ${config.label} ID ${deleteId}?`)) return;
        target.textContent = "Deleting...";
        target.disabled = true;
        try {
          await apiRequest(`${config.recordsPath}/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
          await loadProgressAdminRecords(config);
        } catch {
          target.textContent = "Delete";
          target.disabled = false;
        }
      }
    });
  }

  if (clearAllButton) {
    clearAllButton.addEventListener("click", async () => {
      if (!window.confirm(`Delete all ${config.label} records? This cannot be undone unless the Excel sheets are imported again.`)) return;
      clearAllButton.textContent = "Deleting...";
      clearAllButton.disabled = true;

      try {
        await apiRequest(config.recordsPath, { method: "DELETE" });
        fillProgressAdminRecordForm(config, null);
        await loadProgressAdminRecords(config);
      } finally {
        clearAllButton.textContent = `Delete All ${config.label} Records`;
        clearAllButton.disabled = false;
      }
    });
  }

  if (checkForm) {
    checkForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const status = checkForm.querySelector(".form-status");
      const id = checkForm.querySelector(config.checkInputSelector)?.value?.trim();

      if (!id) return;
      if (status) status.textContent = `Checking ID from ${config.label} data...`;

      try {
        const record = await apiRequest(`${config.publicPath}/${encodeURIComponent(id)}`);
        setAdminProgressResult(config, record);
        if (status) status.textContent = `Matching ${config.label} ID found.`;
      } catch {
        setAdminProgressResult(config, null);
        if (status) status.textContent = `No record found for this ID. Upload or save the ${config.label} sheets first.`;
      }
    });
  }
}

const displayItemForm = document.querySelector("[data-display-item-form]");

if (displayItemForm) {
  displayItemForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = displayItemForm.querySelector(".form-status");
    const formData = new FormData(displayItemForm);
    const item = {
      title: formData.get("title"),
      category: formData.get("category"),
      message: formData.get("message"),
    };

    if (status) status.textContent = "Publishing...";

    try {
      await apiRequest("/api/display-items", {
        method: "POST",
        body: JSON.stringify(item),
      });
      if (status) status.textContent = "Item published.";
      displayItemForm.reset();
      await loadDisplayItems();
    } catch {
      if (status) status.textContent = "Start the backend server to publish this item.";
    }
  });
}

function fillSiteSettingsForm(settings) {
  const form = document.querySelector("[data-site-settings-form]");
  if (!form || !settings) return;
  form.querySelector("#settings-phone").value = settings.phone || "";
  form.querySelector("#settings-email").value = settings.email || "";
  form.querySelector("#settings-whatsapp").value = settings.whatsappUrl || "";
  form.querySelector("#settings-zoom").value = settings.zoomUrl || "";
  form.querySelector("#settings-instagram").value = settings.instagramUrl || "";
  form.querySelector("#settings-youtube").value = settings.youtubeUrl || "";
  form.querySelector("#settings-community-title").value = settings.communityTitle || "";
  form.querySelector("#settings-community-text").value = settings.communityText || "";
  form.querySelector("#settings-community-bullets").value = (settings.communityBullets || []).join("\n");
}

const siteSettingsForm = document.querySelector("[data-site-settings-form]");

if (siteSettingsForm) {
  siteSettingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = siteSettingsForm.querySelector(".form-status");
    const settings = {
      phone: siteSettingsForm.querySelector("#settings-phone")?.value?.trim(),
      email: siteSettingsForm.querySelector("#settings-email")?.value?.trim(),
      whatsappUrl: siteSettingsForm.querySelector("#settings-whatsapp")?.value?.trim(),
      zoomUrl: siteSettingsForm.querySelector("#settings-zoom")?.value?.trim(),
      instagramUrl: siteSettingsForm.querySelector("#settings-instagram")?.value?.trim(),
      youtubeUrl: siteSettingsForm.querySelector("#settings-youtube")?.value?.trim(),
      communityTitle: siteSettingsForm.querySelector("#settings-community-title")?.value?.trim(),
      communityText: siteSettingsForm.querySelector("#settings-community-text")?.value?.trim(),
      communityBullets: siteSettingsForm.querySelector("#settings-community-bullets")?.value?.trim(),
    };

    if (status) status.textContent = "Saving site settings...";

    try {
      const payload = await apiRequest("/api/site-settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      applySiteSettings(payload.settings);
      if (status) status.textContent = "Site settings saved.";
    } catch (error) {
      if (status) status.textContent = error.message || "Could not save site settings.";
    }
  });
}

function renderAdminSuccessStories(stories) {
  const target = document.querySelector("[data-admin-success-stories-list]");
  if (!target) return;

  window.successStoriesCache = stories;

  if (!stories.length) {
    target.innerHTML = '<tr><td colspan="4">No success stories saved yet.</td></tr>';
    return;
  }

  target.innerHTML = stories.map((story) => `
    <tr>
      <td>${escapeHtml(story.title)}<span class="timestamp">${escapeHtml(story.person)}${story.updatedAt ? ` | ${escapeHtml(formatDate(story.updatedAt))}` : ""}</span></td>
      <td>${escapeHtml(story.image || "-")}<span class="timestamp">Order ${escapeHtml(story.sortOrder || 100)}</span></td>
      <td>${story.active === false ? "Hidden" : "Visible"}</td>
      <td>
        <div class="table-actions">
          <button class="btn btn-soft" type="button" data-edit-success-story="${escapeHtml(story.id)}">Edit</button>
          <button class="btn btn-soft" type="button" data-delete-success-story="${escapeHtml(story.id)}">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

function fillSuccessStoryForm(story) {
  const form = document.querySelector("[data-success-story-form]");
  if (!form) return;

  form.querySelector("#success-story-id").value = story?.id || "";
  form.querySelector("#success-story-title").value = story?.title || "";
  form.querySelector("#success-story-person").value = story?.person || "";
  form.querySelector("#success-story-result").value = story?.result || "";
  form.querySelector("#success-story-image").value = story?.image || "";
  form.querySelector("#success-story-text").value = (story?.paragraphs?.length ? story.paragraphs : [story?.text || ""]).filter(Boolean).join("\n\n");
  form.querySelector("#success-story-sort-order").value = story?.sortOrder || 100;
  form.querySelector("#success-story-active").checked = story?.active !== false;
}

const successStoryForm = document.querySelector("[data-success-story-form]");

if (successStoryForm) {
  successStoryForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = successStoryForm.querySelector(".form-status");
    const existingId = successStoryForm.querySelector("#success-story-id")?.value?.trim();
    const story = {
      title: successStoryForm.querySelector("#success-story-title")?.value?.trim(),
      person: successStoryForm.querySelector("#success-story-person")?.value?.trim(),
      result: successStoryForm.querySelector("#success-story-result")?.value?.trim(),
      image: successStoryForm.querySelector("#success-story-image")?.value?.trim(),
      storyText: successStoryForm.querySelector("#success-story-text")?.value?.trim(),
      sortOrder: successStoryForm.querySelector("#success-story-sort-order")?.value?.trim(),
      active: successStoryForm.querySelector("#success-story-active")?.checked,
    };

    if (!story.title || !story.person || !story.image || !story.storyText) {
      if (status) status.textContent = "Title, name, image, and story text are required.";
      return;
    }

    if (status) status.textContent = "Saving success story...";

    try {
      const path = existingId ? `/api/success-stories/${encodeURIComponent(existingId)}` : "/api/success-stories";
      const method = existingId ? "PUT" : "POST";
      const payload = await apiRequest(path, {
        method,
        body: JSON.stringify(story),
      });
      fillSuccessStoryForm(payload.story);
      if (status) status.textContent = `${payload.story.title} saved.`;
      await loadSuccessStories();
    } catch (error) {
      if (status) status.textContent = error.message || "Could not save this success story.";
    }
  });

  successStoryForm.querySelector("[data-clear-success-story-form]")?.addEventListener("click", () => {
    fillSuccessStoryForm(null);
    successStoryForm.querySelector(".form-status").textContent = "";
  });
}

const adminSuccessStoriesList = document.querySelector("[data-admin-success-stories-list]");

if (adminSuccessStoriesList) {
  adminSuccessStoriesList.addEventListener("click", async (event) => {
    const editId = event.target?.dataset?.editSuccessStory;
    const deleteId = event.target?.dataset?.deleteSuccessStory;

    if (editId) {
      const story = (window.successStoriesCache || []).find((entry) => String(entry.id) === String(editId));
      fillSuccessStoryForm(story);
      document.querySelector("[data-success-story-form]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (deleteId) {
      const story = (window.successStoriesCache || []).find((entry) => String(entry.id) === String(deleteId));
      if (!window.confirm(`Delete ${story?.title || "this success story"}?`)) return;
      try {
        await apiRequest(`/api/success-stories/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
        fillSuccessStoryForm(null);
        await loadSuccessStories();
      } catch (error) {
        window.alert(error.message || "Could not delete this success story.");
      }
    }
  });
}

const qualificationMenuForm = document.querySelector("[data-qualification-menu-form]");

if (qualificationMenuForm) {
  qualificationMenuForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = qualificationMenuForm.querySelector(".form-status");
    const existingId = qualificationMenuForm.querySelector("#qualification-menu-id")?.value?.trim();
    const item = {
      title: qualificationMenuForm.querySelector("#qualification-menu-title")?.value?.trim(),
      description: qualificationMenuForm.querySelector("#qualification-menu-description")?.value?.trim(),
      href: qualificationMenuForm.querySelector("#qualification-menu-href")?.value?.trim(),
      image: qualificationMenuForm.querySelector("#qualification-menu-image")?.value?.trim(),
      criteria: qualificationMenuForm.querySelector("#qualification-menu-criteria")?.value?.trim(),
      sortOrder: qualificationMenuForm.querySelector("#qualification-menu-sort-order")?.value?.trim(),
      active: qualificationMenuForm.querySelector("#qualification-menu-active")?.checked,
    };

    if (!item.title || !item.href) {
      if (status) status.textContent = "Qualification name and page link are required.";
      return;
    }

    if (status) status.textContent = "Saving qualification menu...";

    try {
      const path = existingId ? `/api/qualification-menu/${encodeURIComponent(existingId)}` : "/api/qualification-menu";
      const method = existingId ? "PUT" : "POST";
      const payload = await apiRequest(path, {
        method,
        body: JSON.stringify(item),
      });
      fillQualificationMenuForm(payload.item);
      if (status) status.textContent = `${payload.item.title} saved.`;
      await loadQualificationMenu();
    } catch (error) {
      if (status) status.textContent = error.message || "Could not save this qualification menu item.";
    }
  });

  qualificationMenuForm.querySelector("[data-clear-qualification-menu-form]")?.addEventListener("click", () => {
    qualificationMenuForm.reset();
    qualificationMenuForm.querySelector("#qualification-menu-id").value = "";
    qualificationMenuForm.querySelector("#qualification-menu-active").checked = true;
    qualificationMenuForm.querySelector("#qualification-menu-sort-order").value = "100";
    qualificationMenuForm.querySelector(".form-status").textContent = "";
  });
}

const adminQualificationMenuList = document.querySelector("[data-admin-qualification-menu-list]");

if (adminQualificationMenuList) {
  adminQualificationMenuList.addEventListener("click", async (event) => {
    const editId = event.target?.dataset?.editQualificationMenu;
    const deleteId = event.target?.dataset?.deleteQualificationMenu;

    if (editId) {
      const item = (window.qualificationMenuCache || []).find((entry) => String(entry.id) === String(editId));
      fillQualificationMenuForm(item);
      document.querySelector("[data-qualification-menu-form]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (deleteId) {
      const item = (window.qualificationMenuCache || []).find((entry) => String(entry.id) === String(deleteId));
      const label = item?.title || "this qualification";
      if (!window.confirm(`Delete ${label} from the qualification menu?`)) return;

      try {
        await apiRequest(`/api/qualification-menu/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
        fillQualificationMenuForm(null);
        await loadQualificationMenu();
      } catch (error) {
        window.alert(error.message || "Could not delete this qualification.");
      }
    }
  });
}

const qualificationCriteriaForm = document.querySelector("[data-qualification-criteria-form]");

if (qualificationCriteriaForm) {
  const criteriaSelect = qualificationCriteriaForm.querySelector("#qualification-criteria-id");

  criteriaSelect?.addEventListener("change", () => {
    const criterion = (window.qualificationCriteriaCache || []).find((item) => item.id === criteriaSelect.value);
    fillQualificationCriteriaForm(criterion);
  });

  qualificationCriteriaForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = qualificationCriteriaForm.querySelector(".form-status");
    const id = qualificationCriteriaForm.querySelector("#qualification-criteria-id")?.value?.trim();
    const slabs = parseSlabText(qualificationCriteriaForm.querySelector("#qualification-criteria-slabs")?.value || "");

    if (!id) {
      if (status) status.textContent = "Select a calculation to edit.";
      return;
    }

    if (!slabs.length) {
      if (status) status.textContent = "Add at least one slab, for example: 3000 = 1 Ticket Qualified.";
      return;
    }

    const criterion = {
      title: qualificationCriteriaForm.querySelector("#qualification-criteria-title")?.value?.trim(),
      metric: qualificationCriteriaForm.querySelector("#qualification-criteria-metric")?.value,
      metricLabel: qualificationCriteriaForm.querySelector("#qualification-criteria-metric-label")?.value?.trim(),
      notQualifiedResult: qualificationCriteriaForm.querySelector("#qualification-criteria-not-qualified")?.value?.trim(),
      slabs,
    };

    if (!criterion.title) {
      if (status) status.textContent = "Criteria name is required.";
      return;
    }

    if (status) status.textContent = "Saving calculation criteria...";

    try {
      const payload = await apiRequest(`/api/qualification-criteria/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(criterion),
      });
      renderQualificationCriteriaOptions(payload.criteria);
      renderAdminQualificationCriteria(payload.criteria);
      fillQualificationCriteriaForm(payload.criterion);
      if (status) status.textContent = `${payload.criterion.title} criteria saved. Search results will now use these slabs.`;
      await Promise.all([
        loadQualificationRecords(),
        loadBelowSupervisorRecords(),
        loadGiftRecords(),
        loadGoaRecords(),
      ]);
    } catch (error) {
      if (status) status.textContent = error.message || "Could not save calculation criteria.";
    }
  });
}

const adminQualificationCriteriaList = document.querySelector("[data-admin-qualification-criteria-list]");

if (adminQualificationCriteriaList) {
  adminQualificationCriteriaList.addEventListener("click", (event) => {
    const editId = event.target?.dataset?.editQualificationCriteria;
    if (!editId) return;

    const criterion = (window.qualificationCriteriaCache || []).find((item) => String(item.id) === String(editId));
    fillQualificationCriteriaForm(criterion);
    document.querySelector("[data-qualification-criteria-form]")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

const adminQualificationCheckForm = document.querySelector("[data-admin-qualification-check-form]");

function setAdminQualificationResult(record) {
  const fields = {
    "[data-admin-result-id]": record?.idNumber || "--",
    "[data-admin-result-name]": record?.name || (record ? "--" : "Not found"),
    "[data-admin-result-ppv]": record?.ppv || "--",
    "[data-admin-result-total-volume]": record?.totalVolume || "--",
    "[data-admin-result-volume-required]": record?.volumeRequired || (record ? "--" : "Not available"),
    "[data-admin-result-result]": record?.result || (record ? "--" : "No result found for this ID"),
  };

  Object.entries(fields).forEach(([selector, value]) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  });
}

if (adminQualificationCheckForm) {
  adminQualificationCheckForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = adminQualificationCheckForm.querySelector(".form-status");
    const id = adminQualificationCheckForm.querySelector("#admin-check-id")?.value?.trim();

    if (!id) return;
    if (status) status.textContent = "Checking ID from saved Excel data...";

    try {
      const record = await apiRequest(`/api/qualification/${encodeURIComponent(id)}`);
      setAdminQualificationResult(record);
      if (status) status.textContent = "Matching ID found.";
    } catch {
      setAdminQualificationResult(null);
      if (status) status.textContent = "No record found for this ID. Upload or save the Excel sheet first.";
    }
  });
}

const adminBelowCheckForm = document.querySelector("[data-admin-below-check-form]");

function setAdminBelowResult(record) {
  const fields = {
    "[data-admin-below-id]": record?.idNumber || "--",
    "[data-admin-below-name]": record?.name || (record ? "--" : "Not found"),
    "[data-admin-below-ppv]": record?.ppv || "--",
    "[data-admin-below-total-volume]": record?.totalVolume || "--",
    "[data-admin-below-volume-required]": record?.volumeRequired || (record ? "--" : "Not available"),
    "[data-admin-below-result]": record?.result || (record ? "--" : "No result found for this ID"),
  };

  Object.entries(fields).forEach(([selector, value]) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  });
}

if (adminBelowCheckForm) {
  adminBelowCheckForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = adminBelowCheckForm.querySelector(".form-status");
    const id = adminBelowCheckForm.querySelector("#admin-below-check-id")?.value?.trim();

    if (!id) return;
    if (status) status.textContent = "Checking ID from below-supervisor data...";

    try {
      const record = await apiRequest(`/api/below-supervisor/${encodeURIComponent(id)}`);
      setAdminBelowResult(record);
      if (status) status.textContent = "Matching below-supervisor ID found.";
    } catch {
      setAdminBelowResult(null);
      if (status) status.textContent = "No record found for this ID. Upload or save the below-supervisor Excel sheet first.";
    }
  });
}

const adminGiftCheckForm = document.querySelector("[data-admin-gift-check-form]");

function setAdminGiftResult(record) {
  const fields = {
    "[data-admin-gift-id]": record?.idNumber || "--",
    "[data-admin-gift-name]": record?.name || (record ? "--" : "Not found"),
    "[data-admin-gift-ppv]": record?.ppv || "--",
    "[data-admin-gift-total-volume]": record?.totalVolume || "--",
    "[data-admin-gift-volume-required]": record?.volumeRequired || (record ? "--" : "Not available"),
    "[data-admin-gift-result]": record?.result || (record ? "--" : "No result found for this ID"),
  };

  Object.entries(fields).forEach(([selector, value]) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  });
}

if (adminGiftCheckForm) {
  adminGiftCheckForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = adminGiftCheckForm.querySelector(".form-status");
    const id = adminGiftCheckForm.querySelector("#admin-gift-check-id")?.value?.trim();

    if (!id) return;
    if (status) status.textContent = "Checking ID from Gifts data...";

    try {
      const record = await apiRequest(`/api/gifts/${encodeURIComponent(id)}`);
      setAdminGiftResult(record);
      if (status) status.textContent = "Matching Gifts ID found.";
    } catch {
      setAdminGiftResult(null);
      if (status) status.textContent = "No record found for this ID. Upload or save the Gifts Excel sheet first.";
    }
  });
}

const adminGoaCheckForm = document.querySelector("[data-admin-goa-check-form]");

function setAdminGoaResult(record) {
  const fields = {
    "[data-admin-goa-id]": record?.idNumber || "--",
    "[data-admin-goa-name]": record?.name || (record ? "--" : "Not found"),
    "[data-admin-goa-ppv]": record?.ppv || "--",
    "[data-admin-goa-total-volume]": record?.totalVolume || "--",
    "[data-admin-goa-volume-required]": record?.volumeRequired || (record ? "--" : "Not available"),
    "[data-admin-goa-result]": record?.result || (record ? "--" : "No result found for this ID"),
  };

  Object.entries(fields).forEach(([selector, value]) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = value;
  });
}

if (adminGoaCheckForm) {
  adminGoaCheckForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = adminGoaCheckForm.querySelector(".form-status");
    const id = adminGoaCheckForm.querySelector("#admin-goa-check-id")?.value?.trim();

    if (!id) return;
    if (status) status.textContent = "Checking ID from Goa data...";

    try {
      const record = await apiRequest(`/api/goa/${encodeURIComponent(id)}`);
      setAdminGoaResult(record);
      if (status) status.textContent = "Matching Goa ID found.";
    } catch {
      setAdminGoaResult(null);
      if (status) status.textContent = "No record found for this ID. Upload or save the Goa Excel sheet first.";
    }
  });
}

const qualificationRecordForm = document.querySelector("[data-qualification-record-form]");

if (qualificationRecordForm) {
  qualificationRecordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = qualificationRecordForm.querySelector(".form-status");
    const id = qualificationRecordForm.querySelector("#record-id")?.value?.trim();
    const record = {
      name: qualificationRecordForm.querySelector("#record-name")?.value?.trim(),
      ppv: qualificationRecordForm.querySelector("#record-ppv")?.value?.trim(),
      totalVolume: qualificationRecordForm.querySelector("#record-total-volume")?.value?.trim(),
    };

    if (!id) {
      if (status) status.textContent = "ID is required.";
      return;
    }

    if (status) status.textContent = "Saving ID...";

    try {
      const payload = await apiRequest(`/api/qualification-records/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(record),
      });
      fillQualificationRecordForm(payload.record);
      if (status) status.textContent = `ID ${payload.record.idNumber} saved.`;
      await loadQualificationRecords();
    } catch (error) {
      if (status) status.textContent = error.message || "Could not save this ID.";
    }
  });

  qualificationRecordForm.querySelector("[data-clear-record-form]")?.addEventListener("click", () => {
    qualificationRecordForm.reset();
    qualificationRecordForm.querySelector(".form-status").textContent = "";
  });
}

const qualificationRecordsList = document.querySelector("[data-qualification-records-list]");

if (qualificationRecordsList) {
  qualificationRecordsList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const editId = target.dataset.editQualificationRecord;
    const deleteId = target.dataset.deleteQualificationRecord;

    if (editId) {
      const record = (window.qualificationRecordsCache || []).find((item) => String(item.idNumber) === editId);
      fillQualificationRecordForm(record);
      document.querySelector("[data-qualification-record-form]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (deleteId) {
      if (!window.confirm(`Delete ID ${deleteId}?`)) return;
      target.textContent = "Deleting...";
      target.disabled = true;
      try {
        await apiRequest(`/api/qualification-records/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
        await loadQualificationRecords();
      } catch {
        target.textContent = "Delete";
        target.disabled = false;
      }
    }
  });
}

const clearQualificationRecordsButton = document.querySelector("[data-clear-qualification-records]");

if (clearQualificationRecordsButton) {
  clearQualificationRecordsButton.addEventListener("click", async () => {
    if (!window.confirm("Delete all qualification records? This cannot be undone unless the Excel sheet is imported again.")) return;
    clearQualificationRecordsButton.textContent = "Deleting...";
    clearQualificationRecordsButton.disabled = true;

    try {
      await apiRequest("/api/qualification-records", { method: "DELETE" });
      fillQualificationRecordForm(null);
      await loadQualificationRecords();
    } finally {
      clearQualificationRecordsButton.textContent = "Delete All Records";
      clearQualificationRecordsButton.disabled = false;
    }
  });
}

const belowRecordForm = document.querySelector("[data-below-record-form]");

if (belowRecordForm) {
  belowRecordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = belowRecordForm.querySelector(".form-status");
    const id = belowRecordForm.querySelector("#below-record-id")?.value?.trim();
    const record = {
      name: belowRecordForm.querySelector("#below-record-name")?.value?.trim(),
      ppv: belowRecordForm.querySelector("#below-record-ppv")?.value?.trim(),
      totalVolume: belowRecordForm.querySelector("#below-record-total-volume")?.value?.trim(),
    };

    if (!id) {
      if (status) status.textContent = "ID is required.";
      return;
    }

    if (status) status.textContent = "Saving below-supervisor ID...";

    try {
      const payload = await apiRequest(`/api/below-supervisor-records/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(record),
      });
      fillBelowSupervisorRecordForm(payload.record);
      if (status) status.textContent = `Below-supervisor ID ${payload.record.idNumber} saved.`;
      await loadBelowSupervisorRecords();
    } catch (error) {
      if (status) status.textContent = error.message || "Could not save this below-supervisor ID.";
    }
  });

  belowRecordForm.querySelector("[data-clear-below-record-form]")?.addEventListener("click", () => {
    belowRecordForm.reset();
    belowRecordForm.querySelector(".form-status").textContent = "";
  });
}

const belowRecordsList = document.querySelector("[data-below-records-list]");

if (belowRecordsList) {
  belowRecordsList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const editId = target.dataset.editBelowRecord;
    const deleteId = target.dataset.deleteBelowRecord;

    if (editId) {
      const record = (window.belowSupervisorRecordsCache || []).find((item) => String(item.idNumber) === editId);
      fillBelowSupervisorRecordForm(record);
      document.querySelector("[data-below-record-form]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (deleteId) {
      if (!window.confirm(`Delete below-supervisor ID ${deleteId}?`)) return;
      target.textContent = "Deleting...";
      target.disabled = true;
      try {
        await apiRequest(`/api/below-supervisor-records/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
        await loadBelowSupervisorRecords();
      } catch {
        target.textContent = "Delete";
        target.disabled = false;
      }
    }
  });
}

const clearBelowRecordsButton = document.querySelector("[data-clear-below-records]");

if (clearBelowRecordsButton) {
  clearBelowRecordsButton.addEventListener("click", async () => {
    if (!window.confirm("Delete all below-supervisor records? This cannot be undone unless the Excel sheet is imported again.")) return;
    clearBelowRecordsButton.textContent = "Deleting...";
    clearBelowRecordsButton.disabled = true;

    try {
      await apiRequest("/api/below-supervisor-records", { method: "DELETE" });
      fillBelowSupervisorRecordForm(null);
      await loadBelowSupervisorRecords();
    } finally {
      clearBelowRecordsButton.textContent = "Delete All Below Supervisor Records";
      clearBelowRecordsButton.disabled = false;
    }
  });
}

const giftRecordForm = document.querySelector("[data-gift-record-form]");

if (giftRecordForm) {
  giftRecordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = giftRecordForm.querySelector(".form-status");
    const id = giftRecordForm.querySelector("#gift-record-id")?.value?.trim();
    const record = {
      name: giftRecordForm.querySelector("#gift-record-name")?.value?.trim(),
      ppv: giftRecordForm.querySelector("#gift-record-ppv")?.value?.trim(),
      totalVolume: giftRecordForm.querySelector("#gift-record-total-volume")?.value?.trim(),
    };

    if (!id) {
      if (status) status.textContent = "ID is required.";
      return;
    }

    if (status) status.textContent = "Saving Gift ID...";

    try {
      const payload = await apiRequest(`/api/gift-records/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(record),
      });
      fillGiftRecordForm(payload.record);
      if (status) status.textContent = `Gift ID ${payload.record.idNumber} saved.`;
      await loadGiftRecords();
    } catch (error) {
      if (status) status.textContent = error.message || "Could not save this Gift ID.";
    }
  });

  giftRecordForm.querySelector("[data-clear-gift-record-form]")?.addEventListener("click", () => {
    giftRecordForm.reset();
    giftRecordForm.querySelector(".form-status").textContent = "";
  });
}

const giftRecordsList = document.querySelector("[data-gift-records-list]");

if (giftRecordsList) {
  giftRecordsList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const editId = target.dataset.editGiftRecord;
    const deleteId = target.dataset.deleteGiftRecord;

    if (editId) {
      const record = (window.giftRecordsCache || []).find((item) => String(item.idNumber) === editId);
      fillGiftRecordForm(record);
      document.querySelector("[data-gift-record-form]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (deleteId) {
      if (!window.confirm(`Delete Gift ID ${deleteId}?`)) return;
      target.textContent = "Deleting...";
      target.disabled = true;
      try {
        await apiRequest(`/api/gift-records/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
        await loadGiftRecords();
      } catch {
        target.textContent = "Delete";
        target.disabled = false;
      }
    }
  });
}

const clearGiftRecordsButton = document.querySelector("[data-clear-gift-records]");

if (clearGiftRecordsButton) {
  clearGiftRecordsButton.addEventListener("click", async () => {
    if (!window.confirm("Delete all Gift records? This cannot be undone unless the Excel sheet is imported again.")) return;
    clearGiftRecordsButton.textContent = "Deleting...";
    clearGiftRecordsButton.disabled = true;

    try {
      await apiRequest("/api/gift-records", { method: "DELETE" });
      fillGiftRecordForm(null);
      await loadGiftRecords();
    } finally {
      clearGiftRecordsButton.textContent = "Delete All Gift Records";
      clearGiftRecordsButton.disabled = false;
    }
  });
}

const goaRecordForm = document.querySelector("[data-goa-record-form]");

if (goaRecordForm) {
  goaRecordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = goaRecordForm.querySelector(".form-status");
    const id = goaRecordForm.querySelector("#goa-record-id")?.value?.trim();
    const record = {
      name: goaRecordForm.querySelector("#goa-record-name")?.value?.trim(),
      ppv: goaRecordForm.querySelector("#goa-record-ppv")?.value?.trim(),
      totalVolume: goaRecordForm.querySelector("#goa-record-total-volume")?.value?.trim(),
    };

    if (!id) {
      if (status) status.textContent = "ID is required.";
      return;
    }

    if (status) status.textContent = "Saving Goa ID...";

    try {
      const payload = await apiRequest(`/api/goa-records/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(record),
      });
      fillGoaRecordForm(payload.record);
      if (status) status.textContent = `Goa ID ${payload.record.idNumber} saved.`;
      await loadGoaRecords();
    } catch (error) {
      if (status) status.textContent = error.message || "Could not save this Goa ID.";
    }
  });

  goaRecordForm.querySelector("[data-clear-goa-record-form]")?.addEventListener("click", () => {
    goaRecordForm.reset();
    goaRecordForm.querySelector(".form-status").textContent = "";
  });
}

const goaRecordsList = document.querySelector("[data-goa-records-list]");

if (goaRecordsList) {
  goaRecordsList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const editId = target.dataset.editGoaRecord;
    const deleteId = target.dataset.deleteGoaRecord;

    if (editId) {
      const record = (window.goaRecordsCache || []).find((item) => String(item.idNumber) === editId);
      fillGoaRecordForm(record);
      document.querySelector("[data-goa-record-form]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (deleteId) {
      if (!window.confirm(`Delete Goa ID ${deleteId}?`)) return;
      target.textContent = "Deleting...";
      target.disabled = true;
      try {
        await apiRequest(`/api/goa-records/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
        await loadGoaRecords();
      } catch {
        target.textContent = "Delete";
        target.disabled = false;
      }
    }
  });
}

const clearGoaRecordsButton = document.querySelector("[data-clear-goa-records]");

if (clearGoaRecordsButton) {
  clearGoaRecordsButton.addEventListener("click", async () => {
    if (!window.confirm("Delete all Goa records? This cannot be undone unless the Excel sheet is imported again.")) return;
    clearGoaRecordsButton.textContent = "Deleting...";
    clearGoaRecordsButton.disabled = true;

    try {
      await apiRequest("/api/goa-records", { method: "DELETE" });
      fillGoaRecordForm(null);
      await loadGoaRecords();
    } finally {
      clearGoaRecordsButton.textContent = "Delete All Goa Records";
      clearGoaRecordsButton.disabled = false;
    }
  });
}

const juneSpecialOfferRecordForm = document.querySelector("[data-june-special-offer-record-form]");

if (juneSpecialOfferRecordForm) {
  juneSpecialOfferRecordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = juneSpecialOfferRecordForm.querySelector(".form-status");
    const id = juneSpecialOfferRecordForm.querySelector("#june-special-offer-record-id")?.value?.trim();
    const record = {
      name: juneSpecialOfferRecordForm.querySelector("#june-special-offer-record-name")?.value?.trim(),
      ppv: juneSpecialOfferRecordForm.querySelector("#june-special-offer-record-ppv")?.value?.trim(),
      totalVolume: juneSpecialOfferRecordForm.querySelector("#june-special-offer-record-total-volume")?.value?.trim(),
    };

    if (!id) {
      if (status) status.textContent = "ID is required.";
      return;
    }

    if (status) status.textContent = "Saving June Offer ID...";

    try {
      const payload = await apiRequest(`/api/june-special-offer-records/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify(record),
      });
      fillJuneSpecialOfferRecordForm(payload.record);
      if (status) status.textContent = `June Offer ID ${payload.record.idNumber} saved.`;
      await loadJuneSpecialOfferRecords();
    } catch (error) {
      if (status) status.textContent = error.message || "Could not save this June Offer ID.";
    }
  });

  juneSpecialOfferRecordForm.querySelector("[data-clear-june-special-offer-record-form]")?.addEventListener("click", () => {
    juneSpecialOfferRecordForm.reset();
    juneSpecialOfferRecordForm.querySelector(".form-status").textContent = "";
  });
}

const juneSpecialOfferRecordsList = document.querySelector("[data-june-special-offer-records-list]");

if (juneSpecialOfferRecordsList) {
  juneSpecialOfferRecordsList.addEventListener("click", async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) return;

    const editId = target.dataset.editJuneSpecialOfferRecord;
    const deleteId = target.dataset.deleteJuneSpecialOfferRecord;

    if (editId) {
      const record = (window.juneSpecialOfferRecordsCache || []).find((item) => String(item.idNumber) === editId);
      fillJuneSpecialOfferRecordForm(record);
      document.querySelector("[data-june-special-offer-record-form]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (deleteId) {
      if (!window.confirm(`Delete June Offer ID ${deleteId}?`)) return;
      target.textContent = "Deleting...";
      target.disabled = true;
      try {
        await apiRequest(`/api/june-special-offer-records/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
        await loadJuneSpecialOfferRecords();
      } catch {
        target.textContent = "Delete";
        target.disabled = false;
      }
    }
  });
}

const clearJuneSpecialOfferRecordsButton = document.querySelector("[data-clear-june-special-offer-records]");

if (clearJuneSpecialOfferRecordsButton) {
  clearJuneSpecialOfferRecordsButton.addEventListener("click", async () => {
    if (!window.confirm("Delete all June Offer records? This cannot be undone unless the Excel sheet is imported again.")) return;
    clearJuneSpecialOfferRecordsButton.textContent = "Deleting...";
    clearJuneSpecialOfferRecordsButton.disabled = true;

    try {
      await apiRequest("/api/june-special-offer-records", { method: "DELETE" });
      fillJuneSpecialOfferRecordForm(null);
      await loadJuneSpecialOfferRecords();
    } finally {
      clearJuneSpecialOfferRecordsButton.textContent = "Delete All June Offer Records";
      clearJuneSpecialOfferRecordsButton.disabled = false;
    }
  });
}

const qualificationImportForm = document.querySelector("[data-qualification-import-form]");

if (qualificationImportForm) {
  const fileInput = qualificationImportForm.querySelector("#qualification-excel-file");
  const csvTextarea = qualificationImportForm.querySelector("[data-qualification-csv]");

  fileInput?.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    const status = qualificationImportForm.querySelector(".form-status");
    if (file && status) {
      status.textContent = `${file.name} selected. Click Save Qualification Excel Sheet to import it.`;
    }
  });

  qualificationImportForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = qualificationImportForm.querySelector(".form-status");
    const file = fileInput?.files?.[0];

    if (file) {
      if (!file.name.toLowerCase().endsWith(".xlsx")) {
        if (status) status.textContent = "Please upload an Excel .xlsx file.";
        return;
      }

      if (status) status.textContent = "Uploading Excel sheet...";

      try {
        const response = await fetch(`${apiBase}/api/qualification-records/excel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "X-File-Name": file.name,
            Authorization: `Bearer ${adminToken}`,
          },
          body: await file.arrayBuffer(),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Excel upload failed.");
        if (status) status.textContent = `${payload.count} Excel records saved.`;
        qualificationImportForm.reset();
        await loadQualificationRecords();
      } catch (error) {
        if (status) status.textContent = error.message || "Start the backend server to upload Excel.";
      }
      return;
    }

    const records = csvToQualificationRecords(csvTextarea?.value || "");

    if (!records.length) {
      if (status) status.textContent = "Upload an Excel .xlsx file or paste CSV data with an ID column.";
      return;
    }

    if (status) status.textContent = "Saving pasted CSV data...";

    try {
      const payload = await apiRequest("/api/qualification-records", {
        method: "POST",
        body: JSON.stringify({ records }),
      });
      if (status) status.textContent = `${payload.count} qualification records saved.`;
      await loadQualificationRecords();
    } catch (error) {
      if (status) status.textContent = error.message || "Start the backend server to save records.";
    }
  });
}

const belowImportForm = document.querySelector("[data-below-import-form]");

if (belowImportForm) {
  const fileInput = belowImportForm.querySelector("#below-excel-file");
  const csvTextarea = belowImportForm.querySelector("[data-below-csv]");

  fileInput?.addEventListener("change", () => {
    const files = Array.from(fileInput.files || []);
    const status = belowImportForm.querySelector(".form-status");
    if (files.length && status) {
      status.textContent = `${files.length} Excel sheet${files.length === 1 ? "" : "s"} selected. Click Merge Below Supervisor Sheets to import them.`;
    }
  });

  belowImportForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = belowImportForm.querySelector(".form-status");
    const files = Array.from(fileInput?.files || []);

    if (files.length) {
      const invalidFile = files.find((file) => !file.name.toLowerCase().endsWith(".xlsx"));
      if (invalidFile) {
        if (status) status.textContent = "Please upload an Excel .xlsx file.";
        return;
      }

      if (status) status.textContent = `Merging ${files.length} below-supervisor Excel sheet${files.length === 1 ? "" : "s"}...`;

      try {
        let totalImported = 0;
        let finalCount = 0;

        for (const file of files) {
          const response = await fetch(`${apiBase}/api/below-supervisor-records/excel`, {
            method: "POST",
            headers: {
              "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "X-File-Name": file.name,
              "X-Merge": "true",
              Authorization: `Bearer ${adminToken}`,
            },
            body: await file.arrayBuffer(),
          });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error || `Excel upload failed for ${file.name}.`);
          totalImported += payload.importedCount || 0;
          finalCount = payload.count || finalCount;
        }

        if (status) status.textContent = `${totalImported} rows imported and merged into ${finalCount} below-supervisor records.`;
        belowImportForm.reset();
        await loadBelowSupervisorRecords();
      } catch (error) {
        if (status) status.textContent = error.message || "Start the backend server to upload Excel.";
      }
      return;
    }

    const records = csvToQualificationRecords(csvTextarea?.value || "");

    if (!records.length) {
      if (status) status.textContent = "Upload an Excel .xlsx file or paste CSV data with an ID column.";
      return;
    }

    if (status) status.textContent = "Saving pasted below-supervisor CSV data...";

    try {
      const payload = await apiRequest("/api/below-supervisor-records", {
        method: "POST",
        body: JSON.stringify({ records, merge: true }),
      });
      if (status) status.textContent = `${payload.importedCount || records.length} rows merged into ${payload.count} below-supervisor records.`;
      await loadBelowSupervisorRecords();
    } catch (error) {
      if (status) status.textContent = error.message || "Start the backend server to save records.";
    }
  });
}

function setupSingleSheetImport({ formSelector, fileSelector, csvSelector, uploadPath, recordsPath, loadRecords, label }) {
  const form = document.querySelector(formSelector);
  if (!form) return;

  const fileInput = form.querySelector(fileSelector);
  const csvTextarea = form.querySelector(csvSelector);

  fileInput?.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    const status = form.querySelector(".form-status");
    if (file && status) {
      status.textContent = `${file.name} selected. Click Save ${label} Excel Sheet to import it.`;
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = form.querySelector(".form-status");
    const file = fileInput?.files?.[0];

    if (file) {
      if (!file.name.toLowerCase().endsWith(".xlsx")) {
        if (status) status.textContent = "Please upload an Excel .xlsx file.";
        return;
      }

      if (status) status.textContent = `Uploading ${label} Excel sheet...`;

      try {
        const response = await fetch(`${apiBase}${uploadPath}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "X-File-Name": file.name,
            Authorization: `Bearer ${adminToken}`,
          },
          body: await file.arrayBuffer(),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Excel upload failed.");
        if (status) status.textContent = `${payload.count} ${label} records saved.`;
        form.reset();
        await loadRecords();
      } catch (error) {
        if (status) status.textContent = error.message || `Start the backend server to upload ${label} Excel.`;
      }
      return;
    }

    const records = csvToQualificationRecords(csvTextarea?.value || "");

    if (!records.length) {
      if (status) status.textContent = "Upload an Excel .xlsx file or paste CSV data with an ID column.";
      return;
    }

    if (status) status.textContent = `Saving pasted ${label} CSV data...`;

    try {
      const payload = await apiRequest(recordsPath, {
        method: "POST",
        body: JSON.stringify({ records }),
      });
      if (status) status.textContent = `${payload.count} ${label} records saved.`;
      await loadRecords();
    } catch (error) {
      if (status) status.textContent = error.message || `Start the backend server to save ${label} records.`;
    }
  });
}

setupSingleSheetImport({
  formSelector: "[data-gift-import-form]",
  fileSelector: "#gift-excel-file",
  csvSelector: "[data-gift-csv]",
  uploadPath: "/api/gift-records/excel",
  recordsPath: "/api/gift-records",
  loadRecords: loadGiftRecords,
  label: "Gift",
});

setupSingleSheetImport({
  formSelector: "[data-goa-import-form]",
  fileSelector: "#goa-excel-file",
  csvSelector: "[data-goa-csv]",
  uploadPath: "/api/goa-records/excel",
  recordsPath: "/api/goa-records",
  loadRecords: loadGoaRecords,
  label: "Goa",
});

setupSingleSheetImport({
  formSelector: "[data-june-special-offer-import-form]",
  fileSelector: "#june-special-offer-excel-file",
  csvSelector: "[data-june-special-offer-csv]",
  uploadPath: "/api/june-special-offer-records/excel",
  recordsPath: "/api/june-special-offer-records",
  loadRecords: loadJuneSpecialOfferRecords,
  label: "June Offer",
});

function setupMultiSheetProgressImport(config) {
  const form = document.querySelector(config.importFormSelector);
  if (!form) return;

  const fileInput = form.querySelector(config.fileSelector);
  const csvTextarea = form.querySelector(config.csvSelector);

  fileInput?.addEventListener("change", () => {
    const files = Array.from(fileInput.files || []);
    const status = form.querySelector(".form-status");
    if (files.length && status) {
      status.textContent = `${files.length} Excel sheet${files.length === 1 ? "" : "s"} selected. Click Merge to import them.`;
    }
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const status = form.querySelector(".form-status");
    const files = Array.from(fileInput?.files || []);

    if (files.length) {
      const invalidFile = files.find((file) => !file.name.toLowerCase().endsWith(".xlsx"));
      if (invalidFile) {
        if (status) status.textContent = "Please upload Excel .xlsx files only.";
        return;
      }

      if (status) status.textContent = `Merging ${files.length} ${config.label} sheet${files.length === 1 ? "" : "s"}...`;

      try {
        let totalImported = 0;
        let finalCount = 0;

        for (const file of files) {
          const response = await fetch(`${apiBase}${config.recordsPath}/excel`, {
            method: "POST",
            headers: {
              "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
              "X-File-Name": file.name,
              "X-Merge": "true",
              Authorization: `Bearer ${adminToken}`,
            },
            body: await file.arrayBuffer(),
          });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error || `Excel upload failed for ${file.name}.`);
          totalImported += payload.importedCount || 0;
          finalCount = payload.count || finalCount;
        }

        if (status) status.textContent = `${totalImported} rows imported and merged into ${finalCount} ${config.label} records.`;
        form.reset();
        await loadProgressAdminRecords(config);
      } catch (error) {
        if (status) status.textContent = error.message || `Start the backend server to upload ${config.label} sheets.`;
      }
      return;
    }

    const records = csvToQualificationRecords(csvTextarea?.value || "");

    if (!records.length) {
      if (status) status.textContent = "Upload Excel .xlsx files or paste CSV data with an ID column.";
      return;
    }

    if (status) status.textContent = `Saving pasted ${config.label} CSV data...`;

    try {
      const payload = await apiRequest(config.recordsPath, {
        method: "POST",
        body: JSON.stringify({ records, merge: true }),
      });
      if (status) status.textContent = `${payload.importedCount || records.length} rows merged into ${payload.count} ${config.label} records.`;
      await loadProgressAdminRecords(config);
    } catch (error) {
      if (status) status.textContent = error.message || `Start the backend server to save ${config.label} records.`;
    }
  });
}

Object.values(progressAdminConfigs).forEach((config) => {
  setupProgressAdminDataset(config);
  setupMultiSheetProgressImport(config);
});

loadContacts();
loadSiteSettings();
loadSuccessStories();
loadDisplayItems();
loadQualificationMenu();
loadQualificationCriteria();
loadQualificationRecords();
loadBelowSupervisorRecords();
loadGiftRecords();
loadGoaRecords();
loadJuneSpecialOfferRecords();
Object.values(progressAdminConfigs).forEach(loadProgressAdminRecords);
