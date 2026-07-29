const LABELS = {
  events: "Events",
  portraits: "Portraits / Docu",
  brand: "Brand",
  mariage: "Mariage"
};

const ORDER = ["events", "portraits", "brand", "mariage"];

const videoPath = file =>
  "assets/videos/" + encodeURIComponent(file).replace(/%2F/g, "/");

const coverPath = file =>
  "assets/covers/" + encodeURIComponent(file).replace(/%2F/g, "/");

const fallbackPoster = index =>
  `assets/posters/poster-${String(index + 1).padStart(2, "0")}.svg`;

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
              <button
                class="projectCard"
                type="button"
                data-index="${project.originalIndex}"
                aria-label="Lire ${project.title}"
              >
                <span class="projectImage">
                  <img
                    src="${coverPath(project.cover)}"
                    data-fallback="${fallbackPoster(project.originalIndex)}"
                    alt=""
                    loading="lazy"
                    decoding="async"
                  >
                  <span class="playMark">Play</span>
                </span>

                <span class="projectCaption">
                  <span class="projectTitle">${project.title}</span>
                  <span class="projectMeta">${String(index + 1).padStart(2, "0")}</span>
                </span>
              </button>
            </article>
          `;
        }).join("")}
      </div>
    </section>
  `;
}).join("");

document.querySelectorAll(".projectImage img").forEach(image => {
  image.addEventListener("error", () => {
    if (image.dataset.fallback) image.src = image.dataset.fallback;
  }, { once: true });
});

const heroProject = PROJECTS[0];
const heroVideo = document.querySelector("#heroVideo");
const soundToggle = document.querySelector(".soundToggle");

heroVideo.src = videoPath(heroProject.preview);
heroVideo.play().catch(() => {});

soundToggle.addEventListener("click", () => {
  heroVideo.muted = !heroVideo.muted;
  soundToggle.textContent = heroVideo.muted ? "Sound off" : "Sound on";
});

const viewer = document.querySelector(".viewer");
const viewerVideo = document.querySelector(".viewerVideo");
const viewerTitle = document.querySelector(".viewerTitle");
const viewerCategory = document.querySelector(".viewerCategory");
const viewerClose = document.querySelector(".viewerClose");
const fullFilmLink = document.querySelector(".fullFilmLink");

function openProject(index) {
  const project = PROJECTS[index];

  viewerTitle.textContent = project.title;
  viewerCategory.textContent = LABELS[project.category];
  viewerVideo.classList.toggle("isPortrait", project.format === "portrait");

  const youtube = String(project.youtube || "").trim();
  fullFilmLink.hidden = !youtube;
  if (youtube) fullFilmLink.href = youtube;
  else fullFilmLink.removeAttribute("href");

  viewer.classList.add("isOpen");
  viewer.setAttribute("aria-hidden", "false");
  document.body.classList.add("modalOpen");

  viewerVideo.src = videoPath(project.preview);
  viewerVideo.load();
  viewerVideo.play().catch(() => {});
}

function closeProject() {
  viewerVideo.pause();
  viewerVideo.removeAttribute("src");
  viewerVideo.load();
  viewerVideo.classList.remove("isPortrait");
  viewer.classList.remove("isOpen");
  viewer.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modalOpen");
}

document.querySelectorAll(".projectCard").forEach(card => {
  card.addEventListener("click", () => openProject(Number(card.dataset.index)));
});

viewerClose.addEventListener("click", closeProject);
viewer.addEventListener("click", event => {
  if (event.target === viewer) closeProject();
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && viewer.classList.contains("isOpen")) closeProject();
});
