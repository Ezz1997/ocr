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
      firstName: "",
      lastName: "",
      middleName: "",
      dateOfBirth: "",
      countryOfBirth: "",
      placeOfBirth: "",
      gender: "",
      maritalStatus: "",
      currentAddress: "",
      passportNumber: "",
      countryOfIssuance: "",
      dateOfIssue: "",
      dateOfExpiry: "",
      phoneNumber: "",
      email: "",
      declaration: "",
      signature: "",
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
    const firstName = this.extractFirstName(text);
    const lastName = this.extractLastName(text);
    const middleName = this.extractMiddleName(text); // new
    const dateOfBirth = this.extractDateOfBirth(text);
    const countryOfBirth = this.extractCountryOfBirth(text);
    const placeOfBirth = this.extractPlaceOfBirth(text); // new
    const gender = this.extractGender(text); // new
    const maritalStatus = this.extractMaritalStatus(text); // new
    const passportNumber = this.extractPassportNumber(text);
    const countryOfIssuance = this.extractCountryOfIssuance(text); // new
    const dateOfIssue = this.extractDateOfIssue(text); // new
    const dateOfExpiry = this.extractDateOfExpiry(text); // new
    const phoneNumber = this.extractPhoneNumber(text); // new
    const email = this.extractEmail(text); // new
    const streetAddress = this.extractStreetAddress(text);
    const city = this.extractCity(text);
    const region = this.extractRegion(text);
    const postalCode = this.extractPostalCode(text);
    const country = this.extractCountry(text);
    const declaration = this.extractDeclaration(text);
    const signature = this.extractSignature(text);
    this.setState({
      isProcessing: false,
      firstName,
      lastName,
      middleName, // new
      dateOfBirth,
      countryOfBirth,
      placeOfBirth, // new
      gender, // new
      maritalStatus, // new
      passportNumber,
      countryOfIssuance, // new
      dateOfIssue, // new
      dateOfExpiry, // new
      phoneNumber, // new
      email, // new
      streetAddress,
      city,
      region,
      postalCode,
      country,
      declaration,
      signature,
      ocrText: text,
    });
  }

  extractDeclaration(text) {
    const declarationKeyword = "declaration";
    return this.extractFieldAfterKeyword(text, declarationKeyword);
  }

  extractSignature(text) {
    const signatureKeyword = "signature";
    return this.extractFieldAfterKeyword(text, signatureKeyword);
  }

  extractFirstName(text) {
    const firstNameKeyword = "first name";
    return this.extractFieldAfterKeyword(text, firstNameKeyword);
  }

  extractLastName(text) {
    const lastNameKeyword = "last name";
    return this.extractFieldAfterKeyword(text, lastNameKeyword);
  }

  extractDateOfBirth(text) {
    const dobKeyword = "date of birth";
    return this.extractFieldAfterKeyword(text, dobKeyword);
  }

  extractCountryOfBirth(text) {
    const countryOfBirthKeyword = "country of birth";
    return this.extractFieldAfterKeyword(text, countryOfBirthKeyword);
  }

  extractPassportNumber(text) {
    const passportNumberKeyword = "passport number";
    return this.extractFieldAfterKeyword(text, passportNumberKeyword);
  }
  // New extraction functions
  extractMiddleName(text) {
    const middleNameKeyword = "middle name";
    return this.extractFieldAfterKeyword(text, middleNameKeyword);
  }

  extractPlaceOfBirth(text) {
    const placeOfBirthKeyword = "place of birth";
    return this.extractFieldAfterKeyword(text, placeOfBirthKeyword);
  }

  extractGender(text) {
    const genderKeyword = "gender";
    return this.extractFieldAfterKeyword(text, genderKeyword);
  }

  extractMaritalStatus(text) {
    const maritalStatusKeyword = "marital status";
    return this.extractFieldAfterKeyword(text, maritalStatusKeyword);
  }

  extractCountryOfIssuance(text) {
    const countryOfIssuanceKeyword = "country of issuance";
    return this.extractFieldAfterKeyword(text, countryOfIssuanceKeyword);
  }

  extractDateOfIssue(text) {
    const dateOfIssueKeyword = "date of issue";
    return this.extractFieldAfterKeyword(text, dateOfIssueKeyword);
  }

  extractDateOfExpiry(text) {
    const dateOfExpiryKeyword = "date of expiry";
    return this.extractFieldAfterKeyword(text, dateOfExpiryKeyword);
  }

  extractPhoneNumber(text) {
    const phoneNumberKeyword = "phone number";
    return this.extractFieldAfterKeyword(text, phoneNumberKeyword);
  }

  extractEmail(text) {
    const emailKeyword = "email";
    return this.extractFieldAfterKeyword(text, emailKeyword);
  }

  extractStreetAddress(text) {
    const keyword = "street address";
    return this.extractFieldAfterKeyword(text, keyword);
  }

  extractCity(text) {
    const keyword = "city";
    return this.extractFieldAfterKeyword(text, keyword);
  }

  extractRegion(text) {
    const keyword = "region";
    return this.extractFieldAfterKeyword(text, keyword);
  }

  extractPostalCode(text) {
    const keyword = "postal code";
    return this.extractFieldAfterKeyword(text, keyword);
  }

  extractCountry(text) {
    const keyword = "country";
    return this.extractFieldAfterKeyword(text, keyword);
  }

  extractFieldAfterKeyword(text, keyword) {
    const lowerCaseText = text.toLowerCase();
    const lowerCaseKeyword = keyword.toLowerCase();
    const keywordIndex = lowerCaseText.indexOf(lowerCaseKeyword);

    if (keywordIndex !== -1) {
      const startIndex = keywordIndex + lowerCaseKeyword.length;
      const endIndex = lowerCaseText.indexOf("\n", startIndex);
      if (endIndex !== -1) {
        return text.substring(startIndex, endIndex).trim();
      } else {
        // If no new line character found, return the entire remaining text
        return text.substring(startIndex).trim();
      }
    }

    return "";
  }

  updateProgressAndLog(m) {
    const MAX_PERCENTAGE = 1;
    const DECIMAL_COUNT = 2;

    if (m.status === "recognizing text") {
      const pctg = (m.progress / MAX_PERCENTAGE) * 100;
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
                      ? `Processing Image (${this.state.pctg}%)`
                      : "Parsed Text"}
                  </span>
                </div>
              </div>
            </h5>
            <div className="card-body">
              <p className="card-text">
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

        {/* Personal Information */}
        <h2 className="white-text">Personal Information</h2>
        <p className="white-text">First Name: {this.state.firstName}</p>
        <p className="white-text">Middle Name: {this.state.middleName}</p>
        <p className="white-text">Last Name: {this.state.lastName}</p>
        <p className="white-text">Date of Birth: {this.state.dateOfBirth}</p>
        <p className="white-text">Country of Birth: {this.state.countryOfBirth}</p>
        <p className="white-text">Place of Birth: {this.state.placeOfBirth}</p>
        <p className="white-text">Gender: {this.state.gender}</p>
        <p className="white-text">Marital Status: {this.state.maritalStatus}</p>

        {/* Current Address */}
        <h2 className="white-text">Current Address</h2>
        <p className="white-text">Street Address: {this.state.streetAddress}</p>
        <p className="white-text">City: {this.state.city}</p>
        <p className="white-text">Region: {this.state.region}</p>
        <p className="white-text">Postal Code: {this.state.postalCode}</p>
        <p className="white-text">Country: {this.state.country}</p>

        {/* Passport Information */}
        <h2 className="white-text">Passport Information</h2>
        <p className="white-text">Passport Number: {this.state.passportNumber}</p>
        <p className="white-text">Country of Issuance: {this.state.countryOfIssuance}</p>
        <p className="white-text">Date of Issue: {this.state.dateOfIssue}</p>
        <p className="white-text">Date of Expiry: {this.state.dateOfExpiry}</p>

        {/* Contact Information */}
        <h2 className="white-text">Contact Information</h2>
        <p className="white-text">Phone Number: {this.state.phoneNumber}</p>
        <p className="white-text">Email: {this.state.email}</p>

        {/* Declaration */}
        {/* <h2>Declaration</h2>
        <p className="white-text">Declaration: {this.state.declaration}</p>
        <p className="white-text">Signature: {this.state.signature}</p> */}
      </div>
    );
  }
}

export default App;
