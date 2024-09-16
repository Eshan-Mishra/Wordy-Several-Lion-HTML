const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public')); // Serve static files from the 'public' directory


// CSV Writer setup
const csvWriter = createObjectCsvWriter({
  path: 'registrations.csv',
  header: [
    { id: 'name', title: 'Name' },
    { id: 'email', title: 'Email' },
    { id: 'shopName', title: 'Shop Name' },
    { id: 'space', title: 'Space' },
    { id: 'category', title: 'Category' },
    { id: 'description', title: 'Description' }
  ],
  append: true // Append to the file if it exists
});

// Route to handle form submissions
app.post('/register', (req, res) => {
  const { name, email, shopName, space, category, description } = req.body;

  if (!name || !email || !shopName || !space || !category || !description) {
    return res.status(400).send('All fields are required.');
  }

  // Write data to CSV
  csvWriter.writeRecords([{ name, email, shopName, space, category, description }])
    .then(() => {
      console.log('Data written to CSV file successfully.');
    })
    .catch(error => {
      console.error('Error writing to CSV file:', error);
      return res.status(500).send('Error saving data.');
    });

  // Set up the email transport configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use another email service if needed
    auth: {
      user: 'pablokian34@gmail.com', // Replace with your email
      pass: '@SHivr1252'   // Replace with your email password or use an app-specific password
    }
  });
  
  // Set up the email content
  const mailOptions = {
    from: 'pablokian34@gmail.com',
    to: email,
    subject: 'Thank you for registering!',
    text: `Dear ${name},\n\nThank you for registering your shop "${shopName}" for the event. We will review your details and contact you soon.\n\nBest regards,\nEvent Team`
  };
  
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
      return res.status(500).send('Error sending email.');
    }
  
    console.log('Email sent: ' + info.response);
    res.status(200).send('Registration successful, data saved to CSV, and email sent!');
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});