const LABELS = {
  events: "Events",
  portraits: "Portraits / Docu",
  brand: "Brand",
  mariage: "Mariage"
};

const ORDER = ["events", "portraits", "brand", "mariage"];

const coverPath = file =>
  "assets/covers/" + encodeURIComponent(file).replace(/%2F/g, "/");

const fallbackPoster = index =>
  `assets/posters/poster-${String(index + 1).padStart(2, "0")}.svg`;

function youtubeId(url) {
  const value = String(url || "").trim();
  const match = value.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/);
  return match ? match[1] : "";
}

function embedUrl(url, options = {}) {
  const id = youtubeId(url);
  if (!id) return "";
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    ...options
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

document.querySelector("#year").textContent = new Date().getFullYear();

const projectList = document.querySelector("#projectList");
projectList.innerHTML = ORDER.map((category, categoryIndex) => {
  const projects = PROJECTS
    .map((project, originalIndex) => ({ ...project, originalIndex }))
    .filter(project => project.category === category);

  return `
    <section class="filmSection" id="${category}">
      <header class="sectionHeader">
        <span class="sectionNumber">0${categoryIndex + 1}</span>
        <h2>${LABELS[category]}</h2>
      </header>
      <div class="cleanGrid ${category}Grid">
        ${projects.map((project, index) => {
          const visualClass = project.format === "portrait" ? "portrait" : "landscape";
          return `
            <article class="projectItem ${visualClass} item-${index + 1}">
              <button class="projectCard" type="button" data-index="${project.originalIndex}" aria-label="Lire ${project.title}">
                <span class="projectImage">
                  <img src="${coverPath(project.cover)}" data-fallback="${fallbackPoster(project.originalIndex)}" alt="" loading="lazy" decoding="async">
                  <span class="playMark">Play</span>
                </span>
                <span class="projectCaption">
                  <span class="projectTitle">${project.title}</span>
                  <span class="projectMeta">${String(index + 1).padStart(2, "0")}</span>
                </span>
              </button>
            </article>`;
        }).join("")}
      </div>
    </section>`;
}).join("");

document.querySelectorAll(".projectImage img").forEach(image => {
  image.addEventListener("error", () => {
    if (image.dataset.fallback) image.src = image.dataset.fallback;
  }, { once: true });
});

const heroProject = PROJECTS[0];
const heroFrame = document.querySelector("#heroFrame");
heroFrame.src = embedUrl(heroProject.youtube, {
  autoplay: "1",
  mute: "1",
  controls: "0",
  loop: "1",
  playlist: youtubeId(heroProject.youtube),
  disablekb: "1",
  fs: "0"
});

document.querySelector(".heroOpen").addEventListener("click", () => openProject(0));

const viewer = document.querySelector(".viewer");
const viewerFrame = document.querySelector(".viewerFrame");
const viewerStage = document.querySelector(".viewerStage");
const viewerTitle = document.querySelector(".viewerTitle");
const viewerCategory = document.querySelector(".viewerCategory");
const viewerClose = document.querySelector(".viewerClose");
const fullFilmLink = document.querySelector(".fullFilmLink");

function openProject(index) {
  const project = PROJECTS[index];
  const youtube = String(project.youtube || "").trim();
  viewerTitle.textContent = project.title;
  viewerCategory.textContent = LABELS[project.category];
  viewerStage.classList.toggle("isPortrait", project.format === "portrait");
  fullFilmLink.href = youtube;
  viewerFrame.src = embedUrl(youtube, { autoplay: "1" });
  viewer.classList.add("isOpen");
  viewer.setAttribute("aria-hidden", "false");
  document.body.classList.add("modalOpen");
}

function closeProject() {
  viewerFrame.removeAttribute("src");
  viewerStage.classList.remove("isPortrait");
  viewer.classList.remove("isOpen");
  viewer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modalOpen");
}

document.querySelectorAll(".projectCard").forEach(card => {
  card.addEventListener("click", () => openProject(Number(card.dataset.index)));
});
viewerClose.addEventListener("click", closeProject);
viewer.addEventListener("click", event => { if (event.target === viewer) closeProject(); });
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && viewer.classList.contains("isOpen")) closeProject();
});
