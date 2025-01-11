function uploadMedia() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();
  input.onchange = () => {
    const file = input.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const popup = document.createElement("div");
      const popupBg = document.createElement("div");
      popup.classList.add("popup");
      popupBg.classList.add("popup-bg");
      popupBg.id = "popup";
      const body = document.body;
      if (!file.type.startsWith("image/")) return alert("Invalid upload type");
      const img = document.createElement("img");
      img.src = url;
      popup.appendChild(img);
      const upload = document.createElement("button");
      const cancel = document.createElement("button");
      upload.innerText = "Upload";
      cancel.innerText = "Cancel";
      cancel.classList.add("danger");
      cancel.onclick = () => {
        popupBg.style.opacity = 0;
        setTimeout(() => {
          popupBg.remove();
        }, 150);
      };

      upload.onclick = () => {
        const formData = new FormData();
        formData.append("image", file);
        upload.setAttribute("disabled", "true");
        cancel.setAttribute("disabled", "true");
        img.classList.add("uploading");
        const loader = document.createElement("div");
        loader.classList.add("loader");
        popup.appendChild(loader);
        fetch("/api/upload", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if (data.error) {
              alert(`Error: ${data.error}`);
            } else {
              getUploads();
            }
            popupBg.style.opacity = 0;
            setTimeout(() => {
              popupBg.remove();
            }, 150);
          })
          .catch((error) => {
            alert(`Upload failed: ${error.message}`);
          });
      };

      popup.appendChild(upload);
      popup.appendChild(cancel);
      popupBg.appendChild(popup);
      body.appendChild(popupBg);
    }
  };
}

function getUploads() {
  fetch("/media/uploads/uploads.json")
    .then((res) => res.text())
    .then((data) => {
      const holder = document.getElementById("images");
      holder.innerHTML = "";
      const images = JSON.parse(data);
      images.uploads.forEach((img) => {
        const imgElm = document.createElement("img");
        imgElm.src = img;
        imgElm.onclick = () => {
          imgElm.style.objectFit = "contain";
          imgElm.requestFullscreen();
          const resetObjectFit = () => {
            if (!document.fullscreenElement) {
              imgElm.style.objectFit = "";
              document.removeEventListener("fullscreenchange", resetObjectFit);
            }
          };
          document.addEventListener("fullscreenchange", resetObjectFit);
        };
        holder.appendChild(imgElm);
      });
    });
}
getUploads();
