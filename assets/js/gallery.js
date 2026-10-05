// Photo galleries: open a photo in a full-screen viewer with previous and
// next buttons. Arrow keys move between photos and Escape closes the viewer.
// Without this script, each thumbnail links to the photo itself.
(function () {
  if (window.galleryViewer) return; // the script may be included more than once
  window.galleryViewer = true;

  var galleries = document.querySelectorAll("[data-gallery]");
  if (!galleries.length || typeof HTMLDialogElement !== "function") return;

  var dialog = document.createElement("dialog");
  dialog.className = "gallery-viewer";
  dialog.setAttribute("aria-label", "Photo viewer");
  dialog.innerHTML =
    '<img class="gallery-viewer-image" alt="">' +
    '<p class="gallery-viewer-count" aria-live="polite"></p>' +
    '<button type="button" class="gallery-viewer-close" aria-label="Close">×</button>' +
    '<button type="button" class="gallery-viewer-prev" aria-label="Previous photo">‹</button>' +
    '<button type="button" class="gallery-viewer-next" aria-label="Next photo">›</button>';
  document.body.appendChild(dialog);

  var image = dialog.querySelector(".gallery-viewer-image");
  var count = dialog.querySelector(".gallery-viewer-count");
  var links = [];
  var current = 0;

  var show = function (index) {
    current = (index + links.length) % links.length;
    var link = links[current];
    image.src = link.href;
    image.alt = link.querySelector("img").alt;
    count.textContent = (current + 1) + " of " + links.length;
  };

  for (var g = 0; g < galleries.length; g++) {
    (function (gallery) {
      var galleryLinks = gallery.querySelectorAll("a");
      for (var i = 0; i < galleryLinks.length; i++) {
        (function (index) {
          galleryLinks[index].addEventListener("click", function (event) {
            event.preventDefault();
            links = galleryLinks;
            show(index);
            dialog.showModal();
          });
        })(i);
      }
    })(galleries[g]);
  }

  dialog.querySelector(".gallery-viewer-close").addEventListener("click", function () { dialog.close(); });
  dialog.querySelector(".gallery-viewer-prev").addEventListener("click", function () { show(current - 1); });
  dialog.querySelector(".gallery-viewer-next").addEventListener("click", function () { show(current + 1); });

  // Clicking the dark background around the photo closes the viewer
  dialog.addEventListener("click", function (event) {
    if (event.target === dialog) dialog.close();
  });

  dialog.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });

  // Don't keep loading the last photo once the viewer is closed
  dialog.addEventListener("close", function () { image.removeAttribute("src"); });
})();
