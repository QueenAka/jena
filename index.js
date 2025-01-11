require("dotenv").config();
const axios = require("axios");
const express = require("express");
const app = new express();
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const GITHUB_TOKEN = process.env.GITHUB;
const REPO_OWNER = "QueenAka";
const REPO_NAME = "jena";
const FILE_PATH = "site/media/uploads/uploads.json";
const BRANCH = "main";
const updateGitHubFile = async (newContent, commitMessage) => {
  try {
    const fileDetailsResponse = await axios.get(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      }
    );
    const { sha, content } = fileDetailsResponse.data;

    const base64Content = Buffer.from(newContent).toString("base64");

    if (content === base64Content) {
      return;
    }

    const updateResponse = await axios.put(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`,
      {
        message: commitMessage,
        content: base64Content,
        sha: sha,
        branch: BRANCH,
      },
      {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
      }
    );
  } catch (error) {
    console.error(
      "Error updating file:",
      error.response?.data || error.message
    );
  }
};

const uploadToImgur = async (imagePath) => {
  const clientId = process.env.IMGUR_CLIENT;
  const imageData = fs.readFileSync(imagePath, { encoding: "base64" });

  try {
    const response = await axios.post(
      "https://api.imgur.com/3/image",
      { image: imageData },
      {
        headers: {
          Authorization: `Client-ID ${clientId}`,
        },
      }
    );
    fs.unlinkSync(imagePath);
    return response.data.data.link;
  } catch (error) {
    console.error(
      "Error uploading image:",
      error.response?.data || error.message
    );
    fs.unlinkSync(imagePath);
    return { error: "Inavlid image type" };
  }
};

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "site/media/uploads"));
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only images are allowed"));
    }
  },
});

app.use(express.json());

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ error: "No file uploaded or invalid file type" });
  }

  uploadToImgur(`site/media/uploads/${req.file.filename}`).then((link) => {
    if (link.error) return res.json({ error: link.error });
    res.json({
      message: "File uploaded successfully",
      link: link,
    });
    const images = JSON.parse(
      fs.readFileSync(
        path.join(__dirname, "site/media/uploads/uploads.json"),
        "utf-8"
      )
    );
    images.uploads.push(link);
    fs.writeFileSync(
      path.join(__dirname, "site/media/uploads/uploads.json"),
      JSON.stringify(images)
    );
    updateGitHubFile(JSON.stringify(images), "New upload");
  });
});

app.use((err, req, res, next) => {
  if (
    err instanceof multer.MulterError ||
    err.message === "Only images are allowed"
  ) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

app.use(express.static(path.join(__dirname, "site"), { extensions: ["html"] }));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, "404.html"));
});

app.listen(3000, () => {
  console.log("App running!\nhttp://localhost:3000");
});
