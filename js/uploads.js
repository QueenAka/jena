function uploadMedia() {
  try {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.click();

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return alert("No file selected.");
      if (!file.type.startsWith("image/")) return alert("Invalid file type.");

      const url = URL.createObjectURL(file);
      const popup = document.createElement("div");
      const popupBg = document.createElement("div");
      popup.classList.add("popup");
      popupBg.classList.add("popup-bg");
      popupBg.id = "popup";

      const img = document.createElement("img");
      img.src = url;
      popup.appendChild(img);

      const upload = document.createElement("button");
      const cancel = document.createElement("button");
      upload.innerText = "Upload";
      cancel.innerText = "Cancel";
      cancel.classList.add("danger");

      cancel.onclick = () => {
        closePopup(popupBg);
      };

      upload.onclick = async () => {
        try {
          const formData = new FormData();
          formData.append("image", file);
          upload.setAttribute("disabled", "true");
          cancel.setAttribute("disabled", "true");
          img.classList.add("uploading");

          const loader = document.createElement("div");
          loader.classList.add("loader");
          popup.appendChild(loader);

          const response = await fetch("https://api.imgur.com/3/image", {
            method: "POST",
            headers: {
              Authorization: `Client-ID bf9d99a97d1fb4c`,
            },
            body: formData,
          });

          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "Upload failed");

          const imageUrl = data.data.link;
          await saveToDatabase(imageUrl);
          getUploads();
          balloons();
          closePopup(popupBg);
        } catch (error) {
          alert(`Upload failed: ${error.message}`);
        }
      };

      popup.appendChild(upload);
      popup.appendChild(cancel);
      popupBg.appendChild(popup);
      document.body.appendChild(popupBg);
    };
  } catch (error) {
    alert(`Unexpected error: ${error.message}`);
  }
}

async function saveToDatabase(imageUrl) {
  try {
    const response = await fetch("https://akadb.onrender.com/get/jena_images");
    const d = await response.json();
    const db = d.error ? [] : d.data;
    db.push(imageUrl);

    await fetch("https://akadb.onrender.com/post/jena_images", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(db),
    });
  } catch (error) {
    alert("Failed to save image to database.");
  }
}

function closePopup(popupBg) {
  popupBg.style.opacity = 0;
  setTimeout(() => {
    popupBg.remove();
  }, 150);
}

function getUploads() {
  fetch("https://akadb.onrender.com/get/jena_images")
    .then((res) => res.json())
    .then((data) => {
      const images = data.data || [];
      const holder = document.getElementById("images");
      holder.innerHTML = "";
      images.forEach((img) => {
        const imgElm = document.createElement("img");
        imgElm.src = img;
        imgElm.onclick = () => {
          imgElm.style.objectFit = "contain";
          imgElm.requestFullscreen();
          document.addEventListener("fullscreenchange", () => {
            if (!document.fullscreenElement) imgElm.style.objectFit = "";
          });
        };
        holder.appendChild(imgElm);
      });
    })
    .catch(() => alert("Failed to load uploads."));
}

getUploads();

function balloons() {
  const balloonCount = Math.floor(Math.random() * 100) + 100;
  const body = document.body;
  const balloonTypes = ["/media/balloon-green.png", "/media/balloon-blue.png"];
  for (let i = 0; i < balloonCount; i++) {
    const balloon = document.createElement("div");
    balloon.classList.add("balloon");
    balloon.style.backgroundImage = `url(${
      balloonTypes[Math.floor(Math.random() * balloonTypes.length)]
    })`;

    const delay = Math.random() * 500;
    const duration = Math.random() * 1000 + 1000;
    balloon.style.left = `${Math.random() * 100}vw`;
    balloon.style.animationDuration = `${duration}ms`;
    balloon.style.animationDelay = `${delay}ms`;
    body.appendChild(balloon);
    setTimeout(() => {
      balloon.remove();
    }, delay + duration);
  }
}
