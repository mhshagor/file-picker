document.addEventListener("DOMContentLoaded", () => {
    class ImagePicker {
        constructor(container) {
            this.container = container;
            this.files = [];
            this.isMultiple = container.dataset.multiple === "true";
            this.maxSizeMB = parseFloat(container.dataset.max || 2);
            this.inputName = container.dataset.name;
            this.inputId = container.dataset.id;
            this.type = container.dataset.type || "image"; // image or file
            this.accept = container.dataset.accept || "";
            this.preview = container.dataset.preview === "true";
            this.previewType = container.dataset.previewType || "grid"; // grid, list, dropdown, thumbnail
            this.value = container.dataset.value;

            this.init();
        }

        init() {
            this.createDropArea();
            this.createHiddenInput();
            this.createGallery();
            this.bindEvents();
            this.loadInitialValues();
        }

        /* ----------------- INITIAL VALUES ----------------- */
        loadInitialValues() {
            if (!this.value) return;

            let urls = [];
            try {
                const parsed = JSON.parse(this.value);
                urls = Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                urls =
                    typeof this.value === "string"
                        ? this.value.split(",")
                        : [this.value];
            }

            urls.forEach((url) => {
                const fileObj = {
                    name: url.split("/").pop(),
                    url,
                    existing: true,
                };
                if (!this.isMultiple) this.files = [fileObj];
                else this.files.push(fileObj);

                if (this.preview) {
                    if (this.previewType === "dropdown") {
                        this.updateDropdownUI();
                    } else {
                        this.gallery.appendChild(
                            this.renderExistingPreview(fileObj),
                        );
                    }
                }
            });

            this.attachFilesToForm();
        }

        /* ----------------- DROP AREA ----------------- */
        createDropArea() {
            this.dropArea = document.createElement("div");
            this.dropArea.className = "drop-area";

            this.dropArea.innerHTML = `
        <span class="drop-area-text">Drag & drop files or click to select</span>
        <div class="drop-trigger hidden" data-dropdown-trigger>
          <span class="file-count" data-count>0</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="drop-arrow" data-arrow fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>
      `;

            this.container.appendChild(this.dropArea);

            this.dropdownTrigger = this.dropArea.querySelector(
                "[data-dropdown-trigger]",
            );
            this.arrow = this.dropArea.querySelector("[data-arrow]");
            this.countBadge = this.dropArea.querySelector("[data-count]");
        }

        /* ----------------- FILE INPUT ----------------- */
        createHiddenInput() {
            this.fileInput = document.createElement("input");
            this.fileInput.type = "file";
            this.fileInput.accept = this.accept;
            if (this.isMultiple) this.fileInput.multiple = true;
            this.fileInput.hidden = true;
            this.fileInput.name = this.isMultiple
                ? this.inputName + "[]"
                : this.inputName;
            this.fileInput.id = this.inputId;

            this.dropArea.appendChild(this.fileInput);
        }

        /* ----------------- GALLERY ----------------- */
        createGallery() {
            this.gallery = document.createElement("div");
            this.gallery.className = "file-gallery";

            if (this.previewType === "dropdown") {
                this.gallery.className = "file-gallery dropdown divide-y";
                this.gallery.style.top = "100%";
                this.gallery.style.left = "0";
                this.container.classList.add("relative");

                // toggle dropdown
                this.dropdownTrigger.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.gallery.classList.toggle("show");
                    this.arrow.classList.toggle("rotate");
                });

                this.gallery.addEventListener("click", (e) =>
                    e.stopPropagation(),
                );
                document.addEventListener("click", () => {
                    this.gallery.classList.remove("show");
                    this.arrow.classList.remove("rotate");
                });
            } else if (["list", "file"].includes(this.previewType)) {
                this.gallery.className = "file-gallery list";
            }

            this.container.appendChild(this.gallery);
        }

        /* ----------------- EVENTS ----------------- */
        bindEvents() {
            // click to open file picker
            this.dropArea.addEventListener("click", () =>
                this.fileInput.click(),
            );

            // drag & drop
            ["dragenter", "dragover", "dragleave", "drop"].forEach((evt) =>
                this.dropArea.addEventListener(evt, (e) => e.preventDefault()),
            );
            ["dragenter", "dragover"].forEach(() =>
                this.dropArea.classList.add("border-blue-400"),
            );
            ["dragleave", "drop"].forEach(() =>
                this.dropArea.classList.remove("border-blue-400"),
            );

            this.dropArea.addEventListener("drop", (e) =>
                this.addFiles([...e.dataTransfer.files]),
            );
            this.fileInput.addEventListener("change", (e) =>
                this.addFiles([...e.target.files]),
            );
        }

        /* ----------------- ADD FILES ----------------- */
        addFiles(newFiles) {
            newFiles.forEach((file) => {
                if (this.type === "image" && !file.type.startsWith("image/")) {
                    showToast(
                        "error",
                        `Invalid file type. ${file.name} is not an image.`,
                    );
                    return;
                }

                if (file.size / 1024 / 1024 > this.maxSizeMB) {
                    showToast(
                        "error",
                        `File ${file.name} is too large. Max ${this.maxSizeMB}MB.`,
                    );
                    return;
                }

                if (!this.isMultiple) {
                    this.files = [file];
                    this.gallery.innerHTML = "";
                } else this.files.push(file);

                if (this.preview) {
                    if (this.previewType === "dropdown")
                        this.updateDropdownUI();
                    else this.gallery.appendChild(this.renderPreview(file));
                } else {
                    const div = document.createElement("div");
                    div.className = "file-item";
                    div.draggable = true;
                    const p = document.createElement("p");
                    p.textContent = file.name;
                    div.appendChild(p);
                    this.gallery.appendChild(div);
                }
            });

            this.attachFilesToForm();
        }

        /* ----------------- DROPDOWN UI ----------------- */
        updateDropdownUI() {
            this.dropdownTrigger.classList.toggle(
                "hidden",
                this.files.length === 0,
            );
            this.countBadge.textContent = this.files.length;
            this.gallery.innerHTML = "";

            this.files.forEach((file) => {
                const row = document.createElement("div");
                row.className = "file-item-row";

                const left = document.createElement("div");
                left.className = "file-info";

                if (this.type === "image") {
                    const img = document.createElement("img");
                    img.src = file.existing
                        ? file.url
                        : URL.createObjectURL(file);
                    img.className = "file-thumbnail";
                    left.appendChild(img);
                } else {
                    const icon = document.createElement("div");
                    icon.className = "file-extension-badge";
                    icon.textContent = file.name.split(".").pop().toUpperCase();
                    left.appendChild(icon);
                }

                const name = document.createElement("span");
                name.className = "file-name";
                name.textContent = file.name;
                left.appendChild(name);

                const remove = document.createElement("button");
                remove.type = "button";
                remove.innerHTML = "&times;";
                remove.className = "file-remove";
                remove.onclick = () => this.removeFile(file);

                row.appendChild(left);
                row.appendChild(remove);

                this.gallery.appendChild(row);
            });
        }

        /* ----------------- PREVIEWS ----------------- */
        renderPreview(file) {
            const div = document.createElement("div");
            div.className = "file-preview-item";
            div.draggable = true;

            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                this.checkPreviewType(div, reader, file);
            };

            div.appendChild(this.createRemoveBtn(file, div));
            return div;
        }

        renderExistingPreview(file) {
            const div = document.createElement("div");
            div.className = "file-preview-item";
            this.checkPreviewType(div, null, file, true);

            div.appendChild(this.createRemoveBtn(file, div));
            return div;
        }

        checkPreviewType(div, reader, file, existing = false) {
            const loader = document.createElement("div");
            loader.className = "file-loader";
            div.appendChild(loader);
            if (this.previewType === "grid") {
                const img = document.createElement("img");
                img.src = existing ? file.url : reader.result;
                img.className = "preview-grid";
                div.appendChild(img);
            } else if (this.previewType === "thumbnail") {
                const img = document.createElement("img");
                img.src = existing ? file.url : reader.result;
                img.className = "preview-thumb";
                div.appendChild(img);
            } else if (this.previewType === "list") {
                div.classList.add("list-box-item");
                const flexDiv = document.createElement("div");
                flexDiv.className = "preview-list";

                if (this.type === "image") {
                    const img = document.createElement("img");
                    img.src = existing ? file.url : reader.result;
                    img.className = "preview-list-item";
                    flexDiv.appendChild(img);
                }

                const p = document.createElement("p");
                p.textContent = file.name;
                p.className = "file-name";
                flexDiv.appendChild(p);

                div.appendChild(flexDiv);
            } else {
                div.classList.add("list-box-item");
                const left = document.createElement("div");
                left.className = "file-info";
                const icon = document.createElement("div");
                icon.className = "file-extension-badge";
                icon.textContent = file.name.split(".").pop().toUpperCase();
                left.appendChild(icon);
                const link = document.createElement("a");
                link.href = existing ? file.url : URL.createObjectURL(file);
                link.className = "file-link";
                link.target = "_blank";
                link.textContent = file.name;
                left.appendChild(link);
                div.appendChild(left);
            }
            loader.remove();
        }

        /* ----------------- REMOVE ----------------- */
        createRemoveBtn(fileObj, div = null) {
            const btn = document.createElement("button");
            btn.type = "button";
            btn.innerHTML = "&times;";
            btn.className = "file-remove";

            btn.onclick = (e) => {
                e.stopPropagation();
                this.removeFile(fileObj, div);
            };

            return btn;
        }

        removeFile(fileObj, div = null) {
            this.files = this.files.filter((f) => f !== fileObj);
            if (div) div.remove();
            if (this.previewType === "dropdown") this.updateDropdownUI();
            this.attachFilesToForm();
        }

        attachFilesToForm() {
            const dt = new DataTransfer();
            this.files.forEach((f) => !f.existing && dt.items.add(f));
            this.fileInput.files = dt.files;
        }

        showError(msg) {
            const existing = this.container.querySelector(
                ".image-picker-error",
            );
            if (existing) existing.remove();

            const div = document.createElement("div");
            div.className = "image-picker-error";
            div.textContent = msg;
            this.dropArea.parentNode.insertBefore(
                div,
                this.dropArea.nextSibling,
            );

            setTimeout(() => div.remove(), 5000);
        }
    }

    // init
    document
        .querySelectorAll(".image-picker")
        .forEach((c) => new ImagePicker(c));
});
