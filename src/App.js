import React from "react";
import { createWorker } from "tesseract.js";
import { FilePond, registerPlugin } from "react-filepond";
import FilePondPluginImagePreview from "filepond-plugin-image-preview";
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.min.css";
import "filepond/dist/filepond.min.css";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

registerPlugin(FilePondPluginImagePreview);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isProcessing: false,
      ocrText: "",
      pctg: "0.00",
    };
    this.pond = React.createRef();
    this.worker = React.createRef();
    this.updateProgressAndLog = this.updateProgressAndLog.bind(this);
  }

  async doOCR(file) {
    this.setState({
      isProcessing: true,
      ocrText: "",
      pctg: "0.00",
    });
    await this.worker.load();
    await this.worker.loadLanguage("eng");
    await this.worker.initialize("eng");
    const {
      data: { text },
    } = await this.worker.recognize(file);
    const email = this.extractEmail(text);
    const phone = this.extractPhoneNumber(text);
    const github = this.extractGithub(text);
    const linkedin = this.extractLinkedin(text);
    const name = this.extractName(text);
    const education = this.extractInfo(text, "education");
    const skills = this.extractInfo(text, "technical skills");
    const experience = this.extractInfo(text, "professional experience");
    const volunteer = this.extractInfo(text, "volunteer experience");
    const languages = this.extractInfo(text, "languages");
    this.setState({
      isProcessing: false,
      email,
      phone,
      github,
      linkedin,
      name,
      education,
      skills,
      experience,
      volunteer,
      languages,
      ocrText: text,
    });
  }

  extractEmail(text) {
    const emailRegex = /\S+@\S+\.\S+/;
    const match = text.match(emailRegex);
    return match ? match[0] : "";
  }

  extractInfo(text, keyword) {
    const lowerCaseText = text.toLowerCase();
    const lowerCaseKeyword = keyword.toLowerCase();
    if (lowerCaseText.includes(lowerCaseKeyword)) {
      const startIndex =
        lowerCaseText.indexOf(lowerCaseKeyword) + lowerCaseKeyword.length;
      let endIndex = lowerCaseText.indexOf("\n", startIndex);
      while (endIndex !== -1 && lowerCaseText[endIndex + 1] === "•") {
        endIndex = lowerCaseText.indexOf("\n", endIndex + 1);
      }
      return text
        .substring(startIndex, endIndex === -1 ? undefined : endIndex)
        .trim();
    }
    return "";
  }

  extractPhoneNumber(text) {
    const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/;
    const match = text.match(phoneRegex);
    return match ? match[0] : "";
  }

  extractGithub(text) {
    const githubRegex = /github\.com\/[^\s]*/;
    const match = text.match(githubRegex);
    return match ? match[0] : "";
  }

  extractLinkedin(text) {
    const linkedinRegex = /linkedin\.com\/[^\s]*/;
    const match = text.match(linkedinRegex);
    return match ? match[0] : "";
  }

  extractName(text) {
    const nameRegex = /^[^\n]*/;
    const match = text.match(nameRegex);
    return match ? match[0] : "";
  }

  updateProgressAndLog(m) {
    // Maximum value out of which percentage needs to be
    // calculated. In our case it's 0 for 0 % and 1 for Max 100%
    // DECIMAL_COUNT specifies no of floating decimal points in our
    // Percentage
    var MAX_PARCENTAGE = 1;
    var DECIMAL_COUNT = 2;

    if (m.status === "recognizing text") {
      var pctg = (m.progress / MAX_PARCENTAGE) * 100;
      this.setState({
        pctg: pctg.toFixed(DECIMAL_COUNT),
      });
    }
  }
  async componentDidMount() {
    this.worker = await createWorker({
      logger: (m) => this.updateProgressAndLog(m),
    });

    // Loading tesseract.js functions
    await this.worker.load();
    // Loading language as 'English'
    await this.worker.loadLanguage("eng");
    await this.worker.initialize("eng");
  }

  openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      document.body.appendChild(video);
      const button = document.createElement("button");
      button.textContent = "Capture";
      button.onclick = () => this.captureImage(video);
      document.body.appendChild(button);
    } catch (error) {
      console.error("Failed to open camera:", error);
    }
  };

  captureImage = (video) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/png");
    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "capture.png", { type: "image/png" });
        this.doOCR(file);
      });
  };

  render() {
    return (
      <div className="App">
        <div className="container">
          <div style={{ marginTop: "10%" }} className="row">
            <div className="col-md-4"></div>
            <div className="col-md-4">
              <FilePond
                ref={(ref) => (this.pond = ref)}
                onaddfile={(err, file) => {
                  this.doOCR(file.file);
                }}
                onremovefile={(err, file) => {
                  this.setState({
                    ocrText: "",
                  });
                }}
              />
              <button onClick={this.openCamera}>Open Camera</button>
            </div>
            <div className="col-md-4"></div>
          </div>
          <div className="card">
            <h5 className="card-header">
              <div style={{ margin: "1%", textAlign: "left" }} className="row">
                <div className="col-md-12">
                  <i
                    className={
                      "fas fa-sync fa-2x " +
                      (this.state.isProcessing ? "fa-spin" : "")
                    }
                  ></i>{" "}
                  <span className="status-text">
                    {this.state.isProcessing
                      ? `Processing Image ( ${this.state.pctg} % )`
                      : "Parsed Text"}{" "}
                  </span>
                </div>
              </div>
            </h5>
            <div class="card-body">
              <p class="card-text">
                {this.state.isProcessing
                  ? "..........."
                  : this.state.ocrText.length === 0
                  ? "No Valid Text Found / Upload Image to Parse Text From Image"
                  : this.state.ocrText}
              </p>
            </div>
          </div>

          <div className="ocr-text"></div>
        </div>

        <p class="white-text">Name: {this.state.name}</p>
        <p class="white-text">Phone: {this.state.phone}</p>
        <p class="white-text">Email: {this.state.email}</p>
        <p class="white-text">Github: {this.state.github}</p>
        <p class="white-text">LinkedIn: {this.state.linkedin}</p>
        <p class="white-text">Education: {this.state.education}</p>
        <p class="white-text">Skills: {this.state.skills}</p>
        <p class="white-text">Experience: {this.state.experience}</p>
        <p class="white-text">Volunteer: {this.state.volunteer}</p>
        <p class="white-text">Languages: {this.state.languages}</p>
        <p class="white-text">Full text: {this.state.ocrText}</p>
      </div>
    );
  }
}

export default App;
