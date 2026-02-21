
document.addEventListener("DOMContentLoaded", () => {
    // image picker
    class ImagePicker {
        constructor(container) {
            this.container = container;
            this.files = [];
            this.isMultiple = container.dataset.multiple === "true";
            this.maxSizeMB = parseFloat(container.dataset.max || 2);
            this.inputName = container.dataset.name;
            this.inputId = container.dataset.id;
            this.type = container.dataset.type; // image or file
            this.accept = container.dataset.accept;
            this.preview = container.dataset.preview === "true";
            this.previewType = container.dataset.previewType || "grid"; // grid, list, file, thumbnail

            this.init();
        }

        init() {
            this.createDropArea();
            this.createHiddenInput();
            this.createGallery();
            this.bindEvents();
        }

        createDropArea() {
            this.dropArea = document.createElement("div");
            this.dropArea.className = 'base-input image-picker-drop-area';

            this.dropArea.innerHTML = `
        <span class="image-picker-drop-text">
            Drag & drop files or click to select
        </span>

        <div class="image-picker-dropdown-trigger hidden" data-dropdown-trigger>
            <span class="image-picker-count-badge" data-count>0</span>

            <svg xmlns="http://www.w3.org/2000/svg"
                 class="image-picker-arrow"
                 data-arrow
                 fill="none"
                 viewBox="0 0 24 24"
                 stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M19 9l-7 7-7-7"/>
            </svg>
        </div>
    `;

            this.container.appendChild(this.dropArea);

            // references
            this.dropdownTrigger = this.dropArea.querySelector(
                "[data-dropdown-trigger]",
            );
            this.arrow = this.dropArea.querySelector("[data-arrow]");
            this.countBadge = this.dropArea.querySelector("[data-count]");
        }

        createHiddenInput() {
            this.fileInput = document.createElement("input");
            this.fileInput.type = "file";
            this.fileInput.accept = this.accept;
            if (this.isMultiple) this.fileInput.multiple = true;
            this.fileInput.className = "hidden";
            this.fileInput.name = this.isMultiple
                ? this.inputName + "[]"
                : this.inputName;
            this.fileInput.id = this.inputId;
            this.dropArea.appendChild(this.fileInput);
        }

        createGallery() {
            this.gallery = document.createElement("div");
            this.gallery.className = "image-picker-gallery";
            if (this.previewType === "dropdown") {
                this.gallery.className =
                    "image-picker-gallery dropdown";
                this.gallery.style.top = "100%";
                this.gallery.style.left = "0";

                this.container.classList.add("relative");

                // toggle dropdown
                this.dropdownTrigger.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.gallery.classList.toggle("hidden");
                    this.arrow.classList.toggle("rotate-180");
                });

                document.addEventListener("click", () => {
                    this.gallery.classList.add("hidden");
                    this.arrow.classList.remove("rotate-180");
                });
            } else {
                if (["list", "file"].includes(this.previewType)) {
                    this.gallery.className = "image-picker-gallery list";
                }
            }
            this.container.appendChild(this.gallery);
        }

        bindEvents() {
            // Click to open file picker
            this.dropArea.addEventListener("click", () =>
                this.fileInput.click(),
            );

            // Drag & drop
            ["dragenter", "dragover", "dragleave", "drop"].forEach((event) =>
                this.dropArea.addEventListener(event, (e) =>
                    e.preventDefault(),
                ),
            );
            ["dragenter", "dragover"].forEach((event) =>
                this.dropArea.addEventListener(event, () =>
                    this.dropArea.classList.add("drag-over"),
                ),
            );
            ["dragleave", "drop"].forEach((event) =>
                this.dropArea.addEventListener(event, () =>
                    this.dropArea.classList.remove("drag-over"),
                ),
            );

            this.dropArea.addEventListener("drop", (e) =>
                this.addFiles([...e.dataTransfer.files]),
            );
            this.fileInput.addEventListener("change", (e) =>
                this.addFiles([...e.target.files]),
            );
        }

        addFiles(newFiles) {
            newFiles.forEach((file) => {
                // Type validation
                if (this.type === "image" && !file.type.startsWith("image/")) {
                    this.showError(`Invalid file type.`);
                    //showToast('error', `Invalid file type. ${file.name} is not an image.`);
                    return;
                }

                // Max size validation
                if (file.size / 1024 / 1024 > this.maxSizeMB) {
                    this.showError(`The file is too large.`);
                    //showToast('error', `File ${file.name} is too large. Maximum size is ${this.maxSizeMB} MB.`);
                    return;
                }

                if (!this.isMultiple) {
                    this.files = [file];
                    this.gallery.innerHTML = "";
                } else {
                    this.files.push(file);
                }

                if (this.preview) {
                    if (this.previewType === "dropdown") {
                        this.updateDropdownUI();
                    } else {
                        const div = this.renderPreview(file);
                        this.gallery.appendChild(div);
                    }
                } else {
                    const div = document.createElement("div");
                    div.className =
                        "image-picker-preview-item";
                    div.draggable = true;
                    const p = document.createElement("p");
                    p.textContent = file.name;
                    div.appendChild(p);
                    this.gallery.appendChild(div);
                }
            });

            this.attachFilesToForm();
        }
        updateDropdownUI() {
            // show trigger only if files exist
            if (this.files.length) {
                this.dropdownTrigger.classList.remove("hidden");
                this.countBadge.textContent = this.files.length;
            } else {
                this.dropdownTrigger.classList.add("hidden");
                this.gallery.classList.add("hidden");
            }

            this.gallery.innerHTML = "";

            this.files.forEach((file) => {
                const row = document.createElement("div");
                row.className =
                    "image-picker-dropdown-row";

                // left section
                const left = document.createElement("div");
                left.className =
                    "image-picker-dropdown-left";

                // 👉 if image → show thumbnail
                if (this.type === "image") {
                    const img = document.createElement("img");
                    img.src = URL.createObjectURL(file);
                    img.className =
                        "image-picker-thumbnail";
                    left.appendChild(img);
                }
                // 👉 else show extension badge
                else {
                    const icon = document.createElement("div");
                    icon.className =
                        "image-picker-file-icon";
                    icon.textContent = file.name.split(".").pop().toUpperCase();
                    left.appendChild(icon);
                }

                // filename
                const name = document.createElement("span");
                name.className = "image-picker-filename";
                name.textContent = file.name;
                left.appendChild(name);

                // remove button
                const remove = document.createElement("button");
                remove.type = "button";
                remove.innerHTML = "&times;";
                remove.className =
                    "image-picker-remove-btn dropdown";

                remove.onclick = () => {
                    this.files = this.files.filter((f) => f !== file);
                    this.updateDropdownUI();
                    this.attachFilesToForm();
                };

                row.appendChild(left);
                row.appendChild(remove);
                this.gallery.appendChild(row);
            });
        }
        renderPreview(file) {
            const div = document.createElement("div");
            div.className =
                "image-picker-preview-item";
            div.draggable = true;

            // Modular preview rendering
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                if (this.previewType === "grid") {
                    const img = document.createElement("img");
                    img.src = reader.result;
                    img.className = "image-picker-thumbnail grid";
                    div.appendChild(img);
                } else if (this.previewType === "thumbnail") {
                    const img = document.createElement("img");
                    img.src = reader.result;
                    img.className = "image-picker-thumbnail small";
                    div.appendChild(img);
                } else if (this.previewType === "list") {
                    const flexDiv = document.createElement("div");
                    flexDiv.className = "flex items-center gap-2";
                    const img = document.createElement("img");
                    img.src = reader.result;
                    img.className = "image-picker-thumbnail large";
                    flexDiv.appendChild(img);
                    const p = document.createElement("p");
                    p.textContent = file.name;
                    p.className = "image-picker-filename";
                    flexDiv.appendChild(p);
                    div.appendChild(flexDiv);
                } else {
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(file);
                    link.className =
                        "image-picker-file-link";
                    link.target = "_blank";
                    link.textContent = file.name;
                    div.appendChild(link);
                }
            };

            // Remove button
            const removeBtn = document.createElement("button");
            removeBtn.type = "button";
            removeBtn.innerHTML = "&times;";
            removeBtn.className =
                "image-picker-remove-btn";
            removeBtn.onclick = () => {
                this.files = this.files.filter((f) => f !== file);
                div.remove();
                this.attachFilesToForm();
            };

            div.appendChild(removeBtn);

            return div;
        }

        attachFilesToForm() {
            const dt = new DataTransfer();
            this.files.forEach((f) => dt.items.add(f));
            this.fileInput.files = dt.files;
        }

        showError(message) {
            // Remove existing error messages
            const existingError = this.container.querySelector('.image-picker-error');
            if (existingError) {
                existingError.remove();
            }

            // Create new error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'image-picker-error';
            errorDiv.textContent = message;
            
            // Insert error message after the drop area
            this.dropArea.parentNode.insertBefore(errorDiv, this.dropArea.nextSibling);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.remove();
                }
            }, 5000);
        }
    }

    // Initialize pickers
    document
        .querySelectorAll(".image-picker")
        .forEach((container) => new ImagePicker(container));
});
