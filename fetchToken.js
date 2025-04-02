const axios = require("axios");

const data = {
  email: "shreyasisaha74@gmail.com",
  name: "Shreyasi Saha",
  rollNo: "2206381",
  accessCode: "nwpwrZ",
  clientID: "bfe0a2d3-35d1-40ae-acd2-214389e54b36",
  clientSecret: "mSAYRKmctxKYfWvZ"
};

axios.post("http://20.244.56.144/evaluation-service/auth", data)
  .then(response => {
    console.log("Successfully Received Access Token:", response.data.access_token);
  })
  .catch(error => {
    console.error("Error Found:", error.response?.data || error.message);
  });
