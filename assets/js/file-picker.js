/**
 * File Picker Component
 * Handles drag-and-drop file upload with multiple preview types
 */
document.addEventListener("DOMContentLoaded", () => {
    class FilePicker {
        constructor(originalContainer) {
            let container = originalContainer;
            this.isInputTag = container.tagName.toLowerCase() === "input";

            function getConf(attr) {
                if (container.hasAttribute(attr))
                    return container.getAttribute(attr);
                if (container.dataset[attr] !== undefined)
                    return container.dataset[attr];
                return null;
            }

            this.files = [];

            const multipleVal = getConf("multiple");
            this.isMultiple =
                multipleVal === "true" ||
                multipleVal === "multiple" ||
                (container.hasAttribute("multiple") &&
                    container.getAttribute("multiple") === "");

            this.maxSizeMB = parseFloat(getConf("max") || 2);
            this.inputName = getConf("name");
            this.inputId = getConf("id");
            this.type = getConf("type") || "image";
            this.accept = getConf("accept") || "";
            this.preview = getConf("preview") === "true";
            this.previewType = getConf("preview-type") || "grid";
            this.value = getConf("value");

            if (this.previewType === "profile") {
                this.isMultiple = false;
                this.type = "image";
                this.preview = true;
            }
            if (
                this.type === "file" &&
                !["list", "dropdown", "file"].includes(this.previewType)
            ) {
                this.previewType = "file";
            }

            if (this.isInputTag) {
                this.container = document.createElement("div");
                this.container.className = originalContainer.className;
                originalContainer.classList.remove("file-picker");
                originalContainer.parentNode.insertBefore(
                    this.container,
                    originalContainer,
                );
                this.fileInput = originalContainer;
            } else {
                this.container = originalContainer;
            }

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
                if (this.previewType === "profile") {
                    this.dropArea.innerHTML = `
                        <img src="${url}" class="sgd-preview-profile">
                    `;

                    this.dropArea.appendChild(this.fileInput);
                }
                const fileObj = {
                    name: url.split("/").pop(),
                    url,
                    existing: true,
                };
                if (!this.isMultiple) this.files = [fileObj];
                else this.files.push(fileObj);

                if (this.preview) {
                    if (this.previewType === "profile") {
                        // UI handled above
                    } else if (this.previewType === "dropdown") {
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
            this.dropArea.className = "sgd-drop-area";

            this.dropArea.innerHTML = `
                <span class="sgd-drop-area-text">Drag & drop files or click to select</span>
                <div class="sgd-drop-trigger sgd-hidden" data-dropdown-trigger>
                    <span class="sgd-file-count" data-count>0</span>
                    <svg xmlns="http://www.w3.org/2000/svg" class="sgd-drop-arrow" data-arrow fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            if (this.previewType === "profile") {
                this.dropArea.classList.add("sgd-profile-area");
            }
        }

        /* ----------------- FILE INPUT ----------------- */
        createHiddenInput() {
            if (!this.isInputTag) {
                this.fileInput = document.createElement("input");
            }
            this.fileInput.type = "file";
            if (this.accept) this.fileInput.accept = this.accept;

            if (this.isMultiple) {
                this.fileInput.multiple = true;
                let finalName = this.inputName || this.fileInput.name || "";
                if (finalName && !finalName.endsWith("[]")) {
                    finalName += "[]";
                }
                this.fileInput.name = finalName;
            } else {
                this.fileInput.multiple = false;
                if (this.inputName) this.fileInput.name = this.inputName;
            }

            this.fileInput.hidden = true;
            if (this.inputId) this.fileInput.id = this.inputId;

            this.dropArea.appendChild(this.fileInput);
        }

        /* ----------------- GALLERY ----------------- */
        createGallery() {
            // profile preview
            if (this.previewType === "profile") {
                return;
            }
            this.gallery = document.createElement("div");
            this.gallery.className = "sgd-file-gallery";

            if (this.previewType === "dropdown") {
                this.gallery.className =
                    "sgd-file-gallery sgd-dropdown sgd-divide-y";
                this.gallery.style.top = "100%";
                this.gallery.style.left = "0";
                this.container.classList.add("sgd-relative");

                // toggle dropdown
                this.dropdownTrigger.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.gallery.classList.toggle("sgd-show");
                    this.arrow.classList.toggle("sgd-rotate");
                });

                this.gallery.addEventListener("click", (e) =>
                    e.stopPropagation(),
                );
                document.addEventListener("click", () => {
                    this.gallery.classList.remove("sgd-show");
                    this.arrow.classList.remove("sgd-rotate");
                });
            } else if (["list", "file"].includes(this.previewType)) {
                this.gallery.className = "sgd-file-gallery sgd-list";
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
                this.dropArea.classList.add("sgd-border-blue-400"),
            );
            ["dragleave", "drop"].forEach(() =>
                this.dropArea.classList.remove("sgd-border-blue-400"),
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
                    /* this.showError(
                        `Invalid file type. ${file.name} is not an image.`,
                    ); */
                    this.showError(`Invalid file type.`);
                    return;
                }

                if (file.size / 1024 / 1024 > this.maxSizeMB) {
                    /* this.showError(
                        `File ${file.name} is too large. Max ${this.maxSizeMB}MB.`,
                    ); */
                    this.showError(`Selected file is too large.`);
                    return;
                }

                if (!this.isMultiple) {
                    this.files = [file];
                    if (this.gallery) this.gallery.innerHTML = "";
                } else this.files.push(file);

                if (this.preview) {
                    if (this.previewType === "profile") {
                        const reader = new FileReader();
                        reader.readAsDataURL(file);

                        reader.onload = () => {
                            this.dropArea.innerHTML = `
                                <img src="${reader.result}" class="sgd-preview-profile">
                            `;

                            this.dropArea.appendChild(this.fileInput);
                        };
                    } else if (this.previewType === "dropdown") {
                        this.updateDropdownUI();
                    } else {
                        this.gallery.appendChild(this.renderPreview(file));
                    }
                } else {
                    const div = document.createElement("div");
                    div.className = "sgd-file-item";
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
                "sgd-hidden",
                this.files.length === 0,
            );
            this.countBadge.textContent = this.files.length;
            this.gallery.innerHTML = "";

            this.files.forEach((file) => {
                const row = document.createElement("div");
                row.className = "sgd-file-item-row";

                const left = document.createElement("div");
                left.className = "sgd-file-info";

                if (this.type === "image") {
                    const img = document.createElement("img");
                    img.src = file.existing
                        ? file.url
                        : URL.createObjectURL(file);
                    img.className = "sgd-file-thumbnail";
                    left.appendChild(img);
                } else {
                    const icon = document.createElement("div");
                    icon.className = "sgd-file-extension-badge";
                    icon.textContent = file.name.split(".").pop().toUpperCase();
                    left.appendChild(icon);
                }

                const name = document.createElement("span");
                name.className = "sgd-file-name";
                name.textContent = file.name;
                left.appendChild(name);

                const remove = document.createElement("button");
                remove.type = "button";
                remove.innerHTML = "&times;";
                remove.className = "sgd-file-remove";
                remove.onclick = () => this.removeFile(file);

                row.appendChild(left);
                row.appendChild(remove);

                this.gallery.appendChild(row);
            });
        }

        /* ----------------- PREVIEWS ----------------- */
        renderPreview(file) {
            const div = document.createElement("div");
            div.className = "sgd-file-preview-item";
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
            div.className = "sgd-file-preview-item";
            this.checkPreviewType(div, null, file, true);

            div.appendChild(this.createRemoveBtn(file, div));
            return div;
        }

        checkPreviewType(div, reader, file, existing = false) {
            const loader = document.createElement("div");
            loader.className = "sgd-file-loader";
            div.appendChild(loader);
            if (this.previewType === "grid") {
                const img = document.createElement("img");
                img.src = existing ? file.url : reader.result;
                img.className = "sgd-preview-grid";
                div.appendChild(img);
            } else if (this.previewType === "thumbnail") {
                const img = document.createElement("img");
                img.src = existing ? file.url : reader.result;
                img.className = "sgd-preview-thumb";
                div.appendChild(img);
            } else if (this.previewType === "list") {
                div.classList.add("sgd-list-box-item");
                const flexDiv = document.createElement("div");
                flexDiv.className = "sgd-preview-list";

                if (this.type === "image") {
                    const img = document.createElement("img");
                    img.src = existing ? file.url : reader.result;
                    img.className = "sgd-preview-list-item";
                    flexDiv.appendChild(img);
                }

                const p = document.createElement("p");
                p.textContent = file.name;
                p.className = "sgd-file-name";
                flexDiv.appendChild(p);

                div.appendChild(flexDiv);
            } else {
                div.classList.add("sgd-list-box-item");
                const left = document.createElement("div");
                left.className = "sgd-file-info";
                const icon = document.createElement("div");
                icon.className = "sgd-file-extension-badge";
                icon.textContent = file.name.split(".").pop().toUpperCase();
                left.appendChild(icon);
                const link = document.createElement("a");
                link.href = existing ? file.url : URL.createObjectURL(file);
                link.className = "sgd-file-link";
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
            btn.className = "sgd-file-remove";

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
                ".sgd-file-picker-error",
            );
            if (existing) existing.remove();

            const div = document.createElement("div");
            div.className = "sgd-file-picker-error";
            div.textContent = msg;
            this.dropArea.parentNode.insertBefore(
                div,
                this.dropArea.nextSibling,
            );

            setTimeout(() => div.remove(), 5000);
        }
    }

    // init
    document.querySelectorAll(".file-picker").forEach((c) => new FilePicker(c));
});
