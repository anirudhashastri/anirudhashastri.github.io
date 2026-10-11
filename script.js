const $ = (s, r = document) => r.querySelector(s),
  $$ = (s, r = document) => [...r.querySelectorAll(s)];
$$("[data-compare]").forEach((compare) => {
  const input = $("input", compare),
    pre = $(".pre", compare),
    line = $(".divider", compare),
    playBtn = $("[data-compare-play]", compare.closest(".case-visual"));
  const applyValue = (v) => {
    pre.style.clipPath = "inset(0 " + (100 - v) + "% 0 0)";
    line.style.left = v + "%";
  };
  input.addEventListener("input", () => applyValue(input.value));

  if (playBtn) {
    const LOW = 12,
      HIGH = 88,
      STEP_MS = 2600,
      RESUME_MS = 6000;
    let autoTimer = null,
      resumeTimer = null,
      playing = true,
      dir = 1;

    const updatePlayButton = () => {
      playBtn.textContent = playing ? "❚❚ Pause" : "▶ Play";
      playBtn.setAttribute("aria-pressed", String(playing));
    };
    const sweepTick = () => {
      const next = dir === 1 ? HIGH : LOW;
      dir *= -1;
      input.value = next;
      applyValue(next);
    };
    const startAuto = () => {
      clearInterval(autoTimer);
      compare.classList.add("auto");
      autoTimer = setInterval(sweepTick, STEP_MS);
    };
    const stopAuto = () => {
      clearInterval(autoTimer);
      compare.classList.remove("auto");
    };
    const scheduleResume = () => {
      clearTimeout(resumeTimer);
      resumeTimer = setTimeout(() => {
        playing = true;
        updatePlayButton();
        startAuto();
      }, RESUME_MS);
    };
    const pauseForManual = () => {
      if (!playing) return;
      playing = false;
      stopAuto();
      updatePlayButton();
      scheduleResume();
    };

    input.addEventListener("pointerdown", pauseForManual);
    input.addEventListener("keydown", pauseForManual);
    playBtn.addEventListener("click", () => {
      playing = !playing;
      updatePlayButton();
      clearTimeout(resumeTimer);
      if (playing) startAuto();
      else {
        stopAuto();
        scheduleResume();
      }
    });

    updatePlayButton();
    startAuto();
  }
});
const pipeline = $("[data-pipeline]");
if (pipeline) {
  const steps = $$(".pipeline-step", pipeline),
    stepImg = $("[data-step-img]"),
    detail = $("[data-pipeline-detail]"),
    playBtn = $("[data-pipeline-play]"),
    stepImages = [
      "assets/Diffusion_user_click.png",
      "assets/Diffusion_roi_crop.png",
      "assets/Diffusion_repeated_DDIM_sampling.png",
      "assets/Diffusion_prediction_output.png",
      "assets/Diffusion_prediction_uncetrainitypng.png",
    ],
    stepAlts = [
      "Step 1: User click — a single point marked near the tumor center on the CT slice.",
      "Step 2: ROI crop — a 50 × 50 × 50 mm volume extracted around the click.",
      "Step 3: DDIM sampling — multiple noise seeds denoised into candidate tumor masks.",
      "Step 4: Ensemble mean — candidate masks averaged and thresholded into a final segmentation.",
      "Step 5: Uncertainty map — voxel-wise variance across candidate predictions.",
    ],
    stepInfo = [
      "A clinician places a single point inside the suspected tumor on the CT slice — the only manual input the method needs.",
      "That click defines a compact 50 × 50 × 50 mm region of interest, keeping the diffusion model focused on local anatomy instead of the full scan.",
      "Accelerated DDIM sampling runs multiple reverse-diffusion passes inside the ROI from different noise seeds — 20 steps per pass, a 49.7× speedup over standard 1000-step inference.",
      "The candidate segmentations are averaged and thresholded at 0.5 into a final prediction mask.",
      "The per-voxel variance across candidates produces an uncertainty map — higher disagreement flags regions the model is less confident about.",
    ],
    AUTO_MS = 3200,
    RESUME_MS = 6000;
  let active = 0,
    autoTimer = null,
    resumeTimer = null,
    playing = true;

  const render = () => {
    steps.forEach((b, i) => b.classList.toggle("active", i === active));
    stepImg.src = stepImages[active];
    stepImg.alt = stepAlts[active];
    detail.textContent = stepInfo[active];
  };
  const updatePlayButton = () => {
    playBtn.textContent = playing ? "❚❚ Pause" : "▶ Play";
    playBtn.setAttribute("aria-pressed", String(playing));
  };
  const tick = () => {
    active = (active + 1) % steps.length;
    render();
  };
  const startAuto = () => {
    clearInterval(autoTimer);
    autoTimer = setInterval(tick, AUTO_MS);
  };
  const stopAuto = () => clearInterval(autoTimer);
  const scheduleResume = () => {
    clearTimeout(resumeTimer);
    resumeTimer = setTimeout(() => {
      playing = true;
      updatePlayButton();
      startAuto();
    }, RESUME_MS);
  };

  steps.forEach((b) =>
    b.addEventListener("click", () => {
      active = Number(b.dataset.step);
      render();
      playing = false;
      stopAuto();
      updatePlayButton();
      scheduleResume();
    }),
  );
  playBtn.addEventListener("click", () => {
    playing = !playing;
    updatePlayButton();
    clearTimeout(resumeTimer);
    if (playing) startAuto();
    else {
      stopAuto();
      scheduleResume();
    }
  });

  render();
  startAuto();
}
const modal = $("#modal"),
  body = $(".modal-body", modal),
  data = {
    diffusion: {
      title:
        "Interactive Lung Tumor Segmentation using Denoising Diffusion Models",
      problem:
        "Lung tumors can be small, heterogeneous, and difficult to delineate consistently on CT.",
      why: "Reliable, efficient segmentation matters for treatment planning, response assessment, and reproducible research.",
      approach:
        "A single user click defines a compact 50 × 50 × 50 mm region. Accelerated DDIM sampling produces multiple candidate segmentations, ensembled into a prediction and uncertainty map.",
      result:
        "3D mean Dice of 0.77 using 20 DDIM steps, with a 49.7× sampling speedup relative to 1000-step inference.",
      paperUrl: "assets/spie-diffusion-paper.pdf",
      posterUrl: "assets/spie-diffusion-poster.pdf",
      spieUrl:
        "https://www.spiedigitallibrary.org/conference-proceedings-of-spie/13927/139271G/Interactive-lung-tumor-segmentation-using-denoising-diffusion-models/10.1117/12.3088099.short",
    },
    registration: {
      title: "B-spline vs uniGradICON-AI Deformable Registration",
      problem:
        "Pre- and post-ablation CT scans differ because of patient motion, tissue change, and procedural effects.",
      why: "Accurate alignment is foundational for measuring ablation margins and relating treatment coverage to recurrence.",
      approach:
        "Classical B-spline registration and the uniGradICON foundation model are evaluated on accuracy and runtime for pre/post lung ablation CT.",
      result:
        "B-spline reached 0.43 mm TRE; uniGradICON reached 1.11 mm TRE with an approximately 7–10× runtime difference.",
      paperUrl: "assets/spie-registration-paper.pdf",
      posterUrl: "assets/spie-registration-poster.pdf",
      spieUrl:
        "https://www.spiedigitallibrary.org/conference-proceedings-of-spie/13927/139271K/Comparing-B-spline-and-uniGradICON-AI-foundational-deformable-image-registration/10.1117/12.3088146.short",
    },
    radiograph: {
      title: "Automated Detection of Bone Lesions and Fractures",
      problem:
        "Bone lesions and fractures on pelvic radiographs can be subtle and obscured by complex anatomy.",
      why: "Detection support may help surface difficult findings while making failure modes measurable and reviewable.",
      approach:
        "A Detectron2-based object detection pipeline with deliberate normal-image sampling and structured error analysis.",
      result:
        "A clinically grounded evaluation framework designed around both positive findings and normal studies.",
      presentationUrl: "assets/rsna-radiograph-presentation.pdf",
    },
  };
function project(key) {
  const p = data[key];
  body.style.padding = "";
  let actions = '<div class="case-actions">';
  if (p.paperUrl)
    actions += `<button data-pdf="${p.paperUrl}" data-pdf-title="${p.title} — Paper">Paper</button>`;
  if (p.posterUrl)
    actions += `<button data-pdf="${p.posterUrl}" data-pdf-title="${p.title} — Poster">Poster</button>`;
  if (p.presentationUrl)
    actions += `<button data-pdf="${p.presentationUrl}" data-pdf-title="${p.title} — Presentation">Presentation</button>`;
  actions += p.spieUrl
    ? `<a href="${p.spieUrl}" target="_blank" rel="noopener">View on SPIE</a>`
    : '<button data-placeholder>Official publication</button>';
  actions += "</div>";
  body.innerHTML =
    '<span class="modal-kicker">Research case study</span><h2>' +
    p.title +
    '</h2><div class="modal-grid"><section><h3>Clinical problem</h3><p>' +
    p.problem +
    "</p></section><section><h3>Why it matters</h3><p>" +
    p.why +
    "</p></section><section><h3>Approach</h3><p>" +
    p.approach +
    "</p></section><section><h3>Key result</h3><p>" +
    p.result +
    '</p></section></div><div class="workflow"><span>Clinical input</span>→<span>Computational method</span>→<span>Geometry + uncertainty</span>→<span>Clinical interpretation</span></div>' +
    actions;
  wire();
  modal.showModal();
}
function openPdf(url, title) {
  body.style.padding = "1.25rem";
  body.innerHTML =
    '<div class="pdf-reader"><div class="reader-controls"><span>' +
    title +
    '</span><a href="' +
    url +
    '" target="_blank" rel="noopener">Open in new tab ↗</a></div><iframe src="' +
    url +
    '" title="' +
    title +
    '"></iframe></div>';
  modal.showModal();
}
function wire() {
  $$("[data-placeholder]", body).forEach((b) => (b.onclick = toast));
  $$("[data-pdf]", body).forEach(
    (b) => (b.onclick = () => openPdf(b.dataset.pdf, b.dataset.pdfTitle)),
  );
}
$$("[data-project]").forEach(
  (b) => (b.onclick = () => project(b.dataset.project)),
);
$$("[data-pdf]").forEach(
  (b) => (b.onclick = () => openPdf(b.dataset.pdf, b.dataset.pdfTitle)),
);
$(".close").onclick = () => modal.close();
modal.onclick = (e) => {
  if (e.target === modal) modal.close();
};
const note = $("#toast");
function toast(e) {
  e && e.preventDefault();
  note.classList.add("show");
  clearTimeout(window.tt);
  window.tt = setTimeout(() => note.classList.remove("show"), 2400);
}
$$("[data-placeholder]").forEach((x) => (x.onclick = toast));
$(".menu").onclick = (e) => {
  const n = e.currentTarget.closest(".nav");
  n.classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", n.classList.contains("open"));
};
const themeButton = $(".theme-toggle");
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const dark = theme === "dark";
  themeButton.setAttribute("aria-pressed", dark);
  themeButton.setAttribute(
    "aria-label",
    dark ? "Switch to light theme" : "Switch to dark theme",
  );
}
const savedTheme = localStorage.getItem("rudha-theme");
applyTheme(savedTheme || "light");
themeButton.addEventListener("click", () => {
  const next =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("rudha-theme", next);
});
