require("dotenv").config();
const axios = require("axios");
const express = require("express");
const fs = require("fs");
const path = require("path");
const GITHUB_TOKEN = process.env.GITHUB;
const REPO_OWNER = "QueenAka";
const REPO_NAME = "jena";
const FILE_PATH = "media/uploads/meta.txt";
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
      console.log("Content is unchanged. No update required.");
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

    console.log(
      "File updated successfully:",
      updateResponse.data.commit.html_url
    );
  } catch (error) {
    console.error(
      "Error updating file:",
      error.response?.data || error.message
    );
  }
};

const newContent = "This is the updated content of the file!";
const commitMessage = "Updated file content via API";
updateGitHubFile(newContent, commitMessage);
