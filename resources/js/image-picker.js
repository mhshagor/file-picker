
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
            this.dropArea.className = `
        base-input border-dashed cursor-pointer bg-gray-100 
        hover:bg-gray-200 hover:border-blue-400 transition
        relative flex items-center justify-center px-3 py-3
    `;

            this.dropArea.innerHTML = `
        <span class="text-gray-500 text-xs pointer-events-none">
            Drag & drop files or click to select
        </span>

        <div class="absolute right-3 flex items-center gap-2 hidden" data-dropdown-trigger>
            <span class="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full" data-count>0</span>

            <svg xmlns="http://www.w3.org/2000/svg"
                 class="w-4 h-4 transition"
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
            this.gallery.className = "mt-1 flex flex-wrap gap-2";
            if (this.previewType === "dropdown") {
                this.gallery.className =
                    "absolute z-50 bg-white border rounded shadow mt-1 hidden w-full max-h-48 overflow-auto text-sm";
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
                    this.gallery.className = "mt-1 flex flex-col gap-2";
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
                    this.dropArea.classList.add("border-blue-400"),
                ),
            );
            ["dragleave", "drop"].forEach((event) =>
                this.dropArea.addEventListener(event, () =>
                    this.dropArea.classList.remove("border-blue-400"),
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
                        "relative group border border-gray-300 rounded-lg overflow-hidden p-1";
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
                    "flex justify-between items-center px-3 py-2 hover:bg-gray-100 gap-2";

                // left section
                const left = document.createElement("div");
                left.className =
                    "flex items-center gap-2 flex-1 overflow-hidden";

                // 👉 if image → show thumbnail
                if (this.type === "image") {
                    const img = document.createElement("img");
                    img.src = URL.createObjectURL(file);
                    img.className =
                        "w-8 h-8 object-cover rounded border shrink-0";
                    left.appendChild(img);
                }
                // 👉 else show extension badge
                else {
                    const icon = document.createElement("div");
                    icon.className =
                        "w-8 h-8 flex items-center justify-center rounded bg-gray-200 text-gray-600 text-xs shrink-0";
                    icon.textContent = file.name.split(".").pop().toUpperCase();
                    left.appendChild(icon);
                }

                // filename
                const name = document.createElement("span");
                name.className = "truncate text-xs";
                name.textContent = file.name;
                left.appendChild(name);

                // remove button
                const remove = document.createElement("button");
                remove.type = "button";
                remove.innerHTML = "&times;";
                remove.className =
                    "text-red-500 text-xs hover:text-red-700 shrink-0";

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
                "relative group border border-gray-300 rounded-lg overflow-hidden p-1 text-xs";
            div.draggable = true;

            // Modular preview rendering
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = () => {
                if (this.previewType === "grid") {
                    const img = document.createElement("img");
                    img.src = reader.result;
                    img.className = "w-24 h-24 object-cover rounded";
                    div.appendChild(img);
                } else if (this.previewType === "thumbnail") {
                    const img = document.createElement("img");
                    img.src = reader.result;
                    img.className = "w-12 h-12 object-cover rounded";
                    div.appendChild(img);
                } else if (this.previewType === "list") {
                    const flexDiv = document.createElement("div");
                    flexDiv.className = "flex items-center gap-2";
                    const img = document.createElement("img");
                    img.src = reader.result;
                    img.className = "w-6 h-6 object-cover rounded";
                    flexDiv.appendChild(img);
                    const p = document.createElement("p");
                    p.textContent = file.name;
                    p.className = "truncate";
                    flexDiv.appendChild(p);
                    div.appendChild(flexDiv);
                } else {
                    const link = document.createElement("a");
                    link.href = URL.createObjectURL(file);
                    link.className =
                        "text-blue-500 hover:text-blue-600 w-full block truncate ";
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
                "absolute top-1 right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition";
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
            errorDiv.className = 'image-picker-error text-red-500 text-xs mt-1 p-2 bg-red-50 border border-red-200 rounded';
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
