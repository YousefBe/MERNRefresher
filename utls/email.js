const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Youssef Belal ${process.env.EMAIL_FROM}`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
        //production
      return 1;
    }
    return nodemailer.createTransport({
      //lazem t48al fl gmail less scure app option
      // service: 'Gmail',
      // auth : {
      //     user: process.env.GMAIL_USER,
      //     pass: process.env.PASSWORD
      // },
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async send(template , subject , message){


    const mailOptions = {
        from: this.from,
        to: this.to,
        subject: subject,
        text: message
      };


    await this.createTransport().sendMail(mailOptions)
  }

  async sendWelcome(){
    await this.send('welcome' , 'welcome to natourrrsss!');

  }
};

const sendEmail = async options => {
  const transporter = nodemailer.createTransport({
    //lazem t48al fl gmail less scure app option
    // service: 'Gmail',
    // auth : {
    //     user: process.env.GMAIL_USER,
    //     pass: process.env.PASSWORD
    // },
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  const mailOptions = {
    from: 'Youssef Belal joebelal7@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.text
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
