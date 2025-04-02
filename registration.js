const axios = require("axios");

const data = {
  email: "shreyasisaha74@gmail.com",
  name: "Shreyasi Saha",
  mobileNo: "9635782907",
  githubUsername: "ShreyasiSaha1",
  rollNo: "2206381",
  collegeName: "Kalinga Institute of Industrial Technology",
  accessCode: "nwpwrZ"
};

axios.post("http://20.244.56.144/evaluation-service/register", data)
  .then(response => {
    console.log("You have registered successfully:", response.data);
  })
  .catch(error => {
     console.error("Error:", error.response?.data || error.message);
  });
